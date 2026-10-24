import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { sessionRouter } from './routes/session.js';
import { ttsBriefingRouter } from './routes/ttsBriefing.js';
import { avatarSpeakRouter } from './routes/avatarSpeak.js';
import { diagnosticsRouter } from './routes/diagnostics.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON payload limit for base64 engineer portrait uploads
app.use(express.json({ limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Cadence Gateway] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', healthRouter);
app.use('/api', sessionRouter);
app.use('/api', ttsBriefingRouter);
app.use('/api', avatarSpeakRouter);
app.use('/api', diagnosticsRouter);

// Fallback error handler
app.use(errorHandler);

// Start server if executed directly
const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirectRun || process.env.RUN_STANDALONE === 'true') {
  app.listen(config.port, () => {
    console.log(`🚀 Cadence API Gateway listening on http://localhost:${config.port}`);
    console.log(`🔑 Boson API Key status: ${config.bosonApiKey ? 'Configured' : 'Missing (provide BOSON_API_KEY)'}`);
  });
}

export { app };
