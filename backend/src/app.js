import express from 'express';
import authRoutes from './modules/auth/routes/auth-routes.js';
import requestRoutes from './modules/requests/routes/request-routes.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler.js';

const app = express();
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'approveflow-api'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
