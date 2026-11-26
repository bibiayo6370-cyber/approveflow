import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import app from '../../src/app.js';
import pool, { getDatabaseName } from '../../src/config/database.js';
import { transition, transitionWithClient } from '../../src/modules/requests/repository/request-repository.js';

let server; let baseUrl; let requester; let otherRequester; let approver; let secondApprover;
const credentials = { requester: 'requester@example.com', other: 'other@example.com', approver: 'approver@example.com', second: 'approver2@example.com' };
const requestInput = { title: 'Project laptops', description: 'Five high-performance laptops', category: 'EQUIPMENT', quantity: 3, unitCost: '12.34', requiredDate: '2026-12-15', justification: 'Delivery project' };

const token = (user) => jwt.sign({ role: user.role, email: user.email }, process.env.JWT_SECRET, { subject: user.id, expiresIn: '1h', issuer: 'approveflow-api', audience: 'approveflow-api' });
async function api(path, user, options = {}) { return fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', authorization: `Bearer ${token(user)}`, ...options.headers } }); }
async function create(input = requestInput) { const response = await api('/api/requests', requester, { method: 'POST', body: JSON.stringify(input) }); assert.equal(response.status, 201); return (await response.json()).request; }
async function submit(id) { const response = await api(`/api/requests/${id}/submit`, requester, { method: 'POST' }); assert.equal(response.status, 200); return (await response.json()).request; }
async function assertNoOpenTransaction() { const client = await pool.connect(); try { const result = await client.query('SELECT txid_current_if_assigned() AS transaction_id'); assert.equal(result.rows[0].transaction_id, null); } finally { client.release(); } }

before(async () => {
  assert.equal(process.env.NODE_ENV, 'test'); assert.equal(getDatabaseName(), 'approveflow_test');
  const identity = await pool.query('SELECT current_database() AS database_name'); assert.equal(identity.rows[0].database_name, 'approveflow_test');
  await pool.query('TRUNCATE request_events, requests, users CASCADE'); const hash = await bcrypt.hash('test-password', 10);
  const users = await pool.query(`INSERT INTO users (first_name,last_name,email,password_hash,role) VALUES ($1,$2,$3,$4,$5),($6,$7,$8,$9,$10),($11,$12,$13,$14,$15),($16,$17,$18,$19,$20) RETURNING id,email,role`, ['Rita','Requester',credentials.requester,hash,'REQUESTER','Owen','Other',credentials.other,hash,'REQUESTER','Amy','Approver',credentials.approver,hash,'APPROVER','Ben','Approver',credentials.second,hash,'APPROVER']);
  [requester, otherRequester, approver, secondApprover] = users.rows; await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); }); baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise((resolve) => server.close(resolve)); await pool.end(); });

test('creates a requester-owned draft with a server-calculated exact total and creation event', async () => {
  const draft = await create({ ...requestInput, status: 'APPROVED', createdBy: otherRequester.id, totalCost: '0.01' });
  assert.equal(draft.status, 'DRAFT'); assert.equal(draft.created_by, requester.id); assert.equal(draft.total_cost, '37.02');
  const events = await (await api(`/api/requests/${draft.id}/history`, requester)).json(); assert.deepEqual(events.events.map((event) => event.event_type), ['REQUEST_CREATED']);
  const forbidden = await api(`/api/requests/${draft.id}`, otherRequester); assert.equal(forbidden.status, 404);
  const approverCannotReadDraft = await api(`/api/requests/${draft.id}`, approver); assert.equal(approverCannotReadDraft.status, 404);
});

test('validates required fields and positive monetary input', async () => {
  for (const invalid of [{ ...requestInput, title: '' }, { ...requestInput, quantity: 0 }, { ...requestInput, unitCost: '1.999' }, { ...requestInput, requiredDate: '2026-02-31' }]) { const response = await api('/api/requests', requester, { method: 'POST', body: JSON.stringify(invalid) }); assert.equal(response.status, 400); }
  const malformedId = await api('/api/requests/not-a-uuid', requester); assert.equal(malformedId.status, 400);
});

test('rolls back missing, forbidden, and stale transitions before reusing the pool', async () => {
  const missing = await api('/api/requests/00000000-0000-4000-8000-000000000000/submit', requester, { method: 'POST' }); assert.equal(missing.status, 404); await assertNoOpenTransaction();
  const draft = await create(); const forbidden = await api(`/api/requests/${draft.id}/submit`, otherRequester, { method: 'POST' }); assert.equal(forbidden.status, 404); await assertNoOpenTransaction();
  const untouched = await (await api(`/api/requests/${draft.id}`, requester)).json(); assert.equal(untouched.request.status, 'DRAFT'); await submit(draft.id);
  const stale = await api(`/api/requests/${draft.id}/submit`, requester, { method: 'POST' }); assert.equal(stale.status, 409); await assertNoOpenTransaction();
  const history = await (await api(`/api/requests/${draft.id}/history`, requester)).json(); assert.deepEqual(history.events.map((event) => event.event_type), ['REQUEST_CREATED', 'REQUEST_SUBMITTED']);
});

test('reuses the same pooled connection cleanly after a rejected transition', async () => {
  const singlePool = new pg.Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, max: 1 });
  try {
    const client = await singlePool.connect(); const before = await client.query('SELECT pg_backend_pid() AS pid');
    const result = await transitionWithClient(client, { requestId: '00000000-0000-4000-8000-000000000000', actorId: requester.id, fromStatus: 'DRAFT', toStatus: 'PENDING_APPROVAL', eventType: 'REQUEST_SUBMITTED', ownerOnly: true }); assert.equal(result.request, null);
    const reused = await singlePool.connect(); try { const after = await reused.query('SELECT pg_backend_pid() AS pid, txid_current_if_assigned() AS transaction_id, 1 AS healthy'); assert.equal(after.rows[0].pid, before.rows[0].pid); assert.equal(after.rows[0].transaction_id, null); assert.equal(after.rows[0].healthy, 1); } finally { reused.release(); }
  } finally { await singlePool.end(); }
});

