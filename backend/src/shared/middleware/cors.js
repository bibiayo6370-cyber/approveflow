const defaultOrigins = ['http://localhost:5173'];
const allowedMethods = new Set(['GET', 'POST']);
const allowedHeaders = new Set(['authorization', 'content-type']);

export function cors(req, res, next) {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || defaultOrigins.join(',')).split(',').map((origin) => origin.trim()).filter(Boolean);
  const origin = req.get('origin');
  const approved = origin && allowedOrigins.includes(origin);
  if (req.method === 'OPTIONS') {
    const method = req.get('access-control-request-method');
    const headers = (req.get('access-control-request-headers') || '').split(',').map((header) => header.trim().toLowerCase()).filter(Boolean);
    if (!approved || !allowedMethods.has(method) || headers.some((header) => !allowedHeaders.has(header))) return res.sendStatus(403);
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.sendStatus(204);
  }
  if (approved) { res.set('Access-Control-Allow-Origin', origin); res.set('Vary', 'Origin'); }
  return next();
}
