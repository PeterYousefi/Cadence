import { Router } from 'express';
import { createAvatarSpeechSession } from '../services/bosonAvatarService.js';

export const avatarSpeakRouter = Router();

avatarSpeakRouter.post('/avatar-speak', async (req, res, next) => {
  try {
    const { script, customPortraitBase64, voiceId } = req.body || {};
    const result = await createAvatarSpeechSession({ script, customPortraitBase64, voiceId });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
