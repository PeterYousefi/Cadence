/**
 * Client service to acquire ephemeral tokens from Cadence backend proxy.
 */

export interface EphemeralSessionResult {
  secret: string;
  token: string;
  expiresAt: number | null;
  raw?: any;
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
      errorData.message ||
      `Backend proxy failed with HTTP ${response.status}. Ensure backend is running on port 3001 with valid BOSON_API_KEY.`
    );
  }

  const data = await response.json();
  const secret = data.token || data.value || data.client_secret?.value || (typeof data.client_secret === 'string' ? data.client_secret : null);

  if (!secret) {
    throw new Error('Backend response did not contain a valid ephemeral client secret (bai-eph-...).');
  }

  return {
    secret,
    token: secret,
    expiresAt: data.expires_at || data.client_secret?.expires_at || null,
    raw: data
  };
}
