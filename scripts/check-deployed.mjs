// Read { origin, password } from stdin. Never log the password, cookie, or response headers.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { origin, password } = JSON.parse(input);
assert.equal(new URL(origin).protocol, 'https:');

async function fetchWithCurl(path, { method = 'GET', headers = {}, body } = {}) {
  const lines = ['silent', 'show-error', 'include', 'max-time = 30', `url = ${JSON.stringify(origin + path)}`, `request = ${JSON.stringify(method)}`];
  for (const [name, value] of Object.entries(headers)) lines.push(`header = ${JSON.stringify(`${name}: ${value}`)}`);
  if (body !== undefined) lines.push(`data = ${JSON.stringify(body)}`);
  const result = await new Promise((resolve, reject) => {
    const child = spawn('curl', ['--config', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks = [];
    child.stdout.on('data', chunk => chunks.push(chunk));
    child.stderr.resume();
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(Buffer.concat(chunks).toString('utf8')) : reject(new Error(`Request failed (${code})`)));
    child.stdin.end(lines.join('\n') + '\n');
  });
  let rest = result;
  let status;
  let responseHeaders;
  do {
    const boundary = rest.indexOf('\r\n\r\n');
    assert.ok(boundary >= 0, 'Missing HTTP headers');
    const parts = rest.slice(0, boundary).split('\r\n');
    status = Number(parts.shift().split(' ')[1]);
    responseHeaders = new Headers();
    for (const part of parts) {
      const separator = part.indexOf(':');
      if (separator > 0) responseHeaders.append(part.slice(0, separator), part.slice(separator + 1).trim());
    }
    rest = rest.slice(boundary + 4);
  } while (rest.startsWith('HTTP/'));
  return { status, headers: responseHeaders, body: rest };
}

const publicPage = await fetchWithCurl('/');
assert.equal(publicPage.status, 200, 'Password gate must be publicly reachable');
assert.match(publicPage.body, /type="password"/);
assert.doesNotMatch(publicPage.body, /hero-v3|Human gaze\. Human gesture/);
assert.match(publicPage.headers.get('Cache-Control'), /no-store/);
console.log('PASS anonymous visitors see only the password gate');

const loginHeaders = { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded' };
const wrong = await fetchWithCurl('/access', { method: 'POST', headers: loginHeaders, body: 'password=incorrect' });
assert.equal(wrong.status, 401, 'Incorrect passwords must fail');
const login = await fetchWithCurl('/access', { method: 'POST', headers: loginHeaders, body: new URLSearchParams({ password }).toString() });
assert.equal(login.status, 303, 'Correct password must unlock the preview');
const cookie = login.headers.get('Set-Cookie');
assert.ok(cookie?.includes('HttpOnly') && cookie.includes('Secure') && cookie.includes('SameSite=Strict'));
const authHeaders = { Cookie: cookie.split(';')[0] };
const page = await fetchWithCurl('/', { headers: authHeaders });
assert.equal(page.status, 200);
assert.match(page.body, /hero-v3/);
assert.doesNotMatch(page.body, /href=["'][^"']*\.pdf/i);
console.log('PASS correct password reveals V3 and incorrect password is rejected');

const assetPath = new URL(page.body.match(/src="([^" ]+\.js)"/)[1], origin + '/').pathname;
assert.equal((await fetchWithCurl(assetPath)).status, 401);
assert.equal((await fetchWithCurl(assetPath, { headers: authHeaders })).status, 200);
console.log('PASS scripts require a valid authenticated session');

const videoPath = new URL(page.body.match(/<video[^>]*src="([^"]+)"/)[1], origin + '/').pathname;
assert.equal((await fetchWithCurl(videoPath, { headers: { Range: 'bytes=0-31' } })).status, 401);
const video = await fetchWithCurl(videoPath, { headers: { ...authHeaders, Range: 'bytes=0-31' } });
assert.equal(video.status, 206);
assert.match(video.headers.get('Content-Type'), /^video\/mp4/);
assert.match(video.headers.get('Content-Range'), /^bytes 0-31\/\d+$/);
assert.equal(video.headers.get('Content-Length'), '32');
assert.match(video.headers.get('Cache-Control'), /no-store/);
console.log('PASS homepage video supports authenticated byte-range playback');


for (const path of ['/room-paper.pdf', '/versions/v1/', '/versions/v1/room-paper.pdf', '/archive/room-paper.pdf', '/server/index.js']) {
  assert.equal((await fetchWithCurl(path)).status, 404, path);
  assert.equal((await fetchWithCurl(path, { headers: authHeaders })).status, 404, path);
}
console.log('PASS PDF files, V1 and server source are unavailable with or without the password');

const logout = await fetchWithCurl('/logout', { method: 'POST', headers: { ...authHeaders, Origin: origin } });
assert.equal(logout.status, 303);
assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
console.log('PASS logout clears the browser session');
