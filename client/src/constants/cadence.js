/**
 * Cadence System Constants and Configuration
 */

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 24000,
  CHANNELS: 1,
  BUFFER_SIZE: 2048,
  BIT_DEPTH: 16
};

export const WS_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  LISTENING: 'LISTENING',
  SPEAKING: 'SPEAKING',
  BARGED_IN: 'BARGED_IN',
  ERROR: 'ERROR'
};

export const BOSON_CONFIG = {
  WS_URL: 'wss://api.boson.ai/v1/realtime',
  MODEL: 'higgs-realtime',
  VOICE: 'default',
  STT_MODEL: 'higgs-stt-3.1',
  VAD_THRESHOLD: 0.5,
  VAD_SILENCE_MS: 300
};

export const SYSTEM_INSTRUCTIONS = 
  "You are Cadence, an elite systems architect. Converse concisely and casually. " +
  "When discussing, designing, or altering system topologies, ALWAYS invoke the 'render_architecture' " +
  "tool with valid Mermaid.js graph TD code.";
