import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../shared/errors/app-error.js';
import { findUserByEmail } from '../repository/user-repository.js';
const invalidCredentials = () => new AppError('Invalid email or password.', { status: 401, code: 'INVALID_CREDENTIALS', expose: true });
function jwtConfig() { if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new AppError('Authentication is not configured.', { code: 'AUTH_CONFIGURATION_ERROR' }); return { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN || '1h' }; }
export async function authenticate({ email, password }) { const user = await findUserByEmail(email); const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false; if (!user || !passwordMatches || !user.is_active) throw invalidCredentials(); const { secret, expiresIn } = jwtConfig(); const token = jwt.sign({ role: user.role, email: user.email }, secret, { subject: user.id, expiresIn, issuer: 'approveflow-api', audience: 'approveflow-api' }); return { token, tokenType: 'Bearer', expiresIn, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role } }; }
export function verifyToken(token) { const { secret } = jwtConfig(); try { return jwt.verify(token, secret, { issuer: 'approveflow-api', audience: 'approveflow-api' }); } catch { throw new AppError('Authentication is required.', { status: 401, code: 'INVALID_TOKEN', expose: true }); } }
export { jwtConfig };
