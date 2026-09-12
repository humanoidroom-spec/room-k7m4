import { configured, issueSession, sessionCookie, validSession, verifyPassword, toBase64Url } from './auth.mjs';
import { gatePage } from './gate.mjs';

const COMMON_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Cloudflare-CDN-Cache-Control': 'no-store',
  'Pragma': 'no-cache',
  'Vary': 'Cookie',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
};

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { ...COMMON_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', ...headers } });
}

function gate(message = '', status = 200, unavailable = false) {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  return response(gatePage(message, unavailable, nonce), status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': COMMON_HEADERS['Content-Security-Policy'].replace("script-src 'self'", `script-src 'nonce-${nonce}'`),
  });
}

async function limitedBody(request) {
  if (Number(request.headers.get('Content-Length') ?? 0) > 2048) return null;
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 2048) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}

function pathFor(url) {
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return null; }
  if (path.includes('\\') || path.includes('\0') || path.includes('%') || path.split('/').some(part => part === '..' || part === '.')) return null;
  if (path === '/index.html') return '/';
  return path;
}

export function createWorker(assets) {
  // Best-effort, bounded throttling per Worker isolate. The generated password has 192 bits of entropy.
  const attempts = new Map();
  function throttled(request) {
    const now = Date.now();
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    for (const [key, bucket] of attempts) if (bucket.until <= now) attempts.delete(key);
    let bucket = attempts.get(ip);
    if (!bucket) {
      if (attempts.size >= 4096) return true;
      bucket = { count: 0, until: now + 60000 };
      attempts.set(ip, bucket);
    }
    bucket.count += 1;
    return bucket.count > 10;
  }

  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const path = pathFor(url);
      // Only known V2 paths are ever served. PDF files and old versions remain absent even after login.
      if (path === null || /(^|\/)versions(\/|$)|\.pdf(?:\/|$)/i.test(path)) return response('Not found.', 404);
      if (path === '/robots.txt') return response('User-agent: *\nDisallow: /\n');
      if (!configured(env)) return gate('', 503, true);
      if (request.method === 'POST' && (path === '/access' || path === '/logout')) {
        if (request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return response('Forbidden.', 403);
        if (path === '/logout') return response(null, 303, { 'Location': '/', 'Set-Cookie': sessionCookie('', 0), 'Clear-Site-Data': '"cache"' });
        if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/x-www-form-urlencoded')) return response('Unsupported form.', 415);
        if (throttled(request)) return response('Too many attempts. Please wait a minute.', 429, { 'Retry-After': '60' });
        const body = await limitedBody(request);
        if (body === null) return response('Request too large.', 413);
        const values = new URLSearchParams(body).getAll('password');
        const json = request.headers.get('Accept')?.includes('application/json');
        if (values.length !== 1 || !await verifyPassword(values[0], env.ROOM_PASSWORD_VERIFIER)) {
          return json ? response('{"ok":false}', 401, { 'Content-Type': 'application/json' }) : gate('Incorrect password. Please try again.', 401);
        }
        const token = await issueSession(env, url.origin);
        if (json) return response('{"ok":true}', 200, { 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(token) });
        return response(null, 303, { 'Location': '/', 'Set-Cookie': sessionCookie(token) });
      }
      if (!['GET', 'HEAD'].includes(request.method)) return response('Method not allowed.', 405, { 'Allow': 'GET, HEAD' });
      if (!Object.hasOwn(assets, path)) return response('Not found.', 404);
      if (!await validSession(request, env)) {
        if (path === '/') {
          const result = gate();
          return request.method === 'HEAD' ? new Response(null, result) : result;
        }
        return response('Password required.', 401);
      }
      const file = assets[path];
      const bytes = request.method === 'HEAD' ? null : Uint8Array.from(atob(file.base64), char => char.charCodeAt(0));
      return response(bytes, 200, { 'Content-Type': file.type });
    },
  };
}
