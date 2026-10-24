/**
 * Client service to acquire ephemeral tokens from Cadence backend proxy.
 */

export interface EphemeralSessionResult {
  secret: string;
  expiresAt: number | null;
  isMock: boolean;
}

export async function fetchEphemeralToken(): Promise<EphemeralSessionResult> {
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
  const secret = data.value || data.client_secret?.value || (typeof data.client_secret === 'string' ? data.client_secret : null);

  if (!secret) {
    throw new Error('Backend response did not contain a valid ephemeral client secret.');
  }

  return {
    secret,
    expiresAt: data.expires_at || data.client_secret?.expires_at || null,
    isMock: Boolean(data.mode === 'mock' || secret.startsWith('bai-eph-simulated'))
  };
}
