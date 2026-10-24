import { floatTo16BitPCM, downsampleBuffer, arrayBufferToBase64 } from '../utils/audioPcm';
import { AUDIO_CONFIG } from '../constants/cadence';
import { AudioVisualizerSource } from '../types/cadence';

export interface AudioRecorderOptions {
  sampleRate?: number;
  bufferSize?: number;
  onAudioChunk?: (base64Chunk: string) => void;
}

export class AudioRecorder implements AudioVisualizerSource {
  private targetSampleRate: number;
  private bufferSize: number;
  private onAudioChunk?: (base64Chunk: string) => void;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  public isRecording: boolean = false;

  constructor(options: AudioRecorderOptions = {}) {
    this.targetSampleRate = options.sampleRate || AUDIO_CONFIG.SAMPLE_RATE;
    this.bufferSize = options.bufferSize || 4096;
    this.onAudioChunk = options.onAudioChunk;
  }

  public async start(): Promise<void> {
    if (this.isRecording) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: this.targetSampleRate,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioCtxClass();
    const actualInputSampleRate = this.audioCtx.sampleRate;

    this.source = this.audioCtx.createMediaStreamSource(this.stream);

    // Mic Analyser for live oscilloscope
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.7;
    this.source.connect(this.analyser);

    // Audio processor node for PCM chunks
    this.processor = this.audioCtx.createScriptProcessor(this.bufferSize, 1, 1);

    this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this.isRecording) return;
      const inputData = event.inputBuffer.getChannelData(0);

      const resampledData = downsampleBuffer(inputData, actualInputSampleRate, this.targetSampleRate);
      const pcmBuffer = floatTo16BitPCM(resampledData);
      const base64Chunk = arrayBufferToBase64(pcmBuffer);

      if (this.onAudioChunk) {
        this.onAudioChunk(base64Chunk);
      }
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
    this.isRecording = true;
  }

  public getTimeDomainData(targetArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(targetArray as any);
    }
  }

  public getFrequencyData(targetArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(targetArray as any);
    }
  }

  public stop(): void {
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
