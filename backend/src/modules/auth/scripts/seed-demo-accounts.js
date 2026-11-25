import bcrypt from 'bcryptjs';
import pool from '../../../config/database.js';
import { createUser, findUserByEmail } from '../repository/user-repository.js';
import { provisionLocalDemoAccounts } from './local-demo-provisioner.js';

async function main() {
  try {
    const result = await provisionLocalDemoAccounts({
      database: pool,
      find: findUserByEmail,
      create: createUser,
      hash: bcrypt.hash,
      environment: process.env,
    });
    console.log('Local canonical demo accounts:', result);
    console.log('Earlier local demo accounts were not modified or removed.');
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith('seed-demo-accounts.js')) {
  main().catch((error) => {
    console.error(`Local demo provisioning failed: ${error.message}`);
    process.exitCode = 1;
  });
}
