import { Router } from 'express'; import { login, me } from '../controller/auth-controller.js'; import { requireAuthentication } from '../middleware/authentication.js';
const router = Router(); router.post('/login', login); router.get('/me', requireAuthentication, me); export default router;
