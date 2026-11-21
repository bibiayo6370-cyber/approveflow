import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTestMigrationTarget } from '../../src/database/migration-safety.js';

function createPool(currentDatabase = 'approveflow_test') {
  let queryCount = 0;
  return {
    get queryCount() { return queryCount; },
    async query(sql) {
      queryCount += 1;
      assert.equal(sql, 'SELECT current_database() AS database_name');
      return { rows: [{ database_name: currentDatabase }] };
    }
  };
}

const validEnvironment = {
  NODE_ENV: 'test',
  DB_NAME: 'approveflow_test'
};

test('accepts only the expected test environment and connected database', async () => {
  const pool = createPool();
  await verifyTestMigrationTarget(pool, validEnvironment);
  assert.equal(pool.queryCount, 1);
});

test('rejects a non-test environment before opening a database query', async () => {
  const pool = createPool();
  await assert.rejects(
    verifyTestMigrationTarget(pool, { ...validEnvironment, NODE_ENV: 'development' }),
    /NODE_ENV=test/
  );
  assert.equal(pool.queryCount, 0);
});

test('rejects an unexpected database name before opening a database query', async () => {
  const pool = createPool();
  await assert.rejects(
    verifyTestMigrationTarget(pool, { ...validEnvironment, DB_NAME: 'approveflow' }),
    /DB_NAME=approveflow_test/
  );
  assert.equal(pool.queryCount, 0);
});

test('rejects a DATABASE_URL override before opening a database query', async () => {
  const pool = createPool();
  await assert.rejects(
    verifyTestMigrationTarget(pool, { ...validEnvironment, DATABASE_URL: 'postgres://unexpected-host/approveflow_test' }),
    /reject DATABASE_URL/
  );
  assert.equal(pool.queryCount, 0);
});

test('rejects a connection that resolves to any database except approveflow_test', async () => {
  const pool = createPool('approveflow');
  await assert.rejects(verifyTestMigrationTarget(pool, validEnvironment), /resolved to approveflow/);
  assert.equal(pool.queryCount, 1);
});
