import http from 'node:http';
import worker from '../dist/server/index.js';

http.createServer(async (req, res) => {
  try {
    const url = `http://127.0.0.1:4173${req.url}`;
    const request = new Request(url, { method: req.method, headers: req.headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: req, duplex: 'half' }) });
    const result = await worker.fetch(request, {}, {});
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res.writeHead(500); res.end('Preview unavailable.');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173/'));
