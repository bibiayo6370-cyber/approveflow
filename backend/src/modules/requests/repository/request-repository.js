import pool from '../../../config/database.js';

const requestFields = 'id, title, description, category, quantity, unit_cost, total_cost, required_date, justification, status, created_by, created_at, updated_at';
const eventFields = 'id, request_id, actor_id, event_type, comment, created_at';

export async function createWithEvent(request, actorId) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await client.query(`INSERT INTO requests (title, description, category, quantity, unit_cost, total_cost, required_date, justification, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${requestFields}`, [request.title, request.description, request.category, request.quantity, request.unitCost, request.totalCost, request.requiredDate, request.justification, actorId]); await client.query('INSERT INTO request_events (request_id, actor_id, event_type) VALUES ($1,$2,$3)', [result.rows[0].id, actorId, 'REQUEST_CREATED']); await client.query('COMMIT'); return result.rows[0]; } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function listByOwner(ownerId) { return (await pool.query(`SELECT ${requestFields} FROM requests WHERE created_by=$1 ORDER BY created_at DESC`, [ownerId])).rows; }
export async function listPending() { return (await pool.query(`SELECT ${requestFields} FROM requests WHERE status='PENDING_APPROVAL' ORDER BY created_at ASC`)).rows; }
export async function listDecisionsByActor(actorId) { return (await pool.query(`SELECT r.id, r.title, r.category, r.total_cost, e.event_type, e.comment, e.created_at AS decided_at FROM request_events e JOIN requests r ON r.id=e.request_id WHERE e.actor_id=$1 AND e.event_type IN ('REQUEST_APPROVED','REQUEST_REJECTED') ORDER BY e.created_at DESC, e.id DESC`, [actorId])).rows; }
export async function findById(id) { return (await pool.query(`SELECT ${requestFields} FROM requests WHERE id=$1`, [id])).rows[0] ?? null; }
export async function history(requestId) { return (await pool.query(`SELECT ${eventFields} FROM request_events WHERE request_id=$1 ORDER BY created_at ASC, id ASC`, [requestId])).rows; }
export async function transitionWithClient(client, { requestId, actorId, fromStatus, toStatus, eventType, comment, ownerOnly = false }) {
  let transactionFinished = false;
  let rollbackFailure;
  const rollback = async () => {
    if (transactionFinished || rollbackFailure) return;
    try { await client.query('ROLLBACK'); transactionFinished = true; } catch (error) { rollbackFailure = error; throw error; }
  };
  try {
    await client.query('BEGIN'); const found = await client.query(`SELECT ${requestFields} FROM requests WHERE id=$1 FOR UPDATE`, [requestId]); const request = found.rows[0];
    if (!request) { await rollback(); return { request: null }; }
    if (ownerOnly && request.created_by !== actorId) { await rollback(); return { request, forbidden: true }; }
    if (request.status !== fromStatus) { await rollback(); return { request, conflict: true }; }
    const updated = await client.query(`UPDATE requests SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING ${requestFields}`, [toStatus, requestId]); await client.query('INSERT INTO request_events (request_id, actor_id, event_type, comment) VALUES ($1,$2,$3,$4)', [requestId, actorId, eventType, comment ?? null]); await client.query('COMMIT'); transactionFinished = true; return { request: updated.rows[0] };
  } catch (error) {
    if (rollbackFailure) throw error;
    if (!transactionFinished) {
      try { await rollback(); } catch (rollbackError) { throw new AggregateError([error, rollbackError], 'Transaction failed and rollback failed.'); }
    }
    throw error;
  } finally { client.release(rollbackFailure); }
}
export async function transition(input) {
  const client = await pool.connect();
  return transitionWithClient(client, input);
}
