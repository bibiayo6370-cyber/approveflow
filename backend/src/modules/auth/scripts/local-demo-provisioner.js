/**
 * Canonical local-only demo identities. Hosted provisioning uses the same public
 * email addresses but separately managed passwords, JWT secrets and user IDs.
 *
 * This module has no database imports so guards can be tested before any SQL.
 */
export const LOCAL_DEMO_ACCOUNTS = Object.freeze([
  Object.freeze({
    firstName: 'Sarah',
    lastName: 'Demo',
    email: 'sarah.demo@approveflow.example',
    role: 'REQUESTER',
    passwordEnv: 'DEMO_REQUESTER_PASSWORD',
  }),
  Object.freeze({
    firstName: 'Mark',
    lastName: 'Demo',
    email: 'mark.demo@approveflow.example',
    role: 'APPROVER',
    passwordEnv: 'DEMO_APPROVER_PASSWORD',
  }),
]);

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const EXPECTED_DATABASE_NAME = 'approveflow';

/** Reject an unsafe destination before opening a database connection. */
export function assertLocalDemoTarget(environment) {
  if (environment.CONFIRM_DEMO_SEED !== 'true') {
    throw new Error('Local demo provisioning requires CONFIRM_DEMO_SEED=true.');
  }
  if (environment.NODE_ENV === 'production' || environment.NODE_ENV === 'test') {
    throw new Error('Local demo provisioning is disabled in production and test.');
  }
  if (environment.DATABASE_URL !== undefined) {
    throw new Error('Local demo provisioning must not define DATABASE_URL.');
  }
  if (!LOCAL_HOSTS.has(environment.DB_HOST)) {
    throw new Error('Local demo provisioning requires DB_HOST=localhost, 127.0.0.1 or ::1.');
  }
  if (environment.DB_NAME !== EXPECTED_DATABASE_NAME) {
    throw new Error(`Local demo provisioning requires DB_NAME=${EXPECTED_DATABASE_NAME}.`);
  }
  const port = Number(environment.DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Local demo provisioning requires a valid DB_PORT.');
  }
}

/** Confirm the actual connected database name, not only the .env value. */
export async function verifyLocalDemoTarget(database) {
  const result = await database.query('SELECT current_database() AS database_name');
  if (result.rows?.[0]?.database_name !== EXPECTED_DATABASE_NAME) {
    throw new Error('Connected database is not the approved local approveflow database.');
  }
}

/**
 * Add only missing canonical identities. Never delete, rename or alter existing
 * local accounts (including the earlier demo.requester/approver@... accounts).
 * All preflight checks complete before the first INSERT.
 */
export async function provisionLocalDemoAccounts({
  database,
  find,
  create,
  hash,
  environment,
}) {
  assertLocalDemoTarget(environment);

  const passwords = LOCAL_DEMO_ACCOUNTS.map((account) => {
    const password = environment[account.passwordEnv];
    if (typeof password !== 'string' || password.length < 12) {
      throw new Error(`${account.passwordEnv} must be at least 12 characters.`);
    }
    return password;
  });

  await verifyLocalDemoTarget(database);

  const existing = [];
  // Check both accounts and their roles/activation state before making writes.
  for (const account of LOCAL_DEMO_ACCOUNTS) {
    const user = await find(account.email);
    if (user && (user.role !== account.role || user.is_active === false)) {
      throw new Error(`Existing canonical demo account is not active with expected role: ${account.email}`);
    }
    existing.push(user);
  }

  const created = [];
  const unchanged = [];
  for (let i = 0; i < LOCAL_DEMO_ACCOUNTS.length; i += 1) {
    const account = LOCAL_DEMO_ACCOUNTS[i];
    if (existing[i]) {
      unchanged.push(account.email);
      continue;
    }
    await create({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
      passwordHash: await hash(passwords[i], 12),
    });
    created.push(account.email);
  }

  return { created, unchanged };
}
