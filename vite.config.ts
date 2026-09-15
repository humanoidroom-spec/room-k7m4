import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';

// A filename inventory avoids emitting a duplicate hashed copy of public videos.
const videos = readdirSync(new URL('./public/videos/', import.meta.url))
  .filter(name => /\.(mp4|webm)$/.test(name))
  .map(name => `/public/videos/${name}`);

export default defineConfig({
  plugins: [react()],
  base: './',
  define: { __ROOM_VIDEO_FILES__: JSON.stringify(videos) },
  build: { outDir: 'tmp/protected-client', emptyOutDir: true, sourcemap: false },
});
