import { AppError } from '../../../shared/errors/app-error.js';
import * as repository from '../repository/request-repository.js';
import { validateCreateRequest, validateDecisionComment } from '../validation/request-validation.js';
const forbidden = () => new AppError('Resource not found.', { status: 404, code: 'REQUEST_NOT_FOUND', expose: true });
const conflict = () => new AppError('Request is not in a valid state for this action.', { status: 409, code: 'INVALID_REQUEST_STATE', expose: true });
const validateRequestId = (id) => { if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new AppError('Request ID must be a valid UUID.', { status: 400, code: 'VALIDATION_ERROR', expose: true }); return id; };
export async function create(input, user) { return repository.createWithEvent(validateCreateRequest(input), user.id); }
export async function list(user) { return user.role === 'REQUESTER' ? repository.listByOwner(user.id) : repository.listPending(); }
export async function listDecisions(user) { return repository.listDecisionsByActor(user.id); }
export async function get(id, user) { const request = await repository.findById(validateRequestId(id)); if (!request || (user.role === 'REQUESTER' && request.created_by !== user.id) || (user.role === 'APPROVER' && request.status === 'DRAFT')) throw forbidden(); return request; }
export async function getHistory(id, user) { await get(id, user); return repository.history(id); }
export async function submit(id, user) { const result = await repository.transition({ requestId: validateRequestId(id), actorId: user.id, fromStatus: 'DRAFT', toStatus: 'PENDING_APPROVAL', eventType: 'REQUEST_SUBMITTED', ownerOnly: true }); if (!result.request || result.forbidden) throw forbidden(); if (result.conflict) throw conflict(); return result.request; }
async function decide(id, input, user, approved) { const comment = approved ? null : validateDecisionComment(input); const result = await repository.transition({ requestId: validateRequestId(id), actorId: user.id, fromStatus: 'PENDING_APPROVAL', toStatus: approved ? 'APPROVED' : 'REJECTED', eventType: approved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED', comment }); if (!result.request) throw forbidden(); if (result.conflict) throw conflict(); return result.request; }
export const approve = (id, input, user) => decide(id, input, user, true);
export const reject = (id, input, user) => decide(id, input, user, false);
