import React from 'react';
import { Activity, Radio, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { WS_STATUS } from '../constants/cadence.js';

export function TelemetryBadges({
  wsStatus,
  isRecording,
  isSpeaking,
  hasBargedIn,
  latencyMs = 168
}) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
      {/* 1. WebSocket Engine State */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${
            wsStatus === WS_STATUS.CONNECTED ? 'text-emerald-400' :
            wsStatus === WS_STATUS.CONNECTING ? 'text-amber-400 animate-spin' :
            'text-zinc-500'
          }`} />
          <span className="text-zinc-400 text-[11px]">SOCKET</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
          wsStatus === WS_STATUS.CONNECTED ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
          wsStatus === WS_STATUS.CONNECTING ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
          'bg-zinc-800 text-zinc-400'
        }`}>
          {wsStatus === WS_STATUS.CONNECTED ? 'Connected' :
           wsStatus === WS_STATUS.CONNECTING ? 'Handshake' : 'Offline'}
        </span>
      </div>

      {/* 2. Audio Pipeline State */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${
            isSpeaking ? 'text-pink-400 animate-pulse' :
            isRecording ? 'text-cyan-400 animate-pulse' :
            'text-zinc-500'
          }`} />
          <span className="text-zinc-400 text-[11px]">PIPELINE</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
          isSpeaking ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30' :
          isRecording ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
          'bg-zinc-800 text-zinc-400'
        }`}>
          {isSpeaking ? 'Synthesizing' : isRecording ? 'Listening' : 'Idle'}
        </span>
      </div>

      {/* 3. Latency Metric */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400 text-[11px]">LATENCY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-200 font-bold text-[11px]">
            {wsStatus === WS_STATUS.CONNECTED ? `${latencyMs}ms` : '--'}
          </span>
          <span className="text-[9px] text-zinc-500">RTT</span>
        </div>
      </div>

      {/* 4. Model Telemetry */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-zinc-400 text-[11px]">MODEL</span>
        </div>
        <span className="text-zinc-300 text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded">
          higgs-realtime
        </span>
      </div>

      {/* 5. Glowing Barge-In Alert Banner */}
      {hasBargedIn && (
        <div className="col-span-2 flex items-center justify-between px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-spin" />
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Barged-In / Playback Flushed
            </span>
          </div>
          <span className="text-[9px] bg-rose-500/30 text-rose-100 px-2 py-0.5 rounded uppercase font-bold">
            Zero-Lag Resync
          </span>
        </div>
      )}
    </div>
  );
}
