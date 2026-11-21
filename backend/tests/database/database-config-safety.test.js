import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const importDatabaseModule = `
  import('./src/config/database.js')
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
`;

function importWithEnvironment(overrides = {}) {
  const environment = {
    ...process.env,
    NODE_ENV: 'test',
    DB_HOST: '127.0.0.1',
    DB_NAME: 'approveflow_test'
  };

  delete environment.DATABASE_URL;

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete environment[key];
    else environment[key] = value;
  }

  return spawnSync(process.execPath, ['--input-type=module', '--eval', importDatabaseModule], {
    cwd: process.cwd(),
    env: environment,
    encoding: 'utf8'
  });
}

test('rejects an inherited DATABASE_URL before creating a test pool', () => {
  const result = importWithEnvironment({ DATABASE_URL: 'postgres://remote.example/approveflow_test' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must not define DATABASE_URL/);
});

test('rejects an incorrect test database name before creating a test pool', () => {
  const result = importWithEnvironment({ DB_NAME: 'another_test' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires DB_NAME=approveflow_test/);
});

test('rejects a missing test database name before creating a test pool', () => {
  const result = importWithEnvironment({ DB_NAME: undefined });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires DB_NAME=approveflow_test/);
});

test('rejects a non-local test database host before creating a test pool', () => {
  const result = importWithEnvironment({ DB_HOST: 'remote.example' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires DB_HOST/);
});
