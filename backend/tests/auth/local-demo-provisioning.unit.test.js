import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCAL_DEMO_ACCOUNTS,
  assertLocalDemoTarget,
  provisionLocalDemoAccounts,
} from '../../src/modules/auth/scripts/local-demo-provisioner.js';

const safe = Object.freeze({
  NODE_ENV: 'development',
  CONFIRM_DEMO_SEED: 'true',
  DB_HOST: '127.0.0.1',
  DB_NAME: 'approveflow',
  DB_PORT: '5433',
  DEMO_REQUESTER_PASSWORD: 'local-sarah-secret-12',
  DEMO_APPROVER_PASSWORD: 'local-mark-secret-34',
});

function fakeDatabase(databaseName = 'approveflow') {
  return { query: async (sql) => {
    assert.equal(sql, 'SELECT current_database() AS database_name');
    return { rows: [{ database_name: databaseName }] };
  } };
}

function fakeProvisioner(environment = safe) {
  const records = new Map();
  const created = [];
  let lookups = 0;
  const opts = {
    environment,
    database: fakeDatabase(),
    find: async (email) => { lookups += 1; return records.get(email) ?? null; },
    create: async (account) => {
      assert.ok(account.passwordHash.startsWith('hash:'));
      assert.ok(!('password' in account));
      created.push(account);
      records.set(account.email, { ...account, is_active: true });
    },
    hash: async (password, cost) => { assert.equal(cost, 12); return `hash:${password}`; },
  };
  return { opts, records, created, getLookups: () => lookups };
}

test('local accounts use the exact hosted Sarah/Mark emails and expected roles', () => {
  assert.deepEqual(LOCAL_DEMO_ACCOUNTS.map(({ email, role }) => ({ email, role })), [
    { email: 'sarah.demo@approveflow.example', role: 'REQUESTER' },
    { email: 'mark.demo@approveflow.example', role: 'APPROVER' },
  ]);
});

test('explicit local database environment guard permits only expected identity', () => {
  assert.doesNotThrow(() => assertLocalDemoTarget(safe));
  for (const override of [
    { CONFIRM_DEMO_SEED: '' }, { NODE_ENV: 'production' }, { NODE_ENV: 'test' },
    { DATABASE_URL: 'postgresql://localhost/approveflow' }, { DATABASE_URL: '' },
    { DB_HOST: 'render.example.com' }, { DB_HOST: 'host.docker.internal' },
    { DB_NAME: 'approveflow_render' }, { DB_NAME: 'approveflow_test' },
    { DB_PORT: '' }, { DB_PORT: '-1' }, { DB_PORT: 'abc' },
  ]) assert.throws(() => assertLocalDemoTarget({ ...safe, ...override }), /Local demo provisioning/);
});

test('unsafe configuration is rejected before SQL, account lookups or creation', async () => {
  let sql = 0; let lookup = 0; let create = 0;
  const args = {
    environment: { ...safe, DB_HOST: 'remote.example.com' },
    database: { query: async () => { sql++; return { rows: [] }; } },
    find: async () => { lookup++; },
    create: async () => { create++; },
    hash: async () => 'hash',
  };
  await assert.rejects(() => provisionLocalDemoAccounts(args), /DB_HOST/);
  assert.deepEqual([sql, lookup, create], [0, 0, 0]);
});

test('missing password blocks execution before SQL and writes', async () => {
  let sql = 0;
  const args = fakeProvisioner({ ...safe, DEMO_REQUESTER_PASSWORD: 'short' });
  args.opts.database = { query: async () => { sql++; } };
  await assert.rejects(() => provisionLocalDemoAccounts(args.opts), /DEMO_REQUESTER_PASSWORD/);
  assert.equal(sql, 0);
  assert.equal(args.getLookups(), 0);
  assert.equal(args.created.length, 0);
});

test('actual connected database name mismatch blocks any writes or lookups', async () => {
  const args = fakeProvisioner();
  args.opts.database = fakeDatabase('approveflow_render');
  await assert.rejects(() => provisionLocalDemoAccounts(args.opts), /Connected database/);
  assert.equal(args.getLookups(), 0);
  assert.equal(args.created.length, 0);
});

test('creates canonical local accounts with hashed passwords and correct roles', async () => {
  const x = fakeProvisioner();
  const result = await provisionLocalDemoAccounts(x.opts);
  assert.deepEqual(result.created, LOCAL_DEMO_ACCOUNTS.map(x => x.email));
  assert.deepEqual(result.unchanged, []);
  assert.deepEqual(x.created.map(x => x.role), ['REQUESTER', 'APPROVER']);
  assert.deepEqual(x.created.map(x => x.firstName), ['Sarah', 'Mark']);
});

test('repeat run is idempotent and does not reset existing passwords', async () => {
  const x = fakeProvisioner();
  await provisionLocalDemoAccounts(x.opts);
  const firstHashes = x.created.map(x => x.passwordHash);
  const second = await provisionLocalDemoAccounts(x.opts);
  assert.deepEqual(second.created, []);
  assert.deepEqual(second.unchanged, LOCAL_DEMO_ACCOUNTS.map(x => x.email));
  assert.equal(x.created.length, 2);
  assert.deepEqual(x.created.map(x => x.passwordHash), firstHashes);
});

test('preserves unrelated original local demo accounts', async () => {
  const x = fakeProvisioner();
  x.records.set('demo.requester@approveflow.local', { role: 'REQUESTER', is_active: true });
  x.records.set('demo.approver@approveflow.local', { role: 'APPROVER', is_active: true });
  await provisionLocalDemoAccounts(x.opts);
  assert.ok(x.records.has('demo.requester@approveflow.local'));
  assert.ok(x.records.has('demo.approver@approveflow.local'));
});

test('unexpected existing role or inactive account rejects before first creation', async () => {
  for (const invalid of [{ role: 'APPROVER', is_active: true }, { role: 'REQUESTER', is_active: false }]) {
    const x = fakeProvisioner();
    x.records.set('sarah.demo@approveflow.example', invalid);
    await assert.rejects(() => provisionLocalDemoAccounts(x.opts), /not active with expected role/);
    assert.equal(x.created.length, 0);
  }
});

test('existing canonical account is retained and only missing account is created', async () => {
  const x = fakeProvisioner();
  x.records.set('sarah.demo@approveflow.example', { role: 'REQUESTER', is_active: true, passwordHash: 'original' });
  const result = await provisionLocalDemoAccounts(x.opts);
  assert.deepEqual(result.created, ['mark.demo@approveflow.example']);
  assert.deepEqual(result.unchanged, ['sarah.demo@approveflow.example']);
  assert.equal(x.records.get('sarah.demo@approveflow.example').passwordHash, 'original');
});
