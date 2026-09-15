import { spawn } from 'node:child_process';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'docs');

const allowedRootFiles = new Set(['index.html', 'favicon.svg', '.nojekyll']);
const allowedExtensions = new Map([
  ['assets', new Set(['.avif', '.css', '.gif', '.jpeg', '.jpg', '.js', '.png', '.svg', '.webp', '.woff', '.woff2'])],
  ['fonts', new Set(['.txt', '.woff', '.woff2'])],
  ['videos', new Set(['.mp4', '.webm'])],
]);

function isPublishable(relative) {
  const normalized = relative.split(path.sep).join('/');
  if (!normalized.includes('/')) return allowedRootFiles.has(normalized);
  const [directory] = normalized.split('/');
  return allowedExtensions.get(directory)?.has(path.extname(normalized).toLowerCase()) ?? false;
}

async function removeUnpublishedFiles(directory = output) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    const relative = path.relative(output, filename);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in docs: ${relative}`);
    if (entry.isDirectory()) {
      await removeUnpublishedFiles(filename);
      if ((await readdir(filename)).length === 0) await rm(filename, { recursive: true });
    } else if (!isPublishable(relative)) {
      await rm(filename);
    }
  }
}

async function prerender() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts/prerender.mjs'), 'docs/index.html'], {
      cwd: root,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Prerender failed with exit code ${code}`)));
  });
}

await rm(output, { recursive: true, force: true });
await build({ root, build: { outDir: output, emptyOutDir: true } });
await removeUnpublishedFiles();
await prerender();
await writeFile(path.join(output, '.nojekyll'), '');

const html = await readFile(path.join(output, 'index.html'), 'utf8');
if (!html.includes('hero-v3')) throw new Error('Anonymous build is missing the prerendered ROOM page.');
if (/\/src\/main\.tsx/.test(html)) throw new Error('Anonymous build still points to the Vite source entry.');
if (/\b(?:src|href)=["']\/(?!\/)/.test(html)) throw new Error('Anonymous build contains a root-relative resource URL.');

console.log('Anonymous static site built in docs/.');
