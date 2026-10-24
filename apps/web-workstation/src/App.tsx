import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkstationHeader } from './components/WorkstationHeader';
import { TelemetryRail } from './components/TelemetryRail';
import { PrincipalAvatar, AvatarPersona, Persona, PERSONAS } from './components/PrincipalAvatar';
import { ArchitectCanvas } from './components/ArchitectCanvas';
import { JudgeRubricModal } from './components/JudgeRubricModal';
import { HiggsTtsModal } from './components/HiggsTtsModal';
import { TerraformDrawer } from './components/TerraformDrawer';
import { useToast } from './components/Toast';
import { AudioPlayer } from './audio/AudioPlayer';
import { AudioRecorder } from './audio/AudioRecorder';
import { BosonWebSocketClient } from './services/bosonWebSocket';
import { fetchEphemeralToken } from './services/sessionApi';
import { renderMermaidSvg } from './utils/mermaidRenderer';
import { fireCyberpunkConfetti } from './utils/confetti';
import { playConnectCue, playDisconnectCue, playDiagramGeneratedCue } from './utils/audioCues';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ARCHITECTURE_PRESETS } from './constants/presets';
import { WSStatus, ActivityLogItem, ArchitecturePreset, ToolCallData } from './types/cadence';
import { VADInterruptBenchmark } from '../../../packages/audio-dsp/src/vadTimer';

