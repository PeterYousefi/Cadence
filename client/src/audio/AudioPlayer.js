import { pcm16ToFloat32, base64ToArrayBuffer } from '../utils/audioPcm.js';
import { AUDIO_CONFIG } from '../constants/cadence.js';

export class AudioPlayer {
  constructor(options = {}) {
    this.sampleRate = options.sampleRate || AUDIO_CONFIG.SAMPLE_RATE;
    this.audioCtx = null;
    this.analyser = null;
    this.nextPlayTime = 0;
    this.activeSources = new Set();
    this.isPlaying = false;
    this.onInterrupt = options.onInterrupt || null;
    this.onStateChange = options.onStateChange || null;
  }

  ensureContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: this.sampleRate });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Queue and gaplessly schedule a delta chunk of PCM 16-bit audio.
   * @param {string | ArrayBuffer} rawAudio Base64-encoded PCM 16-bit or ArrayBuffer
   */
  queueAudioDelta(rawAudio) {
    this.ensureContext();

    const pcmBuffer = typeof rawAudio === 'string' ? base64ToArrayBuffer(rawAudio) : rawAudio;
    const float32 = pcm16ToFloat32(pcmBuffer);

    if (float32.length === 0) return;

    const audioBuffer = this.audioCtx.createBuffer(
      AUDIO_CONFIG.CHANNELS,
      float32.length,
      this.sampleRate
    );
    audioBuffer.getChannelData(0).set(float32);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.analyser);

    const currentTime = this.audioCtx.currentTime;
    // Schedule ahead for seamless gapless playback
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime + 0.02; // 20ms lead jitter buffer
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;

    this.activeSources.add(source);
    this.updatePlayingState(true);

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0) {
        this.updatePlayingState(false);
      }
    };
  }

  /**
   * Flushes all active audio nodes on user speech barge-in.
   */
  flush() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Node might have naturally ended
      }
    }
    this.activeSources.clear();
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    } else {
      this.nextPlayTime = 0;
    }
    this.updatePlayingState(false);
    if (this.onInterrupt) {
      this.onInterrupt();
    }
  }

  updatePlayingState(playing) {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      if (this.onStateChange) {
        this.onStateChange(playing);
      }
    }
  }

  getFrequencyData(targetArray) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(targetArray);
    }
  }

  getTimeDomainData(targetArray) {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(targetArray);
    }
  }

  close() {
    this.flush();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
