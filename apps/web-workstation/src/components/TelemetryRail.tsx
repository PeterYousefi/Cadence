import React, { useRef, useEffect } from 'react';
import { PrincipalAvatar, AvatarPersona } from './PrincipalAvatar';
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
  Zap, 
  DollarSign, 
  Terminal, 
  AlertTriangle, 
  Bot, 
  User, 
  Wrench, 
  Trash2, 
  Flame,
  ChevronRight,
  Send
} from 'lucide-react';
import { calculateSessionEconomics } from '../../../../packages/audio-dsp/src/unitEconomics';

interface TelemetryRailProps {
  wsStatus: WSStatus;
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  hasBargedIn: boolean;
  bargeInDurationMs: number;
  latencyMs: number;
  sessionDurationSec: number;
  micRms: number;
  audioChunksRx: number;
  micSource: AudioVisualizerSource | null;
  speakerSource: AudioVisualizerSource | null;
  logs: ActivityLogItem[];
  activePresetId?: string;
  selectedPersona?: AvatarPersona;
  onClearLogs: () => void;
  onToggleConnection: () => void;
  onToggleMic: () => void;
  onForceCommitTurn: () => void;
  onSelectPreset: (preset: ArchitecturePreset) => void;
  onInjectChaos: () => void;
  onSelectAvatar?: (persona: AvatarPersona) => void;
}