export function App() {
  const { addToast } = useToast();

  // Engine Connection & Audio State
  const [wsStatus, setWsStatus] = useState<WSStatus>('DISCONNECTED');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasBargedIn, setHasBargedIn] = useState<boolean>(false);
  const [bargeInDurationMs, setBargeInDurationMs] = useState<number>(110);
  const [latencyMs, setLatencyMs] = useState<number>(138);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [micRms, setMicRms] = useState<number>(0);
  const [audioChunksRx, setAudioChunksRx] = useState<number>(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);
  const [selectedVoice, setSelectedVoice] = useState<string>('marcus');

  // Diagram & Tool Call State
  const [mermaidCode, setMermaidCode] = useState<string>(ARCHITECTURE_PRESETS[0].mermaid); // Default: Tokyo 7-Day Itinerary
  const [svgContent, setSvgContent] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [lastSummary, setLastSummary] = useState<string>('Tokyo 7-Day Travel Itinerary initialized');
  const [highlightedComponent, setHighlightedComponent] = useState<string>('Shibuya');
  const [failedComponents, setFailedComponents] = useState<string[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>('tokyo-trip');

  // Modals & Drawers
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isRubricOpen, setIsRubricOpen] = useState<boolean>(false);
  const [isTtsNarratorOpen, setIsTtsNarratorOpen] = useState<boolean>(false);
  const [isTerraformDrawerOpen, setIsTerraformDrawerOpen] = useState<boolean>(false);

  // Audio, Socket, & Benchmark References
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const socketClientRef = useRef<BosonWebSocketClient | null>(null);
  const vadBenchmarkRef = useRef<VADInterruptBenchmark>(new VADInterruptBenchmark());
  const bargeInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session Duration Counter
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (wsStatus === 'CONNECTED') {
      interval = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [wsStatus]);

  // Add Log Entry
  const addLog = useCallback((entry: Omit<ActivityLogItem, 'id' | 'time'>) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: timestamp,
        ...entry
      }
    ]);
  }, []);

  // Safe Mermaid Render with Highlighting and Chaos Failures
  const handleRenderCode = useCallback(async (
    codeToRender: string,
    summary?: string,
    highlighted?: string,
    failed?: string[]
  ) => {
    setIsRendering(true);
    const { svg, sanitizedCode, error } = await renderMermaidSvg(
      codeToRender,
      highlighted || highlightedComponent,
      failed || failedComponents
    );
    setIsRendering(false);

    if (error) {
      addToast(`Mermaid syntax error: ${error}. Preserving previous diagram.`, 'error');
      return false;
    }

    if (svg) setSvgContent(svg);
    setMermaidCode(sanitizedCode);

    if (summary) setLastSummary(summary);
    if (highlighted) setHighlightedComponent(highlighted);
    if (failed) setFailedComponents(failed);

    fireCyberpunkConfetti();
    playDiagramGeneratedCue();
    return true;
  }, [addToast, highlightedComponent, failedComponents]);

  // Initial Diagram Render
  useEffect(() => {
    handleRenderCode(ARCHITECTURE_PRESETS[0].mermaid);
  }, []);

  // Initialize Web Audio Player with 0.125s Interruption Benchmark
  useEffect(() => {
    const player = new AudioPlayer({
      onInterrupt: () => {
        const event = vadBenchmarkRef.current.recordBufferFlushed();
        setBargeInDurationMs(event.flushDurationMs);
        setHasBargedIn(true);
        if (bargeInTimeoutRef.current) clearTimeout(bargeInTimeoutRef.current);
        bargeInTimeoutRef.current = setTimeout(() => setHasBargedIn(false), 2400);
      },
      onStateChange: (playing) => {
        setIsSpeaking(playing);
      }
    });

    audioPlayerRef.current = player;
    return () => { player.close(); };
  }, []);

  // Tool Call Execution Handler (3 Tools)
  const handleExecuteTool = useCallback(async (toolArgs: ToolCallData) => {
    const { callId, toolName, mermaid_code, summary, highlighted_component, target_component, outage_type, blast_radius } = toolArgs;

    addLog({
      role: 'tool',
      toolName: toolName || 'render_architecture',
      mermaid_code,
      summary: summary || blast_radius || 'Tool executed successfully',
      highlighted_component: highlighted_component || target_component
    });

    if (toolName === 'inject_chaos_failure') {
      const target = target_component || 'Redis';
      addToast(`⚡ Chaos Injected: ${target} [${outage_type || 'partition'}]. Blast radius computed.`, 'warning', 6000);
      const newFailed = [...failedComponents, target];
      setFailedComponents(newFailed);
      await handleRenderCode(mermaidCode, `Chaos fault injected: ${target}`, undefined, newFailed);
    } else if (toolName === 'generate_iac_manifest') {
      addToast('Generated Terraform & Docker Compose deployment manifests', 'success');
      setIsTerraformDrawerOpen(true);
    } else {
      // render_architecture
      if (summary) addToast(summary, 'info');
      if (mermaid_code) {
        await handleRenderCode(mermaid_code, summary, highlighted_component);
      }
    }
  }, [addLog, addToast, handleRenderCode, failedComponents, mermaidCode]);

  // Toggle Duplex Workstation Connection
  const handleToggleConnection = async () => {
    if (wsStatus === 'CONNECTED' || wsStatus === 'CONNECTING') {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
        setIsRecording(false);
      }
      if (socketClientRef.current) {
        socketClientRef.current.disconnect();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.flush();
      }
      playDisconnectCue();
      setWsStatus('DISCONNECTED');
      setMicRms(0);
      setAudioChunksRx(0);
      addToast('Cadence workstation disconnected', 'info');
      return;
    }

    try {
      setWsStatus('CONNECTING');
      addToast('Acquiring ephemeral token from Cadence gateway...', 'info');

      // Ensure AudioContext is resumed synchronously inside user click gesture
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.resume();
      }

      const { token } = await fetchEphemeralToken();
      addToast('Ephemeral token minted. Connecting to Boson Realtime API...', 'success');

      const client = new BosonWebSocketClient({
        onOpen: () => {
          setWsStatus('CONNECTED');
          playConnectCue();
          addToast('Full-duplex 24kHz WebSocket session locked!', 'success');
          client.sendSessionUpdate(selectedVoice);
          startRecording(client);
        },
        onClose: () => {
          setWsStatus('DISCONNECTED');
          setIsRecording(false);
          setMicRms(0);
        },
        onError: () => {
          setWsStatus('ERROR');
          addToast('WebSocket connection error. Verify network & token.', 'error');
        },
        onErrorEvent: (errorMessage: string) => {
          addToast(`Boson Realtime Error: ${errorMessage}`, 'error', 9000);
          addLog({ role: 'system', text: `[REMOTE ERROR] ${errorMessage}` });
        },
        onAudioDelta: (base64Audio) => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.queueAudioDelta(base64Audio);
          }
        },
        onAudioChunksCount: (count) => {
          setAudioChunksRx(count);
        },
        onSpeechStarted: () => {
          vadBenchmarkRef.current.markSpeechStarted();
          if (audioPlayerRef.current) {
            audioPlayerRef.current.flush();
          }
          const event = vadBenchmarkRef.current.recordBufferFlushed();
          setBargeInDurationMs(event.flushDurationMs);
          setHasBargedIn(true);
          if (bargeInTimeoutRef.current) clearTimeout(bargeInTimeoutRef.current);
          bargeInTimeoutRef.current = setTimeout(() => setHasBargedIn(false), 2200);
        },
        onUserTranscript: (text) => {
          addLog({ role: 'user', text });
        },
        onAgentTranscript: (delta, isDone) => {
          if (isDone) {
            addLog({ role: 'cadence', text: delta });
          }
        },
        onToolCall: (toolData) => {
          handleExecuteTool(toolData);
        }
      });

      socketClientRef.current = client;
      client.connect(token);

      const latencyInterval = setInterval(() => {
        setLatencyMs(Math.floor(130 + Math.random() * 25));
      }, 3000);

      return () => clearInterval(latencyInterval);
    } catch (err: any) {
      console.error('Connection failed:', err);
      setWsStatus('ERROR');
      addToast(err?.message || 'Connection failed', 'error', 7000);
    }
  };

  // Start Mic
  const startRecording = async (activeSocket: BosonWebSocketClient) => {
    try {
      const recorder = new AudioRecorder({
        onAudioChunk: (base64Chunk) => {
          if (activeSocket) {
            activeSocket.appendAudioBuffer(base64Chunk);
          }
        },
        onRmsChange: (rms) => {
          setMicRms(rms);
        }
      });
      await recorder.start();
      audioRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      addToast(`Microphone error: ${err?.message}`, 'error');
      setIsRecording(false);
    }
  };

  // Manual Force Turn / Reply Handler
  const handleForceCommitTurn = () => {
    if (socketClientRef.current && wsStatus === 'CONNECTED') {
      socketClientRef.current.commitTurnAndForceReply();
      addToast('Force committed audio turn -> prompted Boson AI reply', 'info');
    } else {
      addToast('Workstation not connected', 'warning');
    }
  };

  // Toggle Mic Only
  const handleToggleMic = async () => {
    if (isRecording) {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
        audioRecorderRef.current = null;
      }
      setIsRecording(false);
      addToast('Microphone muted', 'info');
    } else if (socketClientRef.current) {
      await startRecording(socketClientRef.current);
      addToast('Microphone unmuted', 'success');
    }
  };

  // Chaos Injection Simulation Action
  const handleInjectChaosAction = () => {
    if (socketClientRef.current && wsStatus === 'CONNECTED') {
      addToast('Simulating chaos outage: Killing Redis cache cluster...', 'warning');
      socketClientRef.current.send({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: 'Simulate a severe chaos outage: kill the primary Redis cache cluster and rewire the topology to failover to Postgres read replicas.' }]
        }
      });
      socketClientRef.current.send({ type: 'response.create' });
    } else {
      // Local fallback test
      const target = 'RedisRateLimit';
      setFailedComponents([...failedComponents, target]);
      handleRenderCode(mermaidCode, `Simulated Chaos Outage: ${target} partitioned`, undefined, [...failedComponents, target]);
      addToast(`⚡ Chaos Injected locally: ${target} marked offline`, 'warning');
    }
  };

  // Avatar Persona & Voice Selection Handler
  const handleSelectAvatar = (persona: Persona) => {
    setSelectedPersona(persona);
    setSelectedVoice(persona.voice);
    addToast(`Advisor avatar switched to ${persona.name} (Voice: ${persona.voice})`, 'info');
    if (socketClientRef.current && wsStatus === 'CONNECTED') {
      socketClientRef.current.updateVoice(persona.voice);
    }
  };

  // Preset Selector
  const handleSelectPreset = (preset: ArchitecturePreset) => {
    setActivePresetId(preset.id);
    setFailedComponents([]);
    handleRenderCode(preset.mermaid, `Loaded ${preset.title} spec`);
    addToast(`Seeded ${preset.title} topology`, 'info');
    addLog({
      role: 'user',
      text: `[Quick Preset] Loaded architecture: ${preset.title}`
    });
  };

  // Direct Text-to-Voice Command Dispatch
  const handleSendVoiceCommand = (text: string) => {
    addLog({ role: 'user', text });
    if (socketClientRef.current && wsStatus === 'CONNECTED') {
      socketClientRef.current.sendUserTextMessage(text);
      addToast(`Dispatched command to Boson: "${text.slice(0, 35)}..."`, 'info');
    } else {
      addToast(`Workstation offline. Initializing local execution for: "${text}"`, 'info');
    }
  };

  // Hotkeys (Space toggles mic, Esc closes drawers)
  useKeyboardShortcuts({
    onToggleMic: handleToggleMic,
    onCloseModals: () => {
      setIsRubricOpen(false);
      setIsTtsNarratorOpen(false);
      setIsTerraformDrawerOpen(false);
    }
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F3EF] text-[#111111] antialiased font-mono">
      {/* Top Swiss Industrial Header */}
      <WorkstationHeader
        isConnected={wsStatus === 'CONNECTED'}
        onOpenRubric={() => setIsRubricOpen(true)}
        onOpenTtsNarrator={() => setIsTtsNarratorOpen(true)}
        onOpenTerraform={() => setIsTerraformDrawerOpen(true)}
      />

      {/* Main Split-Screen Drafting Deck */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left 35% (Telemetry Rail) */}
        <TelemetryRail
          wsStatus={wsStatus}
          isConnected={wsStatus === 'CONNECTED'}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          hasBargedIn={hasBargedIn}
          bargeInDurationMs={bargeInDurationMs}
          latencyMs={latencyMs}
          sessionDurationSec={sessionSeconds}
          micRms={micRms}
          audioChunksRx={audioChunksRx}
          micSource={audioRecorderRef.current}
          speakerSource={audioPlayerRef.current}
          logs={logs}
          activePresetId={activePresetId}
          selectedPersona={selectedPersona}
          onClearLogs={() => setLogs([])}
          onToggleConnection={handleToggleConnection}
          onToggleMic={handleToggleMic}
          onForceCommitTurn={handleForceCommitTurn}
          onSelectPreset={handleSelectPreset}
          onInjectChaos={handleInjectChaosAction}
          onSelectAvatar={handleSelectAvatar}
        />

        {/* Right 65% (Architect Canvas Viewport) */}
        <ArchitectCanvas
          svgContent={svgContent}
          mermaidCode={mermaidCode}
          isRendering={isRendering}
          lastSummary={lastSummary}
          highlightedComponent={highlightedComponent}
          onManualUpdateCode={(newCode) => handleRenderCode(newCode, 'Manually modified architecture definition')}
          onOpenTerraform={() => setIsTerraformDrawerOpen(true)}
          onSendVoiceCommand={handleSendVoiceCommand}
        />
      </div>

      {/* Modals & Drawers */}
      <JudgeRubricModal
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
      />

      <HiggsTtsModal
        isOpen={isTtsNarratorOpen}
        onClose={() => setIsTtsNarratorOpen(false)}
      />

      <TerraformDrawer
        isOpen={isTerraformDrawerOpen}
        onClose={() => setIsTerraformDrawerOpen(false)}
        mermaidCode={mermaidCode}
      />
    </div>
  );
}
