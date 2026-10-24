import assert from 'assert';
import { app } from '../src/index.js';

async function testHealth() {
  const server = app.listen(0);
  const port = server.address().port;
  
  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'cadence-backend');
    console.log('✅ Server health endpoint verification passed');
  } finally {
    server.close();
  }
}

testHealth().catch((err) => {
  console.error('❌ Server health test failed:', err);
  process.exit(1);
});
