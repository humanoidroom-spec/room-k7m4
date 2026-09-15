import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');

test('GitHub Pages bundle is public, self-contained, and safe to publish', async () => {
  const html = await readFile(resolve(output, 'index.html'), 'utf8');

  assert.match(html, /<div id="root">.+<\/div>/s);
  assert.match(html, /ROOM/);
  assert.doesNotMatch(html, /type="password"|Enter password|Incorrect password/i);

  const localReferences = [...html.matchAll(/(?:src|href)="([^"#?]+)["#?]/g)]
    .map(([, value]) => value)
    .filter(value => !/^(?:https?:|mailto:|tel:|data:)/.test(value));

  for (const reference of localReferences) {
    const relative = decodeURIComponent(reference.replace(/^\.\//, '').replace(/^\//, ''));
    await access(resolve(output, relative));
  }

  await access(resolve(output, '.nojekyll'));
  await access(resolve(output, 'videos', 'hero.mp4'));

  const entries = await readdir(output, { recursive: true });
  assert.equal(entries.some(path => /(?:^|[\\/])archive(?:[\\/]|$)|\.pdf$|server[\\/]/i.test(path)), false);
});
