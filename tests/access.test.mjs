import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createPasswordVerifier, issueSession, COOKIE_NAME, SESSION_SECONDS, toBase64Url } from '../server/auth.mjs';
import { createWorker } from '../server/worker.mjs';
import builtWorker from '../dist/server/index.js';

const origin = 'https://preview.example';
const password = toBase64Url(crypto.getRandomValues(new Uint8Array(24)));
const assets = {
  '/': { type: 'text/html', base64: btoa('<h1>Protected research</h1>') },
  '/assets/test.js': { type: 'text/javascript', base64: btoa('console.log("private")') },
};
let env;
before(async () => {
  env = { ROOM_PASSWORD_VERIFIER: await createPasswordVerifier(password), ROOM_SESSION_SECRET: toBase64Url(crypto.getRandomValues(new Uint8Array(32))) };
});
function request(path = '/', extra = {}) { return new Request(origin + path, extra); }
function login(worker, input = password, options = {}) {
  return worker.fetch(request('/access', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded', ...options.headers }, body: new URLSearchParams({ password: input }) }), env);
}
function cookie(response) { return response.headers.get('Set-Cookie').split(';')[0]; }

test('anonymous visitors receive only the gate; assets and HEAD requests require authentication', async () => {
  const worker = createWorker(assets);
  const page = await worker.fetch(request(), env);
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(html, /type="password"/);
  assert.doesNotMatch(html, /Protected research/);
  for (const method of ['GET', 'HEAD']) {
    const response = await worker.fetch(request('/assets/test.js', { method }), env);
    assert.equal(response.status, 401);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
  }
});

test('correct password creates a secure cookie; wrong passwords reveal no content', async () => {
  const worker = createWorker(assets);
  assert.equal((await login(worker, 'wrong-password')).status, 401);
  const unlocked = await login(worker);
  assert.equal(unlocked.status, 303);
  assert.equal(unlocked.headers.get('Location'), '/');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', `Max-Age=${SESSION_SECONDS}`]) assert.ok(unlocked.headers.get('Set-Cookie').includes(flag));
  for (const path of ['/', '/index.html', '/assets/test.js']) {
    const result = await worker.fetch(request(path, { headers: { Cookie: cookie(unlocked) } }), env);
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('CDN-Cache-Control'), 'no-store');
  }
});

test('tampered, expired, wrong-origin and duplicated cookies cannot unlock content', async () => {
  const worker = createWorker(assets);
  const now = Math.floor(Date.now() / 1000);
  const good = await issueSession(env, origin);
  const candidates = [
    `${good.slice(0, -8)}tampered`,
    await issueSession(env, origin, now - SESSION_SECONDS - 1),
    await issueSession(env, 'https://another.example'),
    'fake.signature',
  ];
  for (const token of candidates) assert.equal((await worker.fetch(request('/assets/test.js', { headers: { Cookie: `${COOKIE_NAME}=${token}` } }), env)).status, 401);
  assert.equal((await worker.fetch(request('/assets/test.js', { headers: { Cookie: `${COOKIE_NAME}=${good}; ${COOKIE_NAME}=${good}` } }), env)).status, 401);
  const rotated = { ...env, ROOM_PASSWORD_VERIFIER: await createPasswordVerifier(password + 'rotated') };
  assert.equal((await worker.fetch(request('/assets/test.js', { headers: { Cookie: `${COOKIE_NAME}=${good}` } }), rotated)).status, 401);
});

test('cross-site submissions, oversized bodies and bursts are rejected; logout clears the cookie', async () => {
  const worker = createWorker(assets);
  assert.equal((await login(worker, password, { headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await login(worker, 'x'.repeat(3000))).status, 413);
  for (let i = 0; i < 10; i++) await login(worker, 'wrong');
  const blocked = await login(worker);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('Retry-After'), '60');
  const locked = await worker.fetch(request('/logout', { method: 'POST', headers: { Origin: origin } }), env);
  assert.equal(locked.status, 303);
  assert.match(locked.headers.get('Set-Cookie'), /Max-Age=0/);
});

test('PDFs, old versions, encoded paths and source files stay unavailable after login', async () => {
  const worker = createWorker(assets);
  const headers = { Cookie: cookie(await login(worker)) };
  for (const path of ['/room-paper.pdf', '/room-paper.pdf?download=1', '/versions/v1/', '/versions/v1/room-paper.pdf', '/%76ersions/v1/', '/room-paper%2epdf', '/archive/room-paper.pdf', '/server/worker.mjs', '/assets/../room-paper.pdf', '/%252e%252e/archive/room-paper.pdf', '/.env', '/%00']) {
    assert.equal((await worker.fetch(request(path, { headers }), env)).status, 404, path);
    assert.equal((await worker.fetch(request(path), env)).status, 404, path);
  }
});

test('missing secrets fail closed', async () => {
  assert.equal((await createWorker(assets).fetch(request(), {})).status, 503);
});

test('production bundle contains only protected V2; all referenced page assets pass through the gate', async () => {
  const dirs = await readdir(new URL('../dist/', import.meta.url));
  assert.deepEqual(dirs.sort(), ['.openai', 'server']);
  const unlocked = await login(builtWorker);
  assert.equal(unlocked.status, 303);
  const headers = { Cookie: cookie(unlocked) };
  const page = await builtWorker.fetch(request(), env);
  assert.doesNotMatch(await page.text(), /hero-signal-system|Human gaze\. Human gesture/);
  const html = await (await builtWorker.fetch(request('/', { headers }), env)).text();
  assert.match(html, /hero-signal-system/);
  assert.doesNotMatch(html, /href=["'][^"']*\.pdf/i);
  const urls = new Set([...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]).filter(value => !/^https?:/.test(value)));
  for (const value of urls) {
    const path = new URL(value, origin + '/').pathname;
    const authed = await builtWorker.fetch(request(path, { headers }), env);
    assert.equal(authed.status, 200, path);
    if (path !== '/') assert.equal((await builtWorker.fetch(request(path), env)).status, 401, path);
    if (path.endsWith('.css')) {
      const css = await authed.text();
      for (const match of css.matchAll(/url\(["']?([^\)"']+)/g)) {
        if (match[1].startsWith('data:')) continue;
        const fontPath = new URL(match[1], origin + path).pathname;
        assert.equal((await builtWorker.fetch(request(fontPath, { headers }), env)).status, 200, fontPath);
        assert.equal((await builtWorker.fetch(request(fontPath), env)).status, 401, fontPath);
      }
    }
  }
  for (const path of ['/room-paper.pdf', '/versions/v1/', '/versions/v1/room-paper.pdf', '/server/index.js', '/assets/index-CrrmOYKR.js']) {
    assert.equal((await builtWorker.fetch(request(path, { headers }), env)).status, 404, path);
  }
  const source = await readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8');
  assert.ok(!source.includes(password));
  assert.ok(!source.includes(env.ROOM_PASSWORD_VERIFIER));
});
