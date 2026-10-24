import assert from 'assert';
import { app } from '../src/index.js';

async function testSessionRoute() {
  process.env.DEMO_MODE = 'true';
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_after: { seconds: 1800 } })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.client_secret, 'Response must contain client_secret');
    assert.ok(data.client_secret.value.startsWith('bai-eph-'), 'Secret must start with bai-eph-');
    console.log('✅ Server session endpoint verification passed with token:', data.client_secret.value.substring(0, 16) + '...');
  } finally {
    server.close();
  }
}

testSessionRoute().catch((err) => {
  console.error('❌ Server session test failed:', err);
  process.exit(1);
});
