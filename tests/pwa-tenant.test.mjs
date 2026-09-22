import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pwaTenant, bookingBasePath, prepareBookingLocation } from '../src/pwaTenant.js';
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
    assert.equal(manifest.start_url, expected === '/' ? '/' : `/loja=${new URLSearchParams(query).get('loja')}/`);
    assert.equal(manifest.id, expected);
  }
});

test('installation and reload preserve demostrativo through every booking route', () => {
  const browser = {
    location: new URL('https://agendamento.example/?loja=demostrativo'),
    history: { state: null, replaceState(state, title, path) { browser.location = new URL(path, browser.location); } }
  };
  assert.equal(prepareBookingLocation(browser), 'demostrativo');
  assert.equal(browser.location.pathname, '/loja=demostrativo/');
  assert.equal(browser.location.search, '');
  for (const route of ['', 'servicos', 'profissional', 'data-hora', 'identificacao', 'sucesso']) {
    browser.location = new URL(`/loja=demostrativo/${route}`, browser.location);
    assert.equal(prepareBookingLocation(browser), 'demostrativo');
    assert.equal(bookingBasePath(browser.location), '/loja=demostrativo');
    assert.equal(browser.location.pathname, `/loja=demostrativo/${route}`);
  }
});

test('canonicalization keeps deep links, other parameters and history state', () => {
  const state = { key: 'existing' };
  const browser = {
    location: new URL('https://agendamento.example/servicos?loja=studio_a&origem=link#detalhe'),
    history: { state, replaceState(saved, title, path) {
      assert.equal(saved, state);
      browser.location = new URL(path, browser.location);
    } }
  };
  prepareBookingLocation(browser);
  assert.equal(browser.location.href, 'https://agendamento.example/loja=studio_a/servicos?origem=link#detalhe');
  browser.location = new URL('https://agendamento.example/loja=studio_b/?loja=studio_a');
  assert.equal(prepareBookingLocation(browser), 'studio_b');
  assert.equal(browser.location.pathname, '/loja=studio_b/');
});

test('missing or invalid store never selects a previously used company', () => {
  for (const suffix of ['/', '/?loja=%3Cscript%3E']) {
    const browser = { location: new URL(`https://agendamento.example${suffix}`), history: { replaceState() { assert.fail('unexpected rewrite'); } } };
    assert.equal(prepareBookingLocation(browser), '');
  }
});
