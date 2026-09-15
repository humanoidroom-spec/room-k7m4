// Read { origin } from stdin and verify the public production surface.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { origin } = JSON.parse(input);
assert.equal(new URL(origin).protocol, 'https:');

async function fetchWithCurl(path, { method = 'GET', headers = {} } = {}) {
  const lines = ['silent', 'show-error', 'include', 'max-time = 30', `url = ${JSON.stringify(origin + path)}`, `request = ${JSON.stringify(method)}`];
  for (const [name, value] of Object.entries(headers)) lines.push(`header = ${JSON.stringify(`${name}: ${value}`)}`);
  const result = await new Promise((resolve, reject) => {
    const child = spawn('curl', ['--config', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks = [];
    child.stdout.on('data', chunk => chunks.push(chunk));
    child.stderr.resume();
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(Buffer.concat(chunks).toString('utf8')) : reject(new Error(`Request failed (${code})`)));
    child.stdin.end(lines.join('\n') + '\n');
  });
  const boundary = result.indexOf('\r\n\r\n');
  assert.ok(boundary >= 0, 'Missing HTTP headers');
  const parts = result.slice(0, boundary).split('\r\n');
  const status = Number(parts.shift().split(' ')[1]);
  const responseHeaders = new Headers();
  for (const part of parts) {
    const separator = part.indexOf(':');
    if (separator > 0) responseHeaders.append(part.slice(0, separator), part.slice(separator + 1).trim());
  }
  return { status, headers: responseHeaders, body: result.slice(boundary + 4) };
}

const page = await fetchWithCurl('/');
assert.equal(page.status, 200);
assert.match(page.body, /hero-v3/);
assert.doesNotMatch(page.body, /type=["']password|Lock preview/);
console.log('PASS anonymous visitors receive the ROOM page');

const assetPath = new URL(page.body.match(/src="([^" ]+\.js)"/)[1], origin + '/').pathname;
assert.equal((await fetchWithCurl(assetPath)).status, 200);
console.log('PASS page assets are public');

const videoPath = new URL(page.body.match(/<video[^>]*src="([^"]+)"/)[1], origin + '/').pathname;
const video = await fetchWithCurl(videoPath, { headers: { Range: 'bytes=0-31' } });
assert.equal(video.status, 206);
assert.match(video.headers.get('Content-Type'), /^video\/mp4/);
assert.match(video.headers.get('Content-Range'), /^bytes 0-31\/\d+$/);
assert.equal(video.headers.get('Content-Length'), '32');
console.log('PASS homepage video supports public byte-range playback');

for (const path of ['/room-paper.pdf', '/versions/v1/', '/versions/v1/room-paper.pdf', '/archive/room-paper.pdf', '/server/index.js']) {
  assert.equal((await fetchWithCurl(path)).status, 404, path);
}
console.log('PASS PDFs, old versions and server source remain unavailable');
