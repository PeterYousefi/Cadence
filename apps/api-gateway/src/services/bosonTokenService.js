import { config } from '../config.js';

/**
 * Mint an ephemeral client secret token for direct browser WebSocket connections to Boson Realtime API.
 * @param {number} [expiresAfterSeconds=3600] Token validity duration
 * @returns {Promise<{ client_secret: { value: string, expires_at: number } }>}
 */
export async function mintEphemeralToken(expiresAfterSeconds = 3600) {
  const apiKey = config.bosonApiKey?.trim() || process.env.BOSON_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('BOSON_API_KEY environment variable is not configured. Please supply a valid Boson AI API key in .env.');
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
    }),
    signal: AbortSignal.timeout(6000)
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
  console.log('[Cadence Gateway] Boson client_secrets raw response:', JSON.stringify(data));

  const secretValue = data.value || data.client_secret?.value || data.token || data.secret || (typeof data.client_secret === 'string' ? data.client_secret : null);

  if (!secretValue) {
    throw new Error('Boson client_secrets response did not contain an ephemeral secret value.');
  }

  return {
    token: secretValue,
    value: secretValue,
    raw: data,
    client_secret: {
      value: secretValue,
      expires_at: data.expires_at || data.client_secret?.expires_at || (Math.floor(Date.now() / 1000) + expiresAfterSeconds)
    }
  };
}
