import React, { useRef, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';

export function AudioVisualizer({ audioRecorder, audioPlayer, isRecording, isSpeaking }) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const micDataArray = new Uint8Array(256);
    const speakerDataArray = new Uint8Array(256);

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark fade trail
      ctx.fillStyle = 'rgba(9, 9, 11, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Draw faint center grid line
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Sample data
      if (audioRecorder && isRecording) {
        audioRecorder.getTimeDomainData(micDataArray);
      } else {
        micDataArray.fill(128);
      }

      if (audioPlayer && isSpeaking) {
        audioPlayer.getTimeDomainData(speakerDataArray);
      } else {
        speakerDataArray.fill(128);
      }

      // 1. Draw Mic Waveform (Neon Cyan)
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isRecording ? '#06b6d4' : 'rgba(6, 182, 212, 0.25)';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = isRecording ? 12 : 2;

      const sliceWidthMic = width / micDataArray.length;
      let xMic = 0;

      for (let i = 0; i < micDataArray.length; i++) {
        let v = micDataArray[i] / 128.0;
        // Add subtle oscillation if idle
        if (!isRecording) {
          v += Math.sin(i * 0.05 + phase) * 0.04;
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

      // 2. Draw Speaker/Cadence Waveform (Neon Violet & Pink)
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isSpeaking ? '#ec4899' : 'rgba(139, 92, 246, 0.25)';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = isSpeaking ? 16 : 2;

      const sliceWidthSpeaker = width / speakerDataArray.length;
      let xSpeaker = 0;

      for (let i = 0; i < speakerDataArray.length; i++) {
        let v = speakerDataArray[i] / 128.0;
        // Invert & add slight harmonic shift
        if (!isSpeaking) {
          v += Math.cos(i * 0.05 + phase * 1.2) * 0.03;
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

      // Reset shadow blur
      ctx.shadowBlur = 0;
      phase += 0.04;

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [audioRecorder, audioPlayer, isRecording, isSpeaking]);

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 shadow-inner backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Oscilloscope Stream
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-[10px] font-mono transition-colors ${
            isRecording ? 'text-cyan-400 font-semibold' : 'text-zinc-600'
          }`}>
            <Mic className="w-3 h-3" />
            <span>MIC IN</span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-mono transition-colors ${
            isSpeaking ? 'text-pink-400 font-semibold' : 'text-zinc-600'
          }`}>
            <Volume2 className="w-3 h-3" />
            <span>CADENCE OUT</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={85}
        className="w-full h-20 rounded-lg bg-zinc-950 block border border-zinc-900"
      />
    </div>
  );
}
