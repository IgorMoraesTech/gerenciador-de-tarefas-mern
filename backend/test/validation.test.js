const { test } = require('node:test');
const assert = require('node:assert/strict');
const validation = require('../src/middlewares/validation');
function check(middleware, body) {
  const req = { body }; let error;
  middleware(req, {}, value => { error = value; });
  return { body: req.body, error };
}
test('rejeita operadores MongoDB, arrays e campos inesperados', () => {
  for (const body of [null, [], { email: { $ne: null }, password: '12345678' }, { email: 'a@b.com', password: '12345678', role: 'admin' }]) {
    assert.equal(check(validation.auth(false), body).error.status, 400);
  }
});
test('normaliza nome/e-mail sem alterar senha', () => {
  const result = check(validation.auth(true), { name: ' Igor ', email: ' IGOR@example.com ', password: ' 12345678 ' });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.body, { name: 'Igor', email: 'igor@example.com', password: ' 12345678 ' });
});
test('valida comprimento UTF-8 da senha e conteúdo textual', () => {
  assert.equal(check(validation.auth(true), { name: 'Igor', email: 'a@b.com', password: 'é'.repeat(40) }).error.status, 400);
  for (const body of [{ title: ' ' }, { title: '<img src=x onerror=alert(1)>' }, { title: 'x'.repeat(121) }, { title: 'ok', status: 'errado' }]) assert.equal(check(validation.task(), body).error.status, 400);
});
test('aceita atualização parcial válida e rejeita atualização vazia', () => {
  assert.deepEqual(check(validation.task(true), { status: 'concluída' }).body, { status: 'concluída' });
  assert.equal(check(validation.task(true), {}).error.status, 400);
});
