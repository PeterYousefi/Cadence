import React from 'react';
import { X, Mic, Cpu, Layers, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-2xl font-mono text-zinc-300 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase text-white tracking-wider">
              Cadence Architect Workstation Guide
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
          <div className="flex gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <Mic className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white font-mono text-xs">Full-Duplex Speech-to-Speech</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Click <strong>Initialize Workstation</strong>. Converse naturally. Cadence streams 24kHz signed 16-bit PCM audio bidirectionally with sub-second latency.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white font-mono text-xs">Zero-Lag Barge-in (Interruption)</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Interrupt anytime by speaking over Cadence. Server VAD instantly detects your voice, flushes audio buffers, and resets the playback timeline.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <Layers className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white font-mono text-xs">Autonomous Architecture Synthesis</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Cadence dynamically invokes <code>render_architecture</code> to rewire diagrams in real time without refreshing the viewport.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition-colors shadow-lg shadow-cyan-500/20"
          >
            Enter Workstation
          </button>
        </div>
      </div>
    </div>
  );
}
