import { defineConfig, loadEnv } from 'vite';
import type { ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Both Drop origins sit behind Cloudflare Access.
const DATA_ORIGIN = 'https://rachellam.drop.ai.bowtie.hk';
const PROXY_ORIGIN = 'https://drop.ai.bowtie.hk';

// Two build modes:
//   `vite build`                 → normal multi-asset bundle in dist/
//   `vite build --mode singlefile` → one self-contained index.html in dist-single/
//     (inlines all JS + CSS — handy for internal sharing e.g. Bowtie Drop)
export default defineConfig(({ mode }) => {
  const single = mode === 'singlefile';
  const env = loadEnv(mode, process.cwd(), 'CF_');

  // Cloudflare Access credentials for the dev proxy. Deployed, the app is
  // same-origin with Drop so the browser's CF_Authorization cookie is sent
  // automatically. From localhost the fetch is cross-origin and carries no
  // credentials, so Access answers 302 → cloudflareaccess.com, which has no CORS
  // headers — the browser surfaces that as "Failed to fetch". So in dev we proxy
  // server-side through Vite and attach credentials from .env.local (gitignored):
  //
  //   CF_ACCESS_COOKIE=<value of the CF_Authorization cookie>
  //     DevTools → Application → Cookies → https://drop.ai.bowtie.hk
  //   …or a service token:
  //   CF_ACCESS_CLIENT_ID=<id>.access
  //   CF_ACCESS_CLIENT_SECRET=<secret>
  const accessHeaders: Record<string, string> = {};
  if (env.CF_ACCESS_COOKIE) {
    accessHeaders.cookie = `CF_Authorization=${env.CF_ACCESS_COOKIE}`;
  }
  if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
    accessHeaders['CF-Access-Client-Id'] = env.CF_ACCESS_CLIENT_ID;
    accessHeaders['CF-Access-Client-Secret'] = env.CF_ACCESS_CLIENT_SECRET;
  }

  // An unauthenticated proxied request comes back as a 302 to the Access login
  // page. Passing that through would make the browser follow it cross-origin and
  // fail opaquely, so collapse it into a 511 the app can report as "not
  // authenticated" (see fetchOperationData / benefitSchedule.api).
  const collapseAccessRedirect: ProxyOptions['configure'] = (proxy) => {
    proxy.on('proxyRes', (proxyRes) => {
      const location = String(proxyRes.headers.location ?? '');
      const redirected = proxyRes.statusCode === 301 || proxyRes.statusCode === 302;
      if (redirected && location.includes('cloudflareaccess.com')) {
        proxyRes.statusCode = 511;
        delete proxyRes.headers.location;
      }
    });
  };

  const target = (origin: string, path: string): ProxyOptions => ({
    target: origin,
    changeOrigin: true,
    headers: accessHeaders,
    rewrite: () => path,
    configure: collapseAccessRedirect,
  });

  return {
    plugins: [react(), ...(single ? [viteSingleFile()] : [])],
    server: {
      proxy: {
        '/drop-data': target(DATA_ORIGIN, '/common-operation-data/operations.json'),
        '/drop-proxy': target(PROXY_ORIGIN, '/proxy'),
      },
    },
    build: {
      outDir: single ? 'dist-single' : 'dist',
      // Inlining works best with a single chunk; harmless for the normal build.
      ...(single ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false } : {}),
    },
  };
});
