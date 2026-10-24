import { config } from '../config.js';

/**
 * Higgs Avatar Video Service
 * @param {object} [options]
 * @param {string} [options.script]
 * @param {string} [options.customPortraitBase64]
 * @param {string} [options.voiceId]
 */
export async function createAvatarSpeechSession(options = {}) {
  const apiKey = config.bosonApiKey?.trim();
  const sessionId = `avatar-sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Default Principal Architect persona portrait SVG/data URI
  const defaultPortrait = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23F4F3EF"/><circle cx="100" cy="70" r="40" fill="%23111111"/><path d="M40 180 C40 130 160 130 160 180 Z" fill="%23111111"/><circle cx="85" cy="65" r="5" fill="%23FF4F00"/><circle cx="115" cy="65" r="5" fill="%23FF4F00"/></svg>';

  const portrait = options.customPortraitBase64 || defaultPortrait;

  if (apiKey) {
    try {
      const response = await fetch('https://api.boson.ai/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'higgs-avatar',
          prompt: options.script || 'Cadence Systems Architect briefing',
          input_image: portrait.startsWith('data:') ? portrait.split(',')[1] : portrait
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          sessionId: data.id || sessionId,
          portraitUrl: portrait,
          streamUrl: data.video_url || data.stream_url || null,
          status: 'active',
          model: 'higgs-avatar',
          lipSyncAvailable: true
        };
      } else {
        console.warn(`[Boson Avatar] Remote /v1/videos returned ${response.status}; using reactive visualizer mode`);
      }
    } catch (err) {
      console.warn('[Boson Avatar] Remote call failed, using reactive visualizer mode:', err.message);
    }
  }

  return {
    sessionId,
    portraitUrl: portrait,
    streamUrl: null,
    status: 'simulated',
    model: 'higgs-avatar',
    lipSyncAvailable: true
  };
}
