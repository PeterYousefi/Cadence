import { config } from '../config.js';

/**
 * Mint an ephemeral client secret token for direct browser WebSocket connections to Boson Realtime API.
 * @param {number} [expiresAfterSeconds=3600] Token validity duration
 * @returns {Promise<{ client_secret: { value: string, expires_at: number } }>}
 */
export async function mintEphemeralToken(expiresAfterSeconds = 3600) {
  const apiKey = config.bosonApiKey?.trim();

  if (!apiKey) {
    if (process.env.DEMO_MODE === 'true' || process.env.MOCK_BOSON === 'true') {
      console.warn('[Cadence Server] BOSON_API_KEY missing; generating mock ephemeral token for simulation mode');
      return {
        client_secret: {
          value: `bai-eph-simulated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          expires_at: Math.floor(Date.now() / 1000) + expiresAfterSeconds
        },
        mode: 'mock'
      };
    }
    throw new Error('BOSON_API_KEY environment variable is not configured. Please supply a valid Boson AI API key in server/.env.');
  }

  const endpoint = 'https://api.boson.ai/v1/realtime/client_secrets';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expires_after: {
        seconds: expiresAfterSeconds
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(errorBody);
    } catch {
      parsed = { message: errorBody };
    }
    const err = new Error(`Boson API client_secrets returned HTTP ${response.status}: ${parsed.message || errorBody}`);
    err.status = response.status;
    err.details = parsed;
    throw err;
  }

  const data = await response.json();
  const secretValue = data.value || data.client_secret?.value || data.client_secret;
  return {
    ...data,
    value: secretValue,
    client_secret: {
      value: secretValue,
      expires_at: data.expires_at || (Math.floor(Date.now() / 1000) + expiresAfterSeconds)
    }
  };
}
