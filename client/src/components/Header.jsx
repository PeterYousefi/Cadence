import React from 'react';
import { Network, Sparkles, AudioWaveform, HelpCircle } from 'lucide-react';

export function Header({ isConnected, onOpenHelp }) {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-5 select-none z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-violet-600 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
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
              Cadence <span className="text-zinc-500">//</span> <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Boson AI Full-Duplex Architecture Engine</span>
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
              v1.0-LIVE
            </span>
          </div>
          <p className="text-[10px] font-mono text-zinc-500">
            higgs-realtime · Sub-Second Speech-to-Speech · Reactive Mermaid Canvas
          </p>
        </div>
      </div>

      {/* Badges and Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <AudioWaveform className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full-Duplex VAD (300ms)</span>
        </div>

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        )}
      </div>
    </header>
  );
}
