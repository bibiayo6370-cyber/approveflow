export class AppError extends Error { constructor(message, { status = 500, code = 'INTERNAL_ERROR', expose = false } = {}) { super(message); this.status = status; this.code = code; this.expose = expose; } }
export const validationError = (message) => new AppError(message, { status: 400, code: 'VALIDATION_ERROR', expose: true });
