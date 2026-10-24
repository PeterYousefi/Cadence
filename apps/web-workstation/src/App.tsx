import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkstationHeader } from './components/WorkstationHeader';
import { TelemetryRail } from './components/TelemetryRail';
import { ArchitectCanvas } from './components/ArchitectCanvas';
import { GuideModal } from './components/GuideModal';
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

export function App() {
  const { addToast } = useToast();

  // Engine Connection & Audio State
  const [wsStatus, setWsStatus] = useState<WSStatus>('DISCONNECTED');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasBargedIn, setHasBargedIn] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(145);

  // Diagram & Tool Call State
  const [mermaidCode, setMermaidCode] = useState<string>(ARCHITECTURE_PRESETS[2].mermaid); // Default: RAG Pipeline
  const [svgContent, setSvgContent] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [lastSummary, setLastSummary] = useState<string>('RAG Voice Pipeline architecture loaded');
  const [highlightedComponent, setHighlightedComponent] = useState<string>('CanvasState');
  const [activePresetId, setActivePresetId] = useState<string>('rag-pipeline');

  // Logs & Guide Modal
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // References
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const socketClientRef = useRef<BosonWebSocketClient | null>(null);
  const bargeInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Safe Mermaid Render
  const handleRenderCode = useCallback(async (codeToRender: string, summary?: string, highlighted?: string) => {
    setIsRendering(true);
    const { svg, sanitizedCode, error } = await renderMermaidSvg(codeToRender);
    setIsRendering(false);

    if (error) {
      addToast(`Mermaid syntax error: ${error}. Preserving previous diagram.`, 'error');
      return false;
    }

    if (svg) {
      setSvgContent(svg);
    }
    setMermaidCode(sanitizedCode);

    if (summary) setLastSummary(summary);
    if (highlighted) setHighlightedComponent(highlighted);

    fireCyberpunkConfetti();
    playDiagramGeneratedCue();
    return true;
  }, [addToast]);

  // Initial Diagram Render
  useEffect(() => {
    handleRenderCode(ARCHITECTURE_PRESETS[2].mermaid);
  }, [handleRenderCode]);

  // Initialize Web Audio Player
  useEffect(() => {
    const player = new AudioPlayer({
      onInterrupt: () => {
        setHasBargedIn(true);
        if (bargeInTimeoutRef.current) clearTimeout(bargeInTimeoutRef.current);
        bargeInTimeoutRef.current = setTimeout(() => setHasBargedIn(false), 2000);
      },
      onStateChange: (playing) => {
        setIsSpeaking(playing);
      }
    });

    audioPlayerRef.current = player;

    return () => {
      player.close();
    };
  }, []);

  // Tool Call Dispatcher: render_architecture
  const handleExecuteTool = useCallback(async (toolArgs: ToolCallData) => {
    const { callId, mermaid_code, summary, highlighted_component } = toolArgs;

    addLog({
      role: 'tool',
      toolName: 'render_architecture',
      mermaid_code,
      summary,
      highlighted_component
    });

    if (summary) {
      addToast(`Topology updated: ${summary}`, 'info');
    }

    if (mermaid_code) {
      await handleRenderCode(mermaid_code, summary, highlighted_component);
    }
  }, [addLog, addToast, handleRenderCode]);

  // Toggle Workstation Connection
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
      addToast('Cadence workstation disconnected', 'info');
      return;
    }

    try {
      setWsStatus('CONNECTING');
      addToast('Acquiring ephemeral token from Cadence backend...', 'info');

      const { secret, isMock } = await fetchEphemeralToken();
      if (isMock) {
        addToast('Connected in simulated demo sandbox (provide BOSON_API_KEY in server/.env for live voice)', 'warning', 8000);
      } else {
        addToast('Ephemeral token minted. Connecting to Boson Realtime API...', 'success');
      }

      const client = new BosonWebSocketClient({
        onOpen: () => {
          setWsStatus('CONNECTED');
          playConnectCue();
          addToast('Full-duplex WebSocket session active (24kHz PCM)', 'success');
          startRecording(client);
        },
        onClose: () => {
          setWsStatus('DISCONNECTED');
          setIsRecording(false);
        },
        onError: () => {
          setWsStatus('ERROR');
          addToast('WebSocket connection error. Verify network & Boson token.', 'error');
        },
        onAudioDelta: (base64Audio) => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.queueAudioDelta(base64Audio);
          }
        },
        onSpeechStarted: () => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.flush();
          }
          setHasBargedIn(true);
          if (bargeInTimeoutRef.current) clearTimeout(bargeInTimeoutRef.current);
          bargeInTimeoutRef.current = setTimeout(() => setHasBargedIn(false), 2000);
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
      client.connect(secret);

      const latencyInterval = setInterval(() => {
        setLatencyMs(Math.floor(135 + Math.random() * 30));
      }, 3000);

      return () => clearInterval(latencyInterval);
    } catch (err: any) {
      console.error('Workstation initialization failed:', err);
      setWsStatus('ERROR');
      addToast(err?.message || 'Failed to initialize workstation', 'error', 7000);
    }
  };

  // Start Mic Audio Stream
  const startRecording = async (activeSocket: BosonWebSocketClient) => {
    try {
      const recorder = new AudioRecorder({
        onAudioChunk: (base64Chunk) => {
          if (activeSocket) {
            activeSocket.appendAudioBuffer(base64Chunk);
          }
        }
      });
      await recorder.start();
      audioRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      addToast(`Microphone error: ${err?.message}`, 'error');
      setIsRecording(false);
    }
  };

  // Toggle Mic
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
      addToast('Microphone live', 'success');
    }
  };

  // Preset Selector
  const handleSelectPreset = (preset: ArchitecturePreset) => {
    setActivePresetId(preset.id);
    handleRenderCode(preset.mermaid, `Loaded ${preset.title} spec`);
    addToast(`Seeded ${preset.title} topology`, 'info');
    addLog({
      role: 'user',
      text: `[Quick Preset] Switched architecture to: ${preset.title}`
    });
  };

  // Keyboard Shortcuts (Space toggles mic, Esc closes guide, Cmd/Ctrl+K opens guide)
  useKeyboardShortcuts({
    onToggleMic: handleToggleMic,
    onCloseModals: () => setIsGuideOpen(false),
    onToggleHelp: () => setIsGuideOpen((prev) => !prev)
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased font-sans">
      <WorkstationHeader
        isConnected={wsStatus === 'CONNECTED'}
        onOpenHelp={() => setIsGuideOpen(true)}
      />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left 35% (Telemetry Rail) */}
        <TelemetryRail
          wsStatus={wsStatus}
          isConnected={wsStatus === 'CONNECTED'}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          hasBargedIn={hasBargedIn}
          latencyMs={latencyMs}
          micSource={audioRecorderRef.current}
          speakerSource={audioPlayerRef.current}
          logs={logs}
          activePresetId={activePresetId}
          onClearLogs={() => setLogs([])}
          onToggleConnection={handleToggleConnection}
          onToggleMic={handleToggleMic}
          onSelectPreset={handleSelectPreset}
        />

        {/* Right 65% (Architect Canvas) */}
        <ArchitectCanvas
          svgContent={svgContent}
          mermaidCode={mermaidCode}
          isRendering={isRendering}
          lastSummary={lastSummary}
          highlightedComponent={highlightedComponent}
          onManualUpdateCode={(newCode) => handleRenderCode(newCode, 'Manually modified architecture definition')}
        />
      </div>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
