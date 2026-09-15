import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'docs');
const anonymousBase = new URL('https://anonymous.example/w/example-id/');

async function filesBelow(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries.filter(entry => entry.isFile()).map(entry => resolve(entry.parentPath, entry.name));
}

function publishedPath(reference, base = anonymousBase) {
  assert.doesNotMatch(reference, /^\/(?!\/)/, `root-relative URL is unsafe under ${anonymousBase.pathname}: ${reference}`);
  const url = new URL(reference, base);
  assert.equal(url.origin, anonymousBase.origin, `unexpected external URL passed as local: ${reference}`);
  assert.ok(url.pathname.startsWith(anonymousBase.pathname), `URL escaped the anonymous path prefix: ${reference}`);
  return resolve(output, decodeURIComponent(url.pathname.slice(anonymousBase.pathname.length)));
}

test('docs contains the prerendered ROOM page and required static assets', async () => {
  const html = await readFile(resolve(output, 'index.html'), 'utf8');

  assert.match(html, /<div id="root">.+<\/div>/s);
  assert.match(html, /hero-v3/);
  assert.match(html, /ROOM/);
  assert.match(html, /<style data-anonymous-inline="stylesheet">/);
  assert.match(html, /<script type="module" data-anonymous-inline="module">/);
  assert.match(html, /data:font\/woff2;base64,/);
  assert.doesNotMatch(html, /\/src\/main\.tsx|type="password"|Enter password|Incorrect password/i);
  assert.doesNotMatch(html, /\b(?:src|href)=["']\/(?!\/)/i);
  assert.doesNotMatch(html, /<link\b[^>]*\brel=["']stylesheet["']/i);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc=["'][^"']*assets\//i);

  await access(resolve(output, '.nojekyll'));
  await access(resolve(output, 'favicon.svg'));
  await access(resolve(output, 'videos', 'hero.mp4'));
  await access(resolve(output, 'assets', 'hero-video-poster.webp'));

  const files = await filesBelow(output);
  assert.ok(files.some(file => extname(file) === '.js' && dirname(file) === resolve(output, 'assets')));
  assert.ok(files.some(file => extname(file) === '.css' && dirname(file) === resolve(output, 'assets')));
});

test('every local HTML and CSS resource stays under the anonymous prefix and exists', async () => {
  const html = await readFile(resolve(output, 'index.html'), 'utf8');
  const htmlReferences = [...html.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/gi)]
    .map(([, value]) => value)
    .filter(value => !/^(?:#|https?:|mailto:|tel:|data:)/i.test(value));

  for (const reference of htmlReferences) await access(publishedPath(reference));

  const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(([, value]) => value);
  for (const css of inlineStyles) {
    const references = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)]
      .map(([, value]) => value)
      .filter(value => !/^(?:#|https?:|data:)/i.test(value));
    for (const reference of references) await access(publishedPath(reference));
  }

  for (const cssFile of (await filesBelow(output)).filter(file => extname(file) === '.css')) {
    const css = await readFile(cssFile, 'utf8');
    const cssBase = new URL(relative(output, cssFile).replaceAll('\\', '/'), anonymousBase);
    const references = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)]
      .map(([, value]) => value)
      .filter(value => !/^(?:#|https?:|data:)/i.test(value));
    for (const reference of references) await access(publishedPath(reference, cssBase));
  }
});

test('runtime bundles and source contain no unsafe public resource literals', async () => {
  const unsafeRuntimePath = /["']\/(?:assets|public|videos)\//;
  const html = await readFile(resolve(output, 'index.html'), 'utf8');
  const inlineJavaScript = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(([, value]) => value);
  for (const javascript of inlineJavaScript) assert.doesNotMatch(javascript, unsafeRuntimePath, 'inline JavaScript');

  const builtJavaScript = (await filesBelow(output)).filter(file => extname(file) === '.js');
  for (const file of builtJavaScript) assert.doesNotMatch(await readFile(file, 'utf8'), unsafeRuntimePath, relative(root, file));

  const sourceFiles = (await filesBelow(resolve(root, 'src'))).filter(file => /\.[cm]?[jt]sx?$/.test(file));
  for (const file of sourceFiles) assert.doesNotMatch(await readFile(file, 'utf8'), unsafeRuntimePath, relative(root, file));
});

test('docs contains only the public homepage surface', async () => {
  const files = await filesBelow(output);
  const relativeFiles = files.map(file => relative(output, file).replaceAll('\\', '/'));

  for (const forbidden of [
    /(?:^|\/)archive(?:\/|$)/i,
    /(?:^|\/)server(?:\/|$)/i,
    /(?:^|\/)src(?:\/|$)/i,
    /(?:^|\/)node_modules(?:\/|$)/i,
    /(?:^|\/)\.env(?:\.|$)/i,
    /\.pdf$/i,
    /\.(?:ts|tsx)$/i,
    /(?:^|\/)(?:DESIGN_NOTES|VERSIONS|README)\.md$/i,
  ]) {
    assert.equal(relativeFiles.some(file => forbidden.test(file)), false, `forbidden publish output matched ${forbidden}`);
  }
});

test('every required public image, font, and video is preserved', async () => {
  for (const directory of ['assets', 'fonts', 'videos']) {
    const sourceFiles = (await filesBelow(resolve(root, 'public', directory)))
      .filter(file => directory !== 'videos' || /\.(?:mp4|webm)$/i.test(file))
      .filter(file => directory !== 'fonts' || /\.(?:txt|woff2?)$/i.test(file));
    for (const source of sourceFiles) {
      await access(resolve(output, directory, relative(resolve(root, 'public', directory), source)));
    }
  }
});

test('published text contains no obvious project identity leak', async () => {
  const textFiles = (await filesBelow(output)).filter(file => /\.(?:css|html|js)$/i.test(file));
  const text = (await Promise.all(textFiles.map(file => readFile(file, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /Nanyang Technological University|\bNTU\b|humanoidroom-spec|github\.io|github\.com\/humanoidroom-spec|mailto:/i);
});
