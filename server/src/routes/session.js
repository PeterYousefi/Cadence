import { Router } from 'express';
import { mintEphemeralToken } from '../services/bosonTokenService.js';

export const sessionRouter = Router();

sessionRouter.post('/session', async (req, res, next) => {
  try {
    const requestedExpiry = req.body?.expires_after?.seconds || 3600;
    const tokenData = await mintEphemeralToken(requestedExpiry);
    return res.status(200).json(tokenData);
  } catch (error) {
    next(error);
  }
});
