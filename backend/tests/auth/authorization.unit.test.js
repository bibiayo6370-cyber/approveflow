import test from 'node:test';
import assert from 'node:assert/strict';
import { requireRole } from '../../src/modules/auth/middleware/authentication.js';

function run(middleware, role) { return new Promise((resolve) => middleware({ auth: role ? { user: { role } } : undefined }, {}, (error) => resolve(error))); }
test('Requester role authorization permits requesters and denies approvers', async () => { assert.equal(await run(requireRole('REQUESTER'), 'REQUESTER'), undefined); const error = await run(requireRole('REQUESTER'), 'APPROVER'); assert.equal(error.status, 403); assert.equal(error.code, 'FORBIDDEN'); });
test('Approver role authorization permits approvers and denies requesters', async () => { assert.equal(await run(requireRole('APPROVER'), 'APPROVER'), undefined); const error = await run(requireRole('APPROVER'), 'REQUESTER'); assert.equal(error.status, 403); assert.equal(error.code, 'FORBIDDEN'); });
