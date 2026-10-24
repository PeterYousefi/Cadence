import React, { useRef, useEffect } from 'react';
import { PresetBar } from './PresetBar';
import { AudioWaveform } from './AudioWaveform';
import { 
  ActivityLogItem, 
  ArchitecturePreset, 
  AudioVisualizerSource, 
  WSStatus 
} from '../types/cadence';
import { 
  Power, 
  Mic, 
  MicOff, 
  RefreshCw, 
  Radio, 
  Terminal, 
  Bot, 
  User, 
  Wrench, 
  ShieldAlert, 
  ChevronRight,
  Trash2,
  Zap
} from 'lucide-react';

interface TelemetryRailProps {
  wsStatus: WSStatus;
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  hasBargedIn: boolean;
  latencyMs: number;
  micSource: AudioVisualizerSource | null;
  speakerSource: AudioVisualizerSource | null;
  logs: ActivityLogItem[];
  activePresetId?: string;
  onClearLogs: () => void;
  onToggleConnection: () => void;
  onToggleMic: () => void;
  onSelectPreset: (preset: ArchitecturePreset) => void;
}

export function TelemetryRail({
  wsStatus,
  isConnected,
  isRecording,
  isSpeaking,
  hasBargedIn,
  latencyMs,
  micSource,
  speakerSource,
  logs,
  activePresetId,
  onClearLogs,
  onToggleConnection,
  onToggleMic,
  onSelectPreset
}: TelemetryRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <aside className="w-[35%] min-w-[360px] max-w-[480px] h-full flex flex-col gap-3 p-4 bg-zinc-950/95 border-r border-zinc-800/90 select-none overflow-hidden z-20">
      {/* 1. Quick-Launch Presets at the top */}
      <PresetBar
        onSelectPreset={onSelectPreset}
        activePresetId={activePresetId}
      />

      {/* 2. Glowing Connection Badge & Audio Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleConnection}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
            isConnected
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
          }`}
        >
          {wsStatus === 'CONNECTING' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Connecting...</span>
            </>
          ) : isConnected ? (
            <>
              <Power className="w-4 h-4 text-rose-400" />
              <span>Disconnect</span>
            </>
          ) : (
            <>
              <Power className="w-4 h-4 text-cyan-400" />
              <span>Initialize Workstation</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleMic}
          disabled={!isConnected}
          className={`p-2.5 rounded-xl border font-mono transition-all duration-200 ${
            !isConnected
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : isRecording
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title={isRecording ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isRecording ? <Mic className="w-4 h-4 text-emerald-400 animate-pulse" /> : <MicOff className="w-4 h-4 text-zinc-500" />}
        </button>
      </div>

      {/* Glowing Connection Badge Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md font-mono text-xs shadow-inner">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-zinc-600'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'
            }`} />
          </span>
          <span className={`text-[11px] font-bold tracking-wider ${
            isConnected ? 'text-emerald-400' : 'text-zinc-500'
          }`}>
            {isConnected ? 'CONNECTED // 24kHz DUPLEX' : 'OFFLINE // STANDBY'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{isConnected ? `${latencyMs}ms` : '--'}</span>
        </div>
      </div>

      {/* Barge-in Glowing Banner */}
      {hasBargedIn && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce font-mono text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-spin" />
            <span className="font-bold tracking-wider uppercase text-[11px]">
              Barged-In // Playback Flushed
            </span>
          </div>
          <span className="text-[9px] bg-rose-500/30 text-rose-100 px-2 py-0.5 rounded font-bold uppercase">
            Zero-Lag Resync
          </span>
        </div>
      )}

      {/* 3. Real-Time Pulsing Oscilloscope */}
      <AudioWaveform
        micSource={micSource}
        speakerSource={speakerSource}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
      />

      {/* 4. Scrolling Live Transcript Stream with Syntax-Highlighted Tool Cards */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md overflow-hidden shadow-xl">
        {/* Transcript Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono font-medium tracking-wide text-zinc-300 uppercase">
              Live Transcript & Tool Stream
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
              {logs.length}
            </span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors text-xs flex items-center gap-1"
              title="Clear Transcript"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Transcript Feed */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs select-text"
        >
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-2 p-4">
              <Bot className="w-8 h-8 text-zinc-700 animate-pulse" />
              <p className="text-xs max-w-[240px]">
                Connect the engine and speak into your microphone, or choose a preset to begin designing.
              </p>
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed transition-all backdrop-blur-sm ${
                  item.role === 'user'
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : item.role === 'cadence'
                    ? 'bg-violet-950/30 border-violet-500/40 text-violet-100 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                    : item.role === 'tool'
                    ? 'bg-pink-950/30 border-pink-500/40 text-pink-100 shadow-[0_0_10px_rgba(236,72,153,0.1)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-zinc-400 opacity-90">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {item.role === 'user' && (
                      <>
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-400 font-bold">USER</span>
                      </>
                    )}
                    {item.role === 'cadence' && (
                      <>
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-violet-400 font-bold">CADENCE</span>
                      </>
                    )}
                    {item.role === 'tool' && (
                      <>
                        <Wrench className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-pink-400 font-bold">TOOL // {item.toolName}</span>
                      </>
                    )}
                  </div>
                  <span className="text-zinc-500">{item.time}</span>
                </div>

                {/* Message Content */}
                {item.role === 'tool' ? (
                  <div className="space-y-1.5">
                    {item.summary && (
                      <p className="text-zinc-200 text-xs font-sans italic">
                        "{item.summary}"
                      </p>
                    )}
                    {item.highlighted_component && (
                      <div className="text-[10px] text-pink-300 font-mono">
                        Target Node: <span className="underline font-bold text-pink-200">{item.highlighted_component}</span>
                      </div>
                    )}
                    <details className="mt-1 bg-zinc-950/80 rounded-lg p-2 border border-zinc-800/80">
                      <summary className="cursor-pointer text-[10px] text-zinc-400 flex items-center gap-1 hover:text-zinc-200">
                        <ChevronRight className="w-3 h-3" />
                        Syntax-Highlighted Mermaid Payload
                      </summary>
                      <pre className="mt-2 text-[10px] text-zinc-300 overflow-x-auto p-2 bg-zinc-900/90 rounded border border-zinc-800 font-mono">
                        {item.mermaid_code || JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="font-sans text-xs whitespace-pre-wrap leading-relaxed">{item.text}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
