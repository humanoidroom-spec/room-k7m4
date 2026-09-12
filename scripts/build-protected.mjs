import { build } from 'vite';
import { readFile, readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const client = path.join(root, 'tmp/protected-client');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8' };
const assets = {};
async function collect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    const relative = path.relative(client, filename).split(path.sep).join('/');
    if (item.isSymbolicLink()) throw new Error(`Unexpected symlink: ${relative}`);
    if (/(^|\/)versions(\/|$)|\.pdf$/i.test(relative)) throw new Error(`Private archive entered client build: ${relative}`);
    if (item.isDirectory()) { await collect(filename); continue; }
    // Include only the page, favicon, and required visual/runtime assets; no arbitrary public files.
    if (!(relative === 'index.html' || relative === 'favicon.svg' || /^(assets|fonts|videos)\//.test(relative))) continue;
    const type = types[path.extname(relative)];
    if (!type) continue;
    assets[relative === 'index.html' ? '/' : `/${relative}`] = { type, base64: (await readFile(filename)).toString('base64') };
  }
}
await collect(client);
if (!assets['/']) throw new Error('Missing V3 page');
const html = Buffer.from(assets['/'].base64, 'base64').toString('utf8');
if (/href=["'][^"']*\.pdf/i.test(html)) throw new Error('PDF link remains in V3');
if (!html.includes('hero-v3')) throw new Error('Wrong design version');
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist/.openai'), { recursive: true });
await writeFile(path.join(root, 'dist/.openai/hosting.json'), await readFile(path.join(root, '.openai/hosting.json')));
const entry = path.join(root, 'tmp/protected-entry.mjs');
await writeFile(entry, `import { createWorker } from '../server/worker.mjs';\nexport default createWorker(${JSON.stringify(assets)});\n`);
await build({ configFile: false, publicDir: false, build: { ssr: entry, outDir: path.join(root, 'dist/server'), emptyOutDir: true, minify: true, sourcemap: false, rollupOptions: { output: { entryFileNames: 'index.js', inlineDynamicImports: true } } } });
// No dist/client or other static output: every byte is served only by the authenticated Worker.
await rm(client, { recursive: true, force: true });
await rm(entry);
console.log(`Protected Worker built with ${Object.keys(assets).length} V3 assets. No PDFs or old versions packaged.`);
