export function assertHostedTarget(environment = process.env, confirmationName) {
  if (environment.NODE_ENV !== 'production') throw new Error('Hosted operation requires NODE_ENV=production.');
  if (environment[confirmationName] !== 'true') throw new Error(`Hosted operation requires ${confirmationName}=true.`);
  if (!environment.DATABASE_URL?.trim()) throw new Error('Hosted operation requires DATABASE_URL.');
  if (environment.DB_NAME || environment.DB_HOST || environment.DB_PORT) throw new Error('Hosted operation rejects local DB_* configuration.');
  if (!environment.HOSTED_DATABASE_NAME?.trim()) throw new Error('Hosted operation requires HOSTED_DATABASE_NAME.');
  const configuredName = new URL(environment.DATABASE_URL).pathname.replace(/^\//, '');
  if (configuredName !== environment.HOSTED_DATABASE_NAME) throw new Error('DATABASE_URL database name does not match HOSTED_DATABASE_NAME.');
}
export async function verifyHostedTarget(pool, environment = process.env) {
  const result = await pool.query('SELECT current_database() AS database_name');
  if (result.rows[0]?.database_name !== environment.HOSTED_DATABASE_NAME) throw new Error('Connected database does not match HOSTED_DATABASE_NAME.');
}
