const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

test('API real: autenticação, CRUD, isolamento e validação', { skip: !process.env.TEST_MONGO_URI }, async (t) => {
  // Banco temporário exclusivo; nunca remove dados da aplicação.
  process.env.JWT_SECRET = 'integration-only-secret-never-for-production';
  process.env.CORS_ORIGINS = 'http://localhost:5173';
  const dbName = `mern_test_${Date.now()}_${process.pid}`;
  await mongoose.connect(process.env.TEST_MONGO_URI, { dbName });
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  await User.init();
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method = 'GET', body, token, extra = {}) => {
    const response = await fetch(base + path, { method, headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra,
    }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, headers: response.headers, data: await response.json() };
  };
  const account = { name: 'Teste', email: 'TESTE@example.com', password: 'senha-segura-123' };
  assert.equal((await request('/api/auth/register', 'POST', account)).status, 201);
  const user = await User.findOne({ email: 'teste@example.com' });
  assert.notEqual(user.password, account.password);
  assert.ok(await bcrypt.compare(account.password, user.password));
  assert.equal((await request('/api/auth/register', 'POST', account)).status, 409);
  assert.equal((await request('/api/auth/login', 'POST', { email: account.email, password: 'errada' })).status, 401);
  const auth = await request('/api/auth/login', 'POST', { email: account.email, password: account.password });
  assert.equal(auth.status, 200);
  const token = auth.data.token;
  assert.equal((await request('/api/tasks')).status, 401);
  assert.equal((await request('/api/tasks', 'GET', undefined, 'invalid')).status, 401);
  const expired = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal((await request('/api/tasks', 'GET', undefined, expired)).status, 401);
  assert.equal((await request('/api/tasks', 'GET', undefined, undefined, { Authorization: `Basic ${token}` })).status, 401);
  const created = await request('/api/tasks', 'POST', { title: '  Estudar  ', description: 'MERN' }, token);
  assert.equal(created.status, 201); assert.equal(created.data.title, 'Estudar');
  const path = `/api/tasks/${created.data._id}`;
  assert.equal((await request('/api/tasks', 'GET', undefined, token)).data.length, 1);
  const updated = await request(path, 'PUT', { title: 'Revisar', description: 'Pronto', status: 'concluída' }, token);
  assert.equal(updated.status, 200); assert.equal(updated.data.status, 'concluída');
  assert.equal((await Task.findById(created.data._id)).title, 'Revisar');
  assert.equal((await request(path, 'PUT', { status: 'pendente' }, token)).status, 200);
  assert.equal((await request(path, 'PUT', { status: 'inexistente' }, token)).status, 400);
  assert.equal((await request(path, 'PUT', {}, token)).status, 400);
  assert.equal((await request('/api/tasks/invalid', 'DELETE', undefined, token)).status, 400);
  assert.equal((await request('/api/tasks/aaaaaaaaaaaaaaaaaaaaaaaa', 'DELETE', undefined, token)).status, 404);
  const second = { name: 'Outro', email: 'outro@example.com', password: account.password };
  await request('/api/auth/register', 'POST', second);
  const other = (await request('/api/auth/login', 'POST', { email: second.email, password: second.password })).data.token;
  assert.equal((await request('/api/tasks', 'GET', undefined, other)).data.length, 0);
  assert.equal((await request(path, 'PUT', { title: 'Roubar' }, other)).status, 404);
  assert.equal((await request(path, 'DELETE', undefined, other)).status, 404);
  for (const body of [{ title: ' ' }, { title: { $ne: null } }, { title: '<script>alert(1)</script>' }, { title: 'x'.repeat(121) }, { title: 'ok', user: user.id }, { title: 'ok', description: [] }]) {
    assert.equal((await request('/api/tasks', 'POST', body, token)).status, 400);
  }
  for (const body of [{ email: { $ne: null }, password: account.password }, { email: 'invalido', password: 'x' }]) {
    assert.equal((await request('/api/auth/login', 'POST', body)).status, 400);
  }
  assert.equal((await request('/api/auth/register', 'POST', { ...account, password: 'curta' })).status, 400);
  assert.equal((await request('/api/auth/register', 'POST', { ...account, password: 'é'.repeat(40) })).status, 400);
  const denied = await request('/api/tasks', 'GET', undefined, token, { Origin: 'https://evil.example' });
  assert.equal(denied.status, 403);
  const allowed = await request('/api/tasks', 'GET', undefined, token, { Origin: 'http://localhost:5173' });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const preflight = await fetch(base + '/api/tasks', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' } });
  assert.equal(preflight.status, 204);
  const malformed = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await request(path, 'DELETE', undefined, token)).status, 200);
  assert.equal((await request('/api/tasks', 'GET', undefined, token)).data.length, 0);
});
