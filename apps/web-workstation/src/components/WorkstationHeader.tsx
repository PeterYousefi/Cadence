import React from 'react';
import { Network, Sparkles, AudioWaveform, HelpCircle, Layers } from 'lucide-react';

interface WorkstationHeaderProps {
  isConnected: boolean;
  onOpenHelp?: () => void;
}

export function WorkstationHeader({ isConnected, onOpenHelp }: WorkstationHeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-5 select-none z-30">
      {/* Brand & Workstation Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-600 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-zinc-600'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? 'bg-emerald-500' : 'bg-zinc-700'
            }`} />
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-sm font-bold tracking-wider text-zinc-100 uppercase">
              Cadence <span className="text-zinc-500">//</span> <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Boson AI Systems Architect</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-semibold">
              REACT + TS
            </span>
          </div>
          <p className="text-[10px] font-mono text-zinc-500">
            higgs-realtime · Sub-Second Speech-to-Speech · Reactive Mermaid Canvas
          </p>
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400 backdrop-blur-md">
          <AudioWaveform className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full-Duplex VAD (300ms)</span>
        </div>

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-700"
          >
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        )}
      </div>
    </header>
  );
}
