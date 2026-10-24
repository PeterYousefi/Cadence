import React, { useRef, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { AudioVisualizerSource } from '../types/cadence';

interface AudioWaveformProps {
  micSource: AudioVisualizerSource | null;
  speakerSource: AudioVisualizerSource | null;
  isRecording: boolean;
  isSpeaking: boolean;
}

export function AudioWaveform({
  micSource,
  speakerSource,
  isRecording,
  isSpeaking
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const micData = new Uint8Array(256);
    const speakerData = new Uint8Array(256);
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark translucent clear for neon trail effect
      ctx.fillStyle = 'rgba(9, 9, 11, 0.45)';
      ctx.fillRect(0, 0, width, height);

      // Faint central baseline
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Sample data from sources
      if (micSource && isRecording) {
        micSource.getTimeDomainData(micData);
      } else {
        micData.fill(128);
      }

      if (speakerSource && isSpeaking) {
        speakerSource.getTimeDomainData(speakerData);
      } else {
        speakerData.fill(128);
      }

      // 1. Render Mic Input Waveform (Neon Cyan)
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isRecording ? '#06b6d4' : 'rgba(6, 182, 212, 0.3)';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = isRecording ? 14 : 2;

      const sliceWidthMic = width / micData.length;
      let xMic = 0;

      for (let i = 0; i < micData.length; i++) {
        let v = micData[i] / 128.0;
        if (!isRecording) {
          v += Math.sin(i * 0.06 + phase) * 0.04;
        }
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(xMic, y);
        } else {
          ctx.lineTo(xMic, y);
        }
        xMic += sliceWidthMic;
      }
      ctx.stroke();

      // 2. Render Cadence Output Waveform (Neon Violet & Pink)
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isSpeaking ? '#ec4899' : 'rgba(139, 92, 246, 0.3)';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = isSpeaking ? 16 : 2;

      const sliceWidthSpeaker = width / speakerData.length;
      let xSpeaker = 0;

      for (let i = 0; i < speakerData.length; i++) {
        let v = speakerData[i] / 128.0;
        if (!isSpeaking) {
          v += Math.cos(i * 0.06 + phase * 1.3) * 0.03;
        }
        const y = height - (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(xSpeaker, y);
        } else {
          ctx.lineTo(xSpeaker, y);
        }
        xSpeaker += sliceWidthSpeaker;
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
      phase += 0.05;

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [micSource, speakerSource, isRecording, isSpeaking]);

  return (
    <div className="relative rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md p-3.5 shadow-xl">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-300">
            Real-Time Oscilloscope
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-[10px] font-mono transition-colors ${
            isRecording ? 'text-cyan-400 font-semibold' : 'text-zinc-500'
          }`}>
            <Mic className="w-3.5 h-3.5" />
            <span>MIC IN</span>
          </div>
          <div className={`flex items-center gap-1.5 text-[10px] font-mono transition-colors ${
            isSpeaking ? 'text-pink-400 font-semibold' : 'text-zinc-500'
          }`}>
            <Volume2 className="w-3.5 h-3.5" />
            <span>AI OUT</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={420}
        height={90}
        className="w-full h-20 rounded-xl bg-zinc-950/90 block border border-zinc-900/80 shadow-inner"
      />
    </div>
  );
}
