import pg from 'pg';

const { Pool } = pg;
const TEST_DATABASE_NAME = 'approveflow_test';
const LOCAL_TEST_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function parseBoolean(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return value === 'true';
}

function getDatabaseName(environment = process.env) {
  if (environment.DATABASE_URL) return new URL(environment.DATABASE_URL).pathname.replace(/^\//, '');
  return environment.DB_NAME;
}

function assertSafeTestDatabase(environment = process.env) {
  if (environment.NODE_ENV !== 'test') return;

  if (environment.DATABASE_URL?.trim()) {
    throw new Error('Test configuration must not define DATABASE_URL. Use the local approveflow_test database configuration.');
  }

  if (environment.DB_NAME !== TEST_DATABASE_NAME) {
    throw new Error(`Test configuration requires DB_NAME=${TEST_DATABASE_NAME}.`);
  }

  if (!LOCAL_TEST_HOSTS.has(environment.DB_HOST)) {
    throw new Error('Test configuration requires DB_HOST to be localhost, 127.0.0.1, or ::1.');
  }
}

assertSafeTestDatabase();

const ssl = parseBoolean(process.env.DB_SSL)
  ? { rejectUnauthorized: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true) }
  : undefined;
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl }
  : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl };
const pool = new Pool(poolConfig);

export { assertSafeTestDatabase, getDatabaseName };
export default pool;
