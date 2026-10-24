/**
 * Audio PCM conversion, resampling, and binary encoding utilities.
 */

/**
 * Converts Float32 audio samples (-1.0 to 1.0) to 16-bit PCM ArrayBuffer.
 * @param {Float32Array} float32Array
 * @returns {ArrayBuffer}
 */
export function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

/**
 * Converts 16-bit PCM bytes (Little Endian) to normalized Float32Array (-1.0 to 1.0).
 * @param {ArrayBuffer | Uint8Array} pcmBuffer
 * @returns {Float32Array}
 */
export function pcm16ToFloat32(pcmBuffer) {
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

/**
 * Resamples an audio buffer from input sample rate to target sample rate via linear interpolation.
 * @param {Float32Array} buffer
 * @param {number} inputSampleRate
 * @param {number} targetSampleRate
 * @returns {Float32Array}
 */
export function downsampleBuffer(buffer, inputSampleRate, targetSampleRate = 24000) {
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

/**
 * Encodes an ArrayBuffer or Uint8Array into a Base64 string.
 * @param {ArrayBuffer | Uint8Array} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunkSize, len))
    );
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into an ArrayBuffer.
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
export function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
