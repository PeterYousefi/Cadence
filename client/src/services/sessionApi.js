/**
 * Client service to acquire ephemeral tokens from Cadence backend proxy.
 */

export async function fetchEphemeralToken() {
  const response = await fetch('/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expires_after: { seconds: 3600 }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || 
      `Backend proxy failed with status ${response.status}. Ensure backend is running on port 3001.`
    );
  }

  const data = await response.json();
  const secret = data.client_secret?.value || data.client_secret;

  if (!secret) {
    throw new Error('Backend response did not contain a valid ephemeral client secret.');
  }

  return {
    secret,
    expiresAt: data.client_secret?.expires_at || null,
    isMock: Boolean(data.mode === 'mock' || secret.startsWith('bai-eph-simulated'))
  };
}
