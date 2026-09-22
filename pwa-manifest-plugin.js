import { readFileSync } from 'node:fs';
export function bookingManifestPlugin() {
  const middleware = (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/manifest.json') return next();
    const manifest = JSON.parse(readFileSync(new URL('./public/manifest.json', import.meta.url), 'utf8'));
    const tenant = url.searchParams.get('loja') || '';
    if (/^[a-zA-Z0-9_-]{1,63}$/.test(tenant)) {
      manifest.id = `/?loja=${tenant}`;
      manifest.start_url = `/loja=${tenant}/`;
    }
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(manifest));
  };
  return { name: 'booking-manifest', configureServer(server) { server.middlewares.use(middleware); }, configurePreviewServer(server) { server.middlewares.use(middleware); } };
}
