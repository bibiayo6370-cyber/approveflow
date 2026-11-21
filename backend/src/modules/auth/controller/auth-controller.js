import { authenticate } from '../service/auth-service.js'; import { validateLoginInput } from '../validation/login-validation.js';
export async function login(req, res, next) { try { return res.status(200).json(await authenticate(validateLoginInput(req.body))); } catch (error) { return next(error); } }
export function me(req, res) { return res.status(200).json({ user: req.auth.user }); }
