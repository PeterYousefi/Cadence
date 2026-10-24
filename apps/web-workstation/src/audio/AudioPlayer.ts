import { pcm16ToFloat32, base64ToArrayBuffer } from '../utils/audioPcm';
import { AUDIO_CONFIG } from '../constants/cadence';
import { AudioVisualizerSource } from '../types/cadence';

export interface AudioPlayerOptions {
  sampleRate?: number;
  onInterrupt?: () => void;
  onStateChange?: (isPlaying: boolean) => void;
}

export class AudioPlayer implements AudioVisualizerSource {
  private sampleRate: number;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private nextPlayTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  public isPlaying: boolean = false;
  private onInterrupt?: () => void;
  private onStateChange?: (isPlaying: boolean) => void;

  constructor(options: AudioPlayerOptions = {}) {
    this.sampleRate = options.sampleRate || AUDIO_CONFIG.SAMPLE_RATE;
    this.onInterrupt = options.onInterrupt;
    this.onStateChange = options.onStateChange;
  }

  public ensureContext(): void {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
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

  public queueAudioDelta(rawAudio: string | ArrayBuffer): void {
    this.ensureContext();
    if (!this.audioCtx || !this.analyser) return;

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

  public flush(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Node may already be stopped
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

  private updatePlayingState(playing: boolean): void {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      if (this.onStateChange) {
        this.onStateChange(playing);
      }
    }
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

  public close(): void {
    this.flush();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
