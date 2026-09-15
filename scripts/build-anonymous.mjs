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
const fontMimeTypes = new Map([
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
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

function localFile(reference, fromFile) {
  if (/^(?:#|data:|https?:|\/\/)/i.test(reference)) return null;
  if (reference.startsWith('/')) throw new Error(`Anonymous build contains a root-relative resource URL: ${reference}`);

  const suffixIndex = reference.search(/[?#]/);
  const pathname = suffixIndex === -1 ? reference : reference.slice(0, suffixIndex);
  const filename = path.resolve(path.dirname(fromFile), decodeURIComponent(pathname));
  const relative = path.relative(output, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Anonymous build resource escapes docs/: ${reference}`);
  }
  return { filename, relative: relative.split(path.sep).join('/'), suffix: suffixIndex === -1 ? '' : reference.slice(suffixIndex) };
}

async function inlineFontReferences(css, cssFile) {
  const matches = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)];
  for (const match of matches) {
    const reference = match[1];
    const resolved = localFile(reference, cssFile);
    if (!resolved) continue;

    const mimeType = fontMimeTypes.get(path.extname(resolved.filename).toLowerCase());
    const replacement = mimeType
      ? `url("data:${mimeType};base64,${(await readFile(resolved.filename)).toString('base64')}")`
      : `url("./${resolved.relative}${resolved.suffix}")`;
    css = css.replace(match[0], replacement);
  }
  return css;
}

async function inlineRuntimeResources() {
  const htmlFile = path.join(output, 'index.html');
  let html = await readFile(htmlFile, 'utf8');

  const stylesheetTags = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)];
  for (const match of stylesheetTags) {
    const reference = match[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    const resolved = reference && localFile(reference, htmlFile);
    if (!resolved) continue;
    let css = await readFile(resolved.filename, 'utf8');
    css = await inlineFontReferences(css, resolved.filename);
    css = css.replace(/<\/style/gi, '<\\/style');
    html = html.replace(match[0], () => `<style data-anonymous-inline="stylesheet">${css}</style>`);
  }

  const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>/gi)];
  for (const match of scriptTags) {
    const reference = match[0].match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const resolved = reference && localFile(reference, htmlFile);
    if (!resolved) continue;
    const javascript = (await readFile(resolved.filename, 'utf8')).replace(/<\/script/gi, '<\\/script');
    html = html.replace(match[0], () => `<script type="module" data-anonymous-inline="module">${javascript}</script>`);
  }

  await writeFile(htmlFile, html);
}

await rm(output, { recursive: true, force: true });
await build({ root, build: { outDir: output, emptyOutDir: true } });
await removeUnpublishedFiles();
await prerender();
await inlineRuntimeResources();
await writeFile(path.join(output, '.nojekyll'), '');

const html = await readFile(path.join(output, 'index.html'), 'utf8');
if (!html.includes('hero-v3')) throw new Error('Anonymous build is missing the prerendered ROOM page.');
if (/\/src\/main\.tsx/.test(html)) throw new Error('Anonymous build still points to the Vite source entry.');
if (/\b(?:src|href)=["']\/(?!\/)/.test(html)) throw new Error('Anonymous build contains a root-relative resource URL.');
if (!html.includes('data-anonymous-inline="stylesheet"') || !html.includes('data-anonymous-inline="module"')) {
  throw new Error('Anonymous build did not inline its stylesheet and module entry.');
}

console.log('Anonymous static site built in docs/.');
