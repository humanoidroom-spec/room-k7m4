import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createWorker } from '../server/worker.mjs';
import builtWorker from '../dist/server/index.js';

const origin = 'https://preview.example';
const assets = {
  '/': { type: 'text/html', base64: btoa('<h1>Public research</h1>') },
  '/assets/test.js': { type: 'text/javascript', base64: btoa('console.log("public")') },
  '/videos/test.mp4': { type: 'video/mp4', base64: btoa('0123456789') },
};

function request(path = '/', extra = {}) { return new Request(origin + path, extra); }

test('anonymous visitors can open the page and every published asset', async () => {
  const worker = createWorker(assets);
  const page = await worker.fetch(request());
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Public research/);
  assert.equal(page.headers.get('Set-Cookie'), null);
  const script = await worker.fetch(request('/assets/test.js'));
  assert.equal(script.status, 200);
  assert.match(await script.text(), /public/);
  const head = await worker.fetch(request('/assets/test.js', { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const robots = await worker.fetch(request('/robots.txt'));
  assert.match(await robots.text(), /Allow: \//);
});

test('write methods and excluded files remain unavailable', async () => {
  const worker = createWorker(assets);
  assert.equal((await worker.fetch(request('/access', { method: 'POST' }))).status, 405);
  for (const path of ['/room-paper.pdf', '/room-paper.pdf?download=1', '/versions/v1/', '/versions/v1/room-paper.pdf', '/%76ersions/v1/', '/room-paper%2epdf', '/archive/room-paper.pdf', '/server/worker.mjs', '/assets/../room-paper.pdf', '/%252e%252e/archive/room-paper.pdf', '/.env', '/%00']) {
    assert.equal((await worker.fetch(request(path))).status, 404, path);
  }
});

test('production bundle contains the public V3 page and only approved assets', async () => {
  const dirs = await readdir(new URL('../dist/', import.meta.url));
  assert.deepEqual(dirs.filter(name => name !== '.openai').sort(), ['server']);
  const response = await builtWorker.fetch(request());
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /hero-v3/);
  assert.doesNotMatch(html, /type=["']password|Lock preview|href=["'][^"']*\.pdf/i);
  const urls = new Set([...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]).filter(value => !/^https?:/.test(value)));
  for (const value of urls) {
    const path = new URL(value, origin + '/').pathname;
    const asset = await builtWorker.fetch(request(path));
    assert.equal(asset.status, 200, path);
    if (path.endsWith('.css')) {
      const css = await asset.text();
      for (const match of css.matchAll(/url\(["']?([^\)"']+)/g)) {
        if (match[1].startsWith('data:')) continue;
        const fontPath = new URL(match[1], origin + path).pathname;
        assert.equal((await builtWorker.fetch(request(fontPath))).status, 200, fontPath);
      }
    }
  }
  for (const path of ['/room-paper.pdf', '/versions/v1/', '/versions/v1/room-paper.pdf', '/server/index.js', '/assets/index-CrrmOYKR.js']) {
    assert.equal((await builtWorker.fetch(request(path))).status, 404, path);
  }
  const source = await readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /ROOM_PASSWORD_VERIFIER|ROOM_SESSION_SECRET|Password required|Lock preview/);
});

test('video ranges support public playback, seeking and HEAD', async () => {
  const worker = createWorker(assets);
  for (const [range, expected, contentRange] of [
    ['bytes=0-1', '01', 'bytes 0-1/10'],
    ['bytes=7-', '789', 'bytes 7-9/10'],
    ['bytes=-3', '789', 'bytes 7-9/10'],
    ['bytes=8-99', '89', 'bytes 8-9/10'],
  ]) {
    const result = await worker.fetch(request('/videos/test.mp4', { headers: { Range: range } }));
    assert.equal(result.status, 206);
    assert.equal(result.headers.get('Content-Range'), contentRange);
    assert.equal(result.headers.get('Content-Length'), String(expected.length));
    assert.equal(result.headers.get('Accept-Ranges'), 'bytes');
    assert.equal(await result.text(), expected);
  }
  for (const range of ['bytes=10-', 'bytes=7-3', 'bytes=-0']) {
    const result = await worker.fetch(request('/videos/test.mp4', { headers: { Range: range } }));
    assert.equal(result.status, 416);
    assert.equal(result.headers.get('Content-Range'), 'bytes */10');
  }
  const head = await worker.fetch(request('/videos/test.mp4', { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('Content-Length'), '10');
  assert.equal(await head.text(), '');
  const ignored = await worker.fetch(request('/videos/test.mp4', { headers: { Range: 'bytes=0-1', 'If-Range': 'unknown-validator' } }));
  assert.equal(ignored.status, 200);
  assert.equal(await ignored.text(), '0123456789');
});