test('discards a client when rollback fails without retrying rollback or releasing twice', async () => {
  const rollbackError = new Error('rollback unavailable'); const releases = []; const queries = [];
  const client = { async query(sql) { queries.push(sql); if (sql === 'BEGIN') return; if (sql.startsWith('SELECT')) return { rows: [] }; if (sql === 'ROLLBACK') throw rollbackError; throw new Error(`Unexpected query: ${sql}`); }, release(error) { releases.push(error); } };
  await assert.rejects(transitionWithClient(client, { requestId: '00000000-0000-4000-8000-000000000000', actorId: requester.id, fromStatus: 'DRAFT', toStatus: 'PENDING_APPROVAL', eventType: 'REQUEST_SUBMITTED' }), /rollback unavailable/);
  assert.equal(queries.filter((sql) => sql === 'ROLLBACK').length, 1); assert.deepEqual(releases, [rollbackError]);
});

test('submits a draft, exposes it to approvers, and records immutable history', async () => {
  const draft = await create(); const submitted = await submit(draft.id); assert.equal(submitted.status, 'PENDING_APPROVAL');
  const inbox = await api('/api/requests/pending', approver); assert.equal(inbox.status, 200); assert.ok((await inbox.json()).requests.some((request) => request.id === draft.id));
  const events = await (await api(`/api/requests/${draft.id}/history`, approver)).json(); assert.deepEqual(events.events.map((event) => event.event_type), ['REQUEST_CREATED', 'REQUEST_SUBMITTED']);
  await assert.rejects(pool.query('UPDATE request_events SET comment=$1 WHERE request_id=$2', ['tamper', draft.id]), /append-only/);
});

test('approves once and rejects repeated transitions', async () => {
  const draft = await create(); await submit(draft.id); const approved = await api(`/api/requests/${draft.id}/approve`, approver, { method: 'POST', body: '{}' }); assert.equal(approved.status, 200); assert.equal((await approved.json()).request.status, 'APPROVED');
  const repeated = await api(`/api/requests/${draft.id}/approve`, secondApprover, { method: 'POST', body: '{}' }); assert.equal(repeated.status, 409);
  await assertNoOpenTransaction();
  const events = await (await api(`/api/requests/${draft.id}/history`, approver)).json(); assert.equal(events.events.at(-1).actor_id, approver.id); assert.equal(events.events.at(-1).event_type, 'REQUEST_APPROVED');
});

test('requires a rejection comment and persists it', async () => {
  const draft = await create(); await submit(draft.id); const missing = await api(`/api/requests/${draft.id}/reject`, approver, { method: 'POST', body: '{}' }); assert.equal(missing.status, 400);
  const rejected = await api(`/api/requests/${draft.id}/reject`, approver, { method: 'POST', body: JSON.stringify({ comment: 'Budget unavailable' }) }); assert.equal(rejected.status, 200); assert.equal((await rejected.json()).request.status, 'REJECTED');
  const events = await (await api(`/api/requests/${draft.id}/history`, requester)).json(); assert.equal(events.events.at(-1).comment, 'Budget unavailable');
});

test('lists only the signed-in approver’s recorded decisions and denies requesters', async () => {
  const first = await create(); await submit(first.id); await api(`/api/requests/${first.id}/approve`, approver, { method: 'POST', body: '{}' });
  const second = await create(); await submit(second.id); await api(`/api/requests/${second.id}/reject`, approver, { method: 'POST', body: JSON.stringify({ comment: 'Revise quantity' }) });
  const other = await create(); await submit(other.id); await api(`/api/requests/${other.id}/approve`, secondApprover, { method: 'POST', body: '{}' });
  const response = await api('/api/requests/decisions', approver); assert.equal(response.status, 200); const { decisions } = await response.json();
  assert.ok(decisions.some(d => d.id === first.id && d.event_type === 'REQUEST_APPROVED' && d.decided_at));
  assert.ok(decisions.some(d => d.id === second.id && d.event_type === 'REQUEST_REJECTED' && d.comment === 'Revise quantity'));
  assert.ok(!decisions.some(d => d.id === other.id));
  assert.equal((await api('/api/requests/decisions', requester)).status, 403);
});

test('rolls back a transition if its event cannot be inserted', async () => {
  const draft = await create(); await submit(draft.id); await assert.rejects(transition({ requestId: draft.id, actorId: approver.id, fromStatus: 'PENDING_APPROVAL', toStatus: 'APPROVED', eventType: 'INVALID_EVENT' })); const request = await (await api(`/api/requests/${draft.id}`, approver)).json(); assert.equal(request.request.status, 'PENDING_APPROVAL');
});

test('allows only one concurrent decision and records one decision event', async () => {
  const draft = await create(); await submit(draft.id); const decisions = await Promise.all([api(`/api/requests/${draft.id}/approve`, approver, { method: 'POST', body: '{}' }), api(`/api/requests/${draft.id}/reject`, secondApprover, { method: 'POST', body: JSON.stringify({ comment: 'No' }) })]); assert.deepEqual(decisions.map((response) => response.status).sort(), [200, 409]); const events = await (await api(`/api/requests/${draft.id}/history`, approver)).json(); assert.equal(events.events.filter((event) => ['REQUEST_APPROVED', 'REQUEST_REJECTED'].includes(event.event_type)).length, 1);
});
