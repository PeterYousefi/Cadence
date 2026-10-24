import assert from 'assert';
import {
  floatTo16BitPCM,
  pcm16ToFloat32,
  downsampleBuffer,
  arrayBufferToBase64,
  base64ToArrayBuffer
} from '../src/utils/audioPcm.js';

function testAudioPcm() {
  // Test 1: Float32 <-> PCM16 round trip
  const original = new Float32Array([0.0, 0.5, -0.5, 0.99, -0.99]);
  const pcmBuffer = floatTo16BitPCM(original);
  assert.strictEqual(pcmBuffer.byteLength, original.length * 2);

  const recovered = pcm16ToFloat32(pcmBuffer);
  assert.strictEqual(recovered.length, original.length);
  for (let i = 0; i < original.length; i++) {
    assert.ok(Math.abs(recovered[i] - original[i]) < 0.001, `Index ${i} error: ${recovered[i]} vs ${original[i]}`);
  }

  // Test 2: Downsampling 48000 Hz to 24000 Hz
  const sample48k = new Float32Array(480);
  for (let i = 0; i < 480; i++) sample48k[i] = Math.sin(i / 10);
  const sample24k = downsampleBuffer(sample48k, 48000, 24000);
  assert.strictEqual(sample24k.length, 240);

  // Test 3: Base64 encode and decode
  const rawBytes = new Uint8Array([1, 2, 3, 4, 5, 254, 255]);
  const b64 = arrayBufferToBase64(rawBytes.buffer);
  assert.strictEqual(typeof b64, 'string');
  const decoded = new Uint8Array(base64ToArrayBuffer(b64));
  assert.deepStrictEqual(Array.from(decoded), Array.from(rawBytes));

  console.log('✅ Audio PCM, resampler, and Base64 codec tests passed successfully');
}

testAudioPcm();
