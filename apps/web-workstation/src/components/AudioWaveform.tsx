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

      // Alabaster paper background
      ctx.fillStyle = '#F4F3EF';
      ctx.fillRect(0, 0, width, height);

      // 12px Grid lines in drafting gray
      ctx.strokeStyle = '#E2E0D8';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Center zero axis
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Sample data
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

      // 1. Mic Waveform (Signal Orange #FF4F00)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isRecording ? '#FF4F00' : 'rgba(255, 79, 0, 0.35)';

      const sliceWidthMic = width / micData.length;
      let xMic = 0;

      for (let i = 0; i < micData.length; i++) {
        let v = micData[i] / 128.0;
        if (!isRecording) {
          v += Math.sin(i * 0.08 + phase) * 0.03;
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

      // 2. Speaker Waveform (Carbon Black #111111)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSpeaking ? '#111111' : 'rgba(17, 17, 17, 0.25)';

      const sliceWidthSpeaker = width / speakerData.length;
      let xSpeaker = 0;

      for (let i = 0; i < speakerData.length; i++) {
        let v = speakerData[i] / 128.0;
        if (!isSpeaking) {
          v += Math.cos(i * 0.08 + phase * 1.2) * 0.03;
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
    <div className="border border-[#111111] bg-[#FFFFFF] shadow-cad p-3 text-xs font-mono">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FF4F00]" />
          <span className="font-bold tracking-wider text-[10px] uppercase">
            [02 // 24kHz OSCILLOSCOPE DUPLEX]
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div className={`flex items-center gap-1 font-bold ${isRecording ? 'text-[#FF4F00]' : 'text-[#767676]'}`}>
            <Mic className="w-3 h-3" />
            <span>MIC IN</span>
          </div>
          <div className={`flex items-center gap-1 font-bold ${isSpeaking ? 'text-[#111111]' : 'text-[#767676]'}`}>
            <Volume2 className="w-3 h-3" />
            <span>VOICE OUT</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={420}
        height={80}
        className="w-full h-18 bg-[#F4F3EF] border border-[#111111] block"
      />
    </div>
  );
}
