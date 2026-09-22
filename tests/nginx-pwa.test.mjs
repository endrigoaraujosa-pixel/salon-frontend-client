import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Opt-in integration test against an existing Nginx image. Requires npm run build.
// Example: PWA_NGINX_TEST_IMAGE=salon-local-frontend node --test tests/nginx-pwa.test.mjs
test('Nginx serves the store manifest in the initial HTML, without JavaScript', {
  skip: !process.env.PWA_NGINX_TEST_IMAGE,
  timeout: 60000,
}, async () => {
  const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', timeout: 20000 }).trim();
  const root = fileURLToPath(new URL('../', import.meta.url));
  const name = `booking-pwa-test-${process.pid}-${Date.now()}`;
  let started = false;
  try {
    docker('run', '--rm', '-d', '--name', name, '-p', '127.0.0.1::80',
      '--mount', `type=bind,source=${root}nginx.conf,target=/etc/nginx/conf.d/default.conf,readonly`,
      '--mount', `type=bind,source=${root}dist,target=/usr/share/nginx/html,readonly`,
      process.env.PWA_NGINX_TEST_IMAGE);
    started = true;
    const port = docker('port', name, '80/tcp').split(':').at(-1);
    const origin = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      try { ready = (await fetch(origin, { signal: AbortSignal.timeout(500) })).ok; } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.ok(ready, 'Nginx did not start');
    for (const [path, tenant] of [
      ['/?loja=demostrativo', 'demostrativo'],
      ['/loja=demostrativo/', 'demostrativo'],
      ['/loja=demostrativo/servicos', 'demostrativo'],
      ['/loja=studio_b/data-hora?loja=demostrativo', 'studio_b'],
      ['/?loja=studio_b', 'studio_b'],
      ['/', ''],
      ['/?loja=%22%3E%3Cscript%3E', ''],
    ]) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get('cache-control'), /no-store/);
      const html = await response.text();
      const href = html.match(/id="manifest-link"[^>]*href="([^"]+)"/)?.[1];
      assert.equal(href, tenant ? `/manifest.json?loja=${tenant}` : '/manifest.json', path);
      const manifestResponse = await fetch(origin + href);
      const manifest = await manifestResponse.json();
      assert.equal(manifest.start_url, tenant ? `/loja=${tenant}/` : '/');
      assert.equal(manifest.id, tenant ? `/?loja=${tenant}` : '/');
    }
  } finally {
    if (started) docker('stop', '--time', '1', name);
  }
});
