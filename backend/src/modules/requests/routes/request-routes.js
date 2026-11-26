import { Router } from 'express';
import * as controller from '../controller/request-controller.js';
import { requireAuthentication, requireRole } from '../../auth/middleware/authentication.js';
const router = Router(); router.use(requireAuthentication, requireRole('REQUESTER', 'APPROVER'));
router.post('/', requireRole('REQUESTER'), controller.create); router.get('/', controller.list); router.get('/pending', requireRole('APPROVER'), controller.list); router.get('/decisions', requireRole('APPROVER'), controller.decisions); router.post('/:id/submit', requireRole('REQUESTER'), controller.submit); router.post('/:id/approve', requireRole('APPROVER'), controller.approve); router.post('/:id/reject', requireRole('APPROVER'), controller.reject); router.get('/:id/history', controller.history); router.get('/:id', controller.get);
export default router;
