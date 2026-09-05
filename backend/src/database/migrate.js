import pool from '../config/database.js';

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function main() {
  try {
    await ensureMigrationTable();
    console.log('Migration history table is ready.');
  } finally {
    await pool.end();
  }
}

main();
