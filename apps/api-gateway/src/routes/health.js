import { Router } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cadence-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hasBosonKey: Boolean(config.bosonApiKey && config.bosonApiKey.trim().length > 0)
  });
});
