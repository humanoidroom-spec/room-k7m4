const COMMON_HEADERS = {
  'Cache-Control': 'public, max-age=300, must-revalidate',
  'CDN-Cache-Control': 'public, max-age=300',
  'Cloudflare-CDN-Cache-Control': 'public, max-age=300',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
};

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { ...COMMON_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', ...headers } });
}

function pathFor(url) {
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return null; }
  if (path.includes('\\') || path.includes('\0') || path.includes('%') || path.split('/').some(part => part === '..' || part === '.')) return null;
  if (path === '/index.html') return '/';
  return path;
}

export function createWorker(assets) {
  return {
    async fetch(request) {
      const url = new URL(request.url);
      const path = pathFor(url);
      // Only known current-design paths are served. PDFs, archives and source files stay absent.
      if (path === null || /(^|\/)versions(\/|$)|\.pdf(?:\/|$)/i.test(path)) return response('Not found.', 404);
      if (path === '/robots.txt') return response('User-agent: *\nAllow: /\n');
      if (!['GET', 'HEAD'].includes(request.method)) return response('Method not allowed.', 405, { 'Allow': 'GET, HEAD' });
      if (!Object.hasOwn(assets, path)) return response('Not found.', 404);
      const file = assets[path];
      const size = file.base64.length / 4 * 3 - (file.base64.endsWith('==') ? 2 : file.base64.endsWith('=') ? 1 : 0);
      const media = file.type.startsWith('video/');
      const headers = { 'Content-Type': file.type, 'Content-Length': String(size), ...(media ? { 'Accept-Ranges': 'bytes' } : {}) };
      if (request.method === 'HEAD') return response(null, 200, headers);
      // Video players use byte ranges for loading, seeking and replay.
      const range = media && !request.headers.has('If-Range') ? request.headers.get('Range')?.match(/^bytes=(\d*)-(\d*)$/) : null;
      if (range && (range[1] || range[2])) {
        const first = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
        const last = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
        if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last) || first >= size || last < first) {
          return response(null, 416, { ...headers, 'Content-Length': '0', 'Content-Range': `bytes */${size}` });
        }
        const bytes = Uint8Array.from(atob(file.base64), char => char.charCodeAt(0));
        return response(bytes.slice(first, last + 1), 206, { ...headers, 'Content-Length': String(last - first + 1), 'Content-Range': `bytes ${first}-${last}/${size}` });
      }
      const bytes = Uint8Array.from(atob(file.base64), char => char.charCodeAt(0));
      return response(bytes, 200, headers);
    },
  };
}
