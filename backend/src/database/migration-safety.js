const TEST_DATABASE_NAME = 'approveflow_test';

export async function verifyTestMigrationTarget(pool, environment = process.env) {
  if (environment.NODE_ENV !== 'test') {
    throw new Error('Test migrations require NODE_ENV=test. No migration SQL was executed.');
  }

  if (environment.DATABASE_URL) {
    throw new Error('Test migrations reject DATABASE_URL. Configure DB_NAME=approveflow_test in .env.test. No migration SQL was executed.');
  }

  if (environment.DB_NAME !== TEST_DATABASE_NAME) {
    throw new Error(`Test migrations require DB_NAME=${TEST_DATABASE_NAME}. No migration SQL was executed.`);
  }

  const result = await pool.query('SELECT current_database() AS database_name');
  const connectedDatabaseName = result.rows[0]?.database_name;

  if (connectedDatabaseName !== TEST_DATABASE_NAME) {
    throw new Error(`Test migration connection resolved to ${connectedDatabaseName ?? 'an unknown database'}, not ${TEST_DATABASE_NAME}. No migration SQL was executed.`);
  }
}
