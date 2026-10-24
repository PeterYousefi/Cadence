import { floatTo16BitPCM, downsampleBuffer, arrayBufferToBase64 } from '../utils/audioPcm.js';
import { AUDIO_CONFIG } from '../constants/cadence.js';

export class AudioRecorder {
  constructor(options = {}) {
    this.targetSampleRate = options.sampleRate || AUDIO_CONFIG.SAMPLE_RATE;
    this.bufferSize = options.bufferSize || 4096;
    this.onAudioChunk = options.onAudioChunk || null;
    this.stream = null;
    this.audioCtx = null;
    this.source = null;
    this.processor = null;
    this.analyser = null;
    this.isRecording = false;
  }

  async start() {
    if (this.isRecording) return;

    // Request 24000 Hz mono mic if supported, or adapt to hardware default
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: this.targetSampleRate,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioCtxClass();
    const actualInputSampleRate = this.audioCtx.sampleRate;

    this.source = this.audioCtx.createMediaStreamSource(this.stream);

    // Mic Analyser for live visualizer
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.7;
    this.source.connect(this.analyser);

    // Audio processor node for PCM chunks
    this.processor = this.audioCtx.createScriptProcessor(this.bufferSize, 1, 1);

    this.processor.onaudioprocess = (event) => {
      if (!this.isRecording) return;
      const inputData = event.inputBuffer.getChannelData(0);

      // Downsample to 24 kHz if input is higher (e.g., 44.1k or 48k)
      const resampledData = downsampleBuffer(inputData, actualInputSampleRate, this.targetSampleRate);

      // Convert Float32 to 16-bit PCM ArrayBuffer
      const pcmBuffer = floatTo16BitPCM(resampledData);

      // Encode Base64
      const base64Chunk = arrayBufferToBase64(pcmBuffer);

      if (this.onAudioChunk) {
        this.onAudioChunk(base64Chunk);
      }
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
    this.isRecording = true;
  }

  getTimeDomainData(targetArray) {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(targetArray);
    }
  }

  getFrequencyData(targetArray) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(targetArray);
    }
  }

  stop() {
    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
