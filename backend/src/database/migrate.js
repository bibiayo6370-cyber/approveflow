import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, '../../database/migrations');

const migrationsFilePattern = /^\d{3}_[a-z0-9_]+\.sql$/;

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getMigrationFiles() {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();

  for (const file of files) {
    if (!migrationsFilePattern.test(file)) {
      throw new Error(`Invalid migration filename: ${file}`);
    }
  }

  return files;
}

async function getAppliedMigrations() {
  const result = await pool.query(`
    SELECT migration_name
    FROM schema_migrations
    ORDER BY id
  `);

  return result.rows.map((row) => row.migration_name);
}

async function runMigration(migrationName, migrationSql) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(migrationSql);

    await client.query(
      'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
      [migrationName]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await ensureMigrationTable();

    const migrationFiles = await getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();

    const pendingMigrations = migrationFiles.filter(
      (migration) => !appliedMigrations.includes(migration)
    );

    for (const migrationName of pendingMigrations) {
      const migrationPath = path.join(migrationsDirectory, migrationName);
      const migrationSql = await readFile(migrationPath, 'utf8');

      console.log(`Applying migration: ${migrationName}`);

      await runMigration(migrationName, migrationSql);

      console.log(`Migration applied: ${migrationName}`);
    }

    const finalAppliedMigrations = await getAppliedMigrations();
    const finalPendingMigrations = migrationFiles.filter(
      (migration) => !finalAppliedMigrations.includes(migration)
    );

    console.log('Migration history table is ready.');
    console.log('Migration files:', migrationFiles);
    console.log('Applied migrations:', finalAppliedMigrations);
    console.log('Pending migrations:', finalPendingMigrations);
  } finally {
    await pool.end();
  }
}

main();
