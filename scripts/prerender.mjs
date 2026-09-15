import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile } from 'node:fs/promises';

// Produce readable static research content before the client adds interactivity.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const markup = renderToString(createElement(App));
  const path = process.argv[2]
    ? new URL(`../${process.argv[2].replaceAll('\\', '/')}`, import.meta.url)
    : new URL('../tmp/public-client/index.html', import.meta.url);
  const html = await readFile(path, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('Missing prerender root');
  await writeFile(path, html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`));
  console.log('Prerendered the public research page.');
} finally {
  await server.close();
}
