import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import pool, { getDatabaseName } from '../../src/config/database.js';

const password = 'correct-horse-battery-staple';
let server;
let baseUrl;

beforeEach(async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(getDatabaseName(), 'approveflow_test');
  const databaseIdentity = await pool.query('SELECT current_database() AS database_name');
  assert.equal(databaseIdentity.rows[0].database_name, 'approveflow_test');
  await pool.query('TRUNCATE users CASCADE');
  const hash = await bcrypt.hash(password, 10);
  await pool.query(`INSERT INTO users (first_name, last_name, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)`, ['Rita', 'Requester', 'requester@example.com', hash, 'REQUESTER', true, 'Andy', 'Approver', 'approver@example.com', hash, 'APPROVER', false]);
  if (!server) await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); await pool.end(); });

async function request(path, options = {}) { return fetch(`${baseUrl}${path}`, { headers: { 'content-type': 'application/json', ...options.headers }, ...options }); }

test('logs in a valid active user without returning the password hash', async () => {
  const response = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'REQUESTER@example.com', password }) });
  const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.tokenType, 'Bearer'); assert.equal(body.user.role, 'REQUESTER'); assert.equal(body.password_hash, undefined);
});

test('returns the same response for invalid password, inactive user, and unknown email', async () => {
  for (const credentials of [{ email: 'requester@example.com', password: 'wrong-password' }, { email: 'approver@example.com', password }, { email: 'unknown@example.com', password }]) {
    const response = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    const body = await response.json(); assert.equal(response.status, 401); assert.equal(body.error.code, 'INVALID_CREDENTIALS');
  }
});

test('rejects missing, invalid, and expired tokens', async () => {
  const missing = await request('/api/auth/me'); assert.equal(missing.status, 401);
  const invalid = await request('/api/auth/me', { headers: { authorization: 'Bearer invalid' } }); assert.equal(invalid.status, 401);
  const expired = jwt.sign({ role: 'REQUESTER' }, process.env.JWT_SECRET, { subject: '00000000-0000-0000-0000-000000000001', expiresIn: -1, issuer: 'approveflow-api', audience: 'approveflow-api' });
  const expiredResponse = await request('/api/auth/me', { headers: { authorization: `Bearer ${expired}` } }); assert.equal(expiredResponse.status, 401);
});

test('accepts a valid token only while the corresponding user remains active', async () => {
  const login = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'requester@example.com', password }) });
  const { token } = await login.json();
  const me = await request('/api/auth/me', { headers: { authorization: `Bearer ${token}` } }); assert.equal(me.status, 200); assert.equal((await me.json()).user.role, 'REQUESTER');
  await pool.query('UPDATE users SET is_active = false WHERE email = $1', ['requester@example.com']);
  const inactive = await request('/api/auth/me', { headers: { authorization: `Bearer ${token}` } }); assert.equal(inactive.status, 401);
});
