import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two build modes:
//   `vite build`                 → normal multi-asset bundle in dist/
//   `vite build --mode singlefile` → one self-contained index.html in dist-single/
//     (inlines all JS + CSS — handy for internal sharing e.g. Bowtie Drop)
export default defineConfig(({ mode }) => {
  const single = mode === 'singlefile';
  return {
    plugins: [react(), ...(single ? [viteSingleFile()] : [])],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      // Inlining works best with a single chunk; harmless for the normal build.
      ...(single ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false } : {}),
    },
  };
});