export function TelemetryRail({
  wsStatus,
  isConnected,
  isRecording,
  isSpeaking,
  hasBargedIn,
  bargeInDurationMs,
  latencyMs,
  sessionDurationSec,
  micRms,
  audioChunksRx,
  micSource,
  speakerSource,
  logs,
  activePresetId,
  selectedPersona,
  onClearLogs,
  onToggleConnection,
  onToggleMic,
  onForceCommitTurn,
  onSelectPreset,
  onInjectChaos,
  onSelectAvatar
}: TelemetryRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Real-time Unit Economics vs OpenAI
  const economics = calculateSessionEconomics(
    isRecording ? sessionDurationSec : Math.floor(sessionDurationSec * 0.6),
    isSpeaking ? Math.floor(sessionDurationSec * 0.4) : 10
  );

  return (
    <aside className="w-[35%] min-w-[380px] max-w-[480px] h-full flex flex-col gap-2.5 p-3.5 bg-[#F4F3EF] border-r-2 border-[#111111] select-none overflow-y-auto z-20 font-mono text-xs">
      
      {/* 1. Neural Synthesis Interface - Kinematic Node with Vector Lip-Sync */}
      <PrincipalAvatar
        isSpeaking={isSpeaking}
        isDuplexActive={isConnected}
        audioSource={speakerSource}
        selectedPersona={selectedPersona}
        onSelectAvatar={onSelectAvatar}
      />

      {/* 2. Top Quick-Launch Presets */}
      <PresetBar
        onSelectPreset={onSelectPreset}
        activePresetId={activePresetId}
      />

      {/* 3. Hardware Master Controls & 0.125s Barge-in Beacon */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleConnection}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-[#111111] text-xs font-bold uppercase tracking-wider shadow-cad active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
              isConnected
                ? 'bg-[#111111] text-[#FFFFFF]'
                : 'bg-[#FF4F00] text-[#FFFFFF] hover:bg-[#e04500]'
            }`}
          >
            {wsStatus === 'CONNECTING' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>SYNCING...</span>
              </>
            ) : isConnected ? (
              <>
                <Power className="w-3.5 h-3.5 text-[#FF4F00]" />
                <span>TERMINATE DUPLEX</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>INITIALIZE WORKSTATION</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleMic}
            disabled={!isConnected}
            className={`p-2 border border-[#111111] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
              !isConnected
                ? 'bg-[#EBEAE5] text-[#767676] cursor-not-allowed'
                : isRecording
                ? 'bg-[#008A4B] text-[#FFFFFF]'
                : 'bg-[#FFFFFF] text-[#111111]'
            }`}
            title={isRecording ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isRecording ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4 text-[#767676]" />}
          </button>

          {/* Manual Force Turn / Reply Button */}
          <button
            onClick={onForceCommitTurn}
            disabled={!isConnected}
            className={`flex items-center gap-1 py-2 px-2.5 border border-[#111111] text-[10px] font-bold uppercase tracking-wider transition-all ${
              !isConnected
                ? 'bg-[#EBEAE5] text-[#767676] cursor-not-allowed'
                : 'bg-[#FF4F00] hover:bg-[#e04500] text-[#FFFFFF] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
            }`}
            title="Force commit audio buffer & trigger immediate Boson AI reply"
          >
            <Send className="w-3.5 h-3.5" />
            <span>FORCE REPLY</span>
          </button>

          {/* Quick Chaos Inject Button */}
          <button
            onClick={onInjectChaos}
            disabled={!isConnected}
            className={`flex items-center gap-1 py-2 px-2.5 border border-[#111111] text-[10px] font-bold uppercase tracking-wider transition-all ${
              !isConnected
                ? 'bg-[#EBEAE5] text-[#767676] cursor-not-allowed'
                : 'bg-[#FFFFFF] hover:bg-[#FEE2E2] text-[#DC2626] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
            }`}
            title="Inject Chaos Failure (Kill Redis Cluster)"
          >
            <Flame className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>CHAOS</span>
          </button>
        </div>

        {/* Live Microphone RMS Level & RX Packet Counters */}
        <div className="px-3 py-1.5 bg-[#FFFFFF] border border-[#111111] text-[10px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#767676] font-bold">
              MIC RMS LEVEL: <span className={micRms > 0.015 ? 'text-[#008A4B] font-mono' : 'text-[#111111] font-mono'}>{micRms.toFixed(3)}</span>
            </span>
            <span className="text-[#767676] text-[9px] font-bold">
              AUDIO CHUNKS RX: <span className="text-[#FF4F00] font-mono">{audioChunksRx}</span>
            </span>
          </div>
          {/* Visual Meter Bar */}
          <div className="w-full h-1.5 bg-[#E2E0D8] border border-[#111111] overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                micRms > 0.03 ? 'bg-[#008A4B]' : micRms > 0.008 ? 'bg-[#FF4F00]' : 'bg-[#767676]'
              }`}
              style={{ width: `${Math.min(100, Math.round(micRms * 350))}%` }}
            />
          </div>
        </div>

        {/* Glowing 24kHz Duplex Connection Status */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#FFFFFF] border border-[#111111] text-[10px]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 ${isConnected ? 'bg-[#008A4B] animate-pulse' : 'bg-[#767676]'}`} />
            <span className="font-bold tracking-wider">
              {isConnected ? 'CONNECTED // 24kHz DUPLEX' : 'STANDBY // DISCONNECTED'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#767676]">
            <Zap className="w-3 h-3 text-[#FF4F00]" />
            <span>{isConnected ? `${latencyMs}ms RTT` : '--'}</span>
          </div>
        </div>

        {/* 0.125s Interruption Indicator */}
        {hasBargedIn && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#FF4F00] text-[#FFFFFF] border border-[#111111] shadow-cad animate-bounce font-bold text-[10px] uppercase tracking-wider">
            <span>[BARGE-IN DETECTED // STOPPED IN {(bargeInDurationMs / 1000).toFixed(2)}s]</span>
            <span className="bg-[#FFFFFF] text-[#FF4F00] px-1.5 py-0.2">TARGET &lt; 0.125s</span>
          </div>
        )}
      </div>

      {/* 4. Real-Time 24kHz Oscilloscope */}
      <AudioWaveform
        micSource={micSource}
        speakerSource={speakerSource}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
      />

      {/* 5. Live Unit Economics Ticker (Boson vs OpenAI) */}
      <div className="p-2.5 bg-[#FFFFFF] border border-[#111111] shadow-cad-sm text-[10px]">
        <div className="flex items-center justify-between border-b border-[#111111] pb-1 mb-1.5">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#008A4B]" />
            Session Unit Economics
          </span>
          <span className="bg-[#E8F5EE] border border-[#008A4B] text-[#008A4B] font-bold px-1.5 py-0.2 text-[9px]">
            {economics.savingsPercentage}% SAVED VS OPENAI
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[#767676] block text-[9px]">Boson Session Cost:</span>
            <span className="font-bold text-xs text-[#008A4B]">${economics.bosonCostUSD.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-[#767676] block text-[9px]">OpenAI Realtime Equivalent:</span>
            <span className="font-bold text-xs line-through text-[#767676]">${economics.openaiCostUSD.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* 6. Scrolling Live Transcript Stream with Syntax-Highlighted Tool Cards */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#FFFFFF] border border-[#111111] shadow-cad overflow-hidden">
        {/* Transcript Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#111111] bg-[#F4F3EF]">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
            <Terminal className="w-3 h-3 text-[#FF4F00]" />
            <span>[03 // REAL-TIME TRANSCRIPT & TOOL STREAM]</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="p-1 hover:bg-[#FFFFFF] border border-[#111111] transition-colors"
              title="Clear Log"
            >
              <Trash2 className="w-3 h-3 text-[#767676]" />
            </button>
          )}
        </div>

        {/* Scrollable Feed */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2.5 space-y-2 select-text"
        >
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#767676] p-4 space-y-1">
              <Bot className="w-6 h-6 animate-pulse" />
              <p className="text-[10px]">
                Workstation ready. Converse in any of 100+ languages or seed presets.
              </p>
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className={`p-2 border border-[#111111] leading-relaxed text-[11px] ${
                  item.role === 'user'
                    ? 'bg-[#F4F3EF] border-l-4 border-l-[#111111]'
                    : item.role === 'cadence'
                    ? 'bg-[#FFFFFF] border-l-4 border-l-[#008A4B]'
                    : item.role === 'tool'
                    ? 'bg-[#FFF0EA] border-l-4 border-l-[#FF4F00]'
                    : 'bg-[#F4F3EF]'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-[9px] font-bold text-[#767676] mb-1">
                  <div className="flex items-center gap-1">
                    {item.role === 'user' && <User className="w-3 h-3 text-[#111111]" />}
                    {item.role === 'cadence' && <Bot className="w-3 h-3 text-[#008A4B]" />}
                    {item.role === 'tool' && <Wrench className="w-3 h-3 text-[#FF4F00]" />}
                    <span className="uppercase">{item.role === 'tool' ? `TOOL // ${item.toolName}` : item.role}</span>
                  </div>
                  <span>{item.time}</span>
                </div>

                {/* Content */}
                {item.role === 'tool' ? (
                  <div className="space-y-1">
                    {item.summary && (
                      <p className="font-bold text-[#111111]">{item.summary}</p>
                    )}
                    {item.highlighted_component && (
                      <div className="text-[10px] text-[#FF4F00] font-bold">
                        TARGET NODE: {item.highlighted_component}
                      </div>
                    )}
                    <details className="mt-1 bg-[#FFFFFF] border border-[#111111] p-1.5 text-[9px]">
                      <summary className="cursor-pointer text-[#767676] hover:text-[#111111] flex items-center gap-1 font-bold">
                        <ChevronRight className="w-3 h-3" />
                        Tool Payload / Manifest Spec
                      </summary>
                      <pre className="mt-1.5 p-1.5 bg-[#F4F3EF] border border-[#111111] overflow-x-auto text-[9px]">
                        {item.mermaid_code || JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{item.text}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
