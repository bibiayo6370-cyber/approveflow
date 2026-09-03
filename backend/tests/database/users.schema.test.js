import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import pool from '../../src/config/database.js';

after(async () => {
  await pool.end();
});

test('users table accepts a valid user', async () => {
  const email = `test-${Date.now()}@example.com`;
  let userId;

  try {
    const result = await pool.query(
      `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, role, is_active
    `,
      ['Test', 'User', email, 'test_hash_only', 'REQUESTER']
    );

    userId = result.rows[0].id;

    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].email, email);
    assert.equal(result.rows[0].role, 'REQUESTER');
    assert.equal(result.rows[0].is_active, true);
    assert.ok(result.rows[0].id);
  } finally {
    if (userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  }
});
