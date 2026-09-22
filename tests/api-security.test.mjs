import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { prepareBookingLocation } from '../src/pwaTenant.js';
const source = (await readFile(new URL('../src/api.js', import.meta.url), 'utf8'))
  .replace("import axios from 'axios';", '')
  .replace("import { prepareBookingLocation } from './pwaTenant';", '')
  .replaceAll('import.meta.env.VITE_API_URL', "'https://api.example.invalid'")
  .replace('export default api;', '');
function client(tenant) {
  const hooks = {};
  const api = { interceptors: { request: { use(fn) { hooks.request = fn; } }, response: { use(fn) { hooks.response = fn; } } } };
  vm.runInNewContext(source, {
    axios: { create: () => api }, console: { log() {} }, URLSearchParams, prepareBookingLocation,
    window: { location: new URL(`https://agendamento.example.invalid/?loja=${tenant}`), history: { replaceState() {} } }
  });
  return hooks;
}
test('encaminha provas sem alterar o payload e vincula reservas mesmo com respostas fora de ordem', () => {
  const hooks = client('empresa-a');
  hooks.response({ data: { online_token: 'phone-proof' } });
  hooks.response({ data: { solicitacaoId: 'second', reservation_token: 'proof-second' } });
  hooks.response({ data: { solicitacaoId: 'first', reservation_token: 'proof-first' } });
  const config = hooks.request({ method: 'post', url: '/online/solicitar', data: { solicitacaoId: 'second', telefone: '85999999999' } });
  assert.equal(config.data.reservation_token, 'proof-second');
  assert.equal(config.data.online_token, 'phone-proof');
  assert.equal(config.data.telefone, '85999999999');
});
test('nova página/empresa começa sem provas e GET continua inalterado', () => {
  const hooks = client('empresa-b');
  assert.equal(hooks.request({ method: 'post', url: '/online/solicitar', data: {} }).data.online_token, undefined);
  const get = { method: 'get', url: '/online/servicos' };
  assert.equal(hooks.request(get), get);
});
