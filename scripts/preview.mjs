import http from 'node:http';
import worker from '../dist/server/index.js';
import { createPasswordVerifier, toBase64Url } from '../server/auth.mjs';

const env = { ROOM_PASSWORD_VERIFIER: process.env.ROOM_PASSWORD_VERIFIER, ROOM_SESSION_SECRET: process.env.ROOM_SESSION_SECRET };
if (!env.ROOM_PASSWORD_VERIFIER || !env.ROOM_SESSION_SECRET) {
  const password = toBase64Url(crypto.getRandomValues(new Uint8Array(24)));
  env.ROOM_PASSWORD_VERIFIER = await createPasswordVerifier(password);
  env.ROOM_SESSION_SECRET = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  console.log(`Temporary local preview password: ${password}`);
}
http.createServer(async (req, res) => {
  try {
    const url = `http://127.0.0.1:4173${req.url}`;
    const request = new Request(url, { method: req.method, headers: req.headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: req, duplex: 'half' }) });
    const result = await worker.fetch(request, env, {});
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res.writeHead(500); res.end('Preview unavailable.');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173/'));
