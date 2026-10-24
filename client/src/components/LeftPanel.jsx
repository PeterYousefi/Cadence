import React from 'react';
import { AudioVisualizer } from './AudioVisualizer.jsx';
import { TelemetryBadges } from './TelemetryBadges.jsx';
import { PresetButtons } from './PresetButtons.jsx';
import { ActivityLog } from './ActivityLog.jsx';
import { Mic, MicOff, Power, RefreshCw } from 'lucide-react';
import { WS_STATUS } from '../constants/cadence.js';

export function LeftPanel({
  wsStatus,
  isConnected,
  isRecording,
  isSpeaking,
  hasBargedIn,
  latencyMs,
  audioRecorder,
  audioPlayer,
  logs,
  onClearLogs,
  onToggleConnection,
  onToggleMic,
  onSelectPreset,
  activePresetId
}) {
  return (
    <aside className="w-[38%] min-w-[380px] max-w-[500px] h-full flex flex-col gap-3 p-4 bg-zinc-950/95 border-r border-zinc-800/90 z-20 overflow-hidden">
      {/* Voice Control Action Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleConnection}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
            isConnected
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
          }`}
        >
          {wsStatus === WS_STATUS.CONNECTING ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Connecting...</span>
            </>
          ) : isConnected ? (
            <>
              <Power className="w-4 h-4 text-rose-400" />
              <span>Disconnect Session</span>
            </>
          ) : (
            <>
              <Power className="w-4 h-4 text-cyan-400" />
              <span>Connect Cadence Engine</span>
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

      {/* Real-time Oscilloscope */}
      <AudioVisualizer
        audioRecorder={audioRecorder}
        audioPlayer={audioPlayer}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
      />

      {/* Telemetry Status Grid */}
      <TelemetryBadges
        wsStatus={wsStatus}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
        hasBargedIn={hasBargedIn}
        latencyMs={latencyMs}
      />

      {/* Quick Presets */}
      <PresetButtons
        onSelectPreset={onSelectPreset}
        activePresetId={activePresetId}
      />

      {/* Live Activity & Tool Log */}
      <div className="flex-1 min-h-0">
        <ActivityLog logs={logs} onClear={onClearLogs} />
      </div>
    </aside>
  );
}
