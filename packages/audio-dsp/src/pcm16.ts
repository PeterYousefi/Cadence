/**
 * 24kHz PCM16 Conversion, Resampling, and Base64 Codecs
 */

export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

export function pcm16ToFloat32(pcmBuffer: ArrayBuffer | Uint8Array): Float32Array {
  const bytes = pcmBuffer instanceof ArrayBuffer ? new Uint8Array(pcmBuffer) : pcmBuffer;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const length = Math.floor(bytes.byteLength / 2);
  const float32 = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7FFF;
  }
  return float32;
}

export function downsampleTo24kHz(
  buffer: Float32Array,
  inputSampleRate: number
): Float32Array {
  const targetSampleRate = 24000;
  if (inputSampleRate === targetSampleRate) {
    return buffer;
  }
  const sampleRateRatio = inputSampleRate / targetSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

export function computeRmsVolume(buffer: Float32Array): number {
  if (!buffer || buffer.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  return Math.sqrt(sumSquares / buffer.length);
}

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 2048; // Safe chunk size <= 4096 to prevent call-stack overflow
  for (let i = 0; i < len; i += chunkSize) {
    const end = Math.min(i + chunkSize, len);
    const sub = bytes.subarray(i, end);
    let chunkStr = '';
    for (let j = 0; j < sub.length; j++) {
      chunkStr += String.fromCharCode(sub[j]);
    }
    binary += chunkStr;
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
