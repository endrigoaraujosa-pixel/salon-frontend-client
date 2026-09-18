import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pwaTenant } from '../src/pwaTenant.js';
import { bookingManifestPlugin } from '../pwa-manifest-plugin.js';
test('booking installation captures tenant from query, legacy path and hostname', () => {
  for (const url of ['https://agendamento.example/?loja=studio_a', 'https://agendamento.example/loja=studio_a', 'https://studio_a.example/']) assert.equal(pwaTenant(new URL(url)), 'studio_a');
  assert.equal(pwaTenant(new URL('https://agendamento.example/')), '');
  assert.equal(pwaTenant(new URL('https://agendamento.example/?loja=%22%3Cscript%3E')), '');
});
test('manifest scopes installations by store and rejects injection', () => {
  let middleware;
  bookingManifestPlugin().configureServer({ middlewares: { use(fn) { middleware = fn; } } });
  for (const [query, expected] of [['?loja=studio_a', '/?loja=studio_a'], ['?loja=studio_b', '/?loja=studio_b'], ['?loja=%22%3Cscript%3E', '/'], ['', '/']]) {
    let manifest;
    middleware({ url: '/manifest.json' + query }, { setHeader() {}, end(body) { manifest = JSON.parse(body); } }, () => assert.fail('unhandled'));
    assert.equal(manifest.start_url, expected); assert.equal(manifest.id, expected);
  }
});
