import React from 'react';
import { X, Mic, Volume2, ShieldAlert, Cpu, Layers } from 'lucide-react';

export function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl font-mono text-zinc-300">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase text-white tracking-wider">
              Cadence Systems Architect Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-sans leading-relaxed">
          <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <Mic className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white font-mono text-xs">Full-Duplex Speech-to-Speech</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Click <strong>Connect Cadence Engine</strong>. Speak naturally as you would with a staff systems architect.
                Cadence listens continuously using 24kHz mono PCM audio streaming.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white font-mono text-xs">Zero-Lag Barge-in (Interruption)</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Interrupt anytime by speaking while Cadence is talking. The server VAD detects your voice,
                instantly flushes the browser audio playback buffer, and Cadence yields immediately.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <Layers className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white font-mono text-xs">Autonomous Architecture Synthesis</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Ask Cadence to:
                <br />• <em>"Add an Upstash Redis cache between our API gateway and user service."</em>
                <br />• <em>"Design a serverless SaaS architecture for global multi-region."</em>
                <br />• <em>"Add a Kafka DLQ to handle payment failures."</em>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition-colors"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
}
