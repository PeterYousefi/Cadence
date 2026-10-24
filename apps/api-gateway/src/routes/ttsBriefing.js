import { Router } from 'express';
import { generateHiggsTtsBriefing } from '../services/bosonTtsService.js';

export const ttsBriefingRouter = Router();

ttsBriefingRouter.post('/tts-briefing', async (req, res, next) => {
  try {
    const { script, scenario } = req.body || {};
    const result = await generateHiggsTtsBriefing(script, scenario);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
