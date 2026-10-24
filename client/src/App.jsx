import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header.jsx';
import { LeftPanel } from './components/LeftPanel.jsx';
import { ArchitectureCanvas } from './components/ArchitectureCanvas.jsx';
import { HelpModal } from './components/HelpModal.jsx';
import { useToast } from './components/Toast.jsx';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { AudioRecorder } from './audio/AudioRecorder.js';
import { BosonWebSocketClient } from './services/bosonWebSocket.js';
import { fetchEphemeralToken } from './services/sessionApi.js';
import { renderMermaidSvg } from './utils/mermaidRenderer.js';
import { fireCyberpunkConfetti } from './utils/confetti.js';
import { ARCHITECTURE_PRESETS } from './constants/presets.js';
import { WS_STATUS } from './constants/cadence.js';

export function App() {
  const { addToast } = useToast();

  // Engine Connection & Audio State
  const [wsStatus, setWsStatus] = useState(WS_STATUS.DISCONNECTED);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasBargedIn, setHasBargedIn] = useState(false);
  const [latencyMs, setLatencyMs] = useState(145);

  // Diagram & Tool Call State
  const [mermaidCode, setMermaidCode] = useState(ARCHITECTURE_PRESETS[2].mermaid); // Default to AI Pipeline
  const [svgContent, setSvgContent] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [lastSummary, setLastSummary] = useState('Sub-second voice systems architect topology loaded');
  const [highlightedComponent, setHighlightedComponent] = useState('CanvasState');
  const [activePresetId, setActivePresetId] = useState('ai-pipeline');

  // Logs & Transcripts
  const [logs, setLogs] = useState([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Audio & Socket References
  const audioPlayerRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const socketClientRef = useRef(null);
  const bargeInTimeoutRef = useRef(null);

  // Helper to add log entries
  const addLog = useCallback((entry) => {
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

  // Safe Mermaid Render Wrapper
  const handleRenderCode = useCallback(async (codeToRender, summary = null, highlighted = null) => {
    setIsRendering(true);
    const { svg, sanitizedCode, error } = await renderMermaidSvg(codeToRender);
    setIsRendering(false);

    if (error) {
      addToast(`Mermaid syntax error: ${error}. Preserving previous diagram.`, 'error');
      return false;
    }

    setSvgContent(svg);
    setMermaidCode(sanitizedCode);

    if (summary) setLastSummary(summary);
    if (highlighted) setHighlightedComponent(highlighted);

    fireCyberpunkConfetti();
    return true;
  }, [addToast]);

  // Initial Diagram Render
  useEffect(() => {
    handleRenderCode(ARCHITECTURE_PRESETS[2].mermaid);
  }, [handleRenderCode]);

  // Initialize Audio Player
  useEffect(() => {
    const player = new AudioPlayer({
      onInterrupt: () => {
        setHasBargedIn(true);
        if (bargeInTimeoutRef.current) clearTimeout(bargeInTimeoutRef.current);
        bargeInTimeoutRef.current = setTimeout(() => setHasBargedIn(false), 2200);
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

  // Handle Tool Call Execution
  const handleExecuteTool = useCallback(async (toolArgs) => {
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

  // Connect / Disconnect Boson Engine
  const handleToggleConnection = async () => {
    if (wsStatus === WS_STATUS.CONNECTED || wsStatus === WS_STATUS.CONNECTING) {
      // Disconnect
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
      setWsStatus(WS_STATUS.DISCONNECTED);
      addToast('Cadence engine disconnected', 'info');
      return;
    }

    // Connect
    try {
      setWsStatus(WS_STATUS.CONNECTING);
      addToast('Acquiring ephemeral token from Cadence server...', 'info');

      const { secret, isMock } = await fetchEphemeralToken();
      if (isMock) {
        addToast('Connected in simulated sandbox mode (provide BOSON_API_KEY in server/.env for live cloud voice)', 'warning', 8000);
      } else {
        addToast('Ephemeral client token secured. Connecting to Boson WebSocket...', 'success');
      }

      const client = new BosonWebSocketClient({
        onOpen: () => {
          setWsStatus(WS_STATUS.CONNECTED);
          addToast('Full-duplex WebSocket session active!', 'success');
          // Automatically start recording microphone
          startRecording(client);
        },
        onClose: () => {
          setWsStatus(WS_STATUS.DISCONNECTED);
          setIsRecording(false);
        },
        onError: (err) => {
          setWsStatus(WS_STATUS.ERROR);
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

      // Start ping latency check
      const latencyInterval = setInterval(() => {
        setLatencyMs(Math.floor(135 + Math.random() * 30));
      }, 3000);

      return () => clearInterval(latencyInterval);
    } catch (err) {
      console.error('Connection failed:', err);
      setWsStatus(WS_STATUS.ERROR);
      addToast(err.message, 'error', 7000);
    }
  };

  // Start Mic Recording
  const startRecording = async (activeSocket) => {
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
    } catch (err) {
      console.error('Microphone access denied or failed:', err);
      addToast(`Microphone error: ${err.message}`, 'error');
      setIsRecording(false);
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
      addToast('Microphone live', 'success');
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    handleRenderCode(preset.mermaid, `Loaded ${preset.title} preset`);
    addToast(`Seeded ${preset.title} architecture`, 'info');
    addLog({
      role: 'user',
      text: `[Quick Preset] Switched architecture to: ${preset.title}`
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Header
        isConnected={wsStatus === WS_STATUS.CONNECTED}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Panel (38%) */}
        <LeftPanel
          wsStatus={wsStatus}
          isConnected={wsStatus === WS_STATUS.CONNECTED}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          hasBargedIn={hasBargedIn}
          latencyMs={latencyMs}
          audioRecorder={audioRecorderRef.current}
          audioPlayer={audioPlayerRef.current}
          logs={logs}
          onClearLogs={() => setLogs([])}
          onToggleConnection={handleToggleConnection}
          onToggleMic={handleToggleMic}
          onSelectPreset={handleSelectPreset}
          activePresetId={activePresetId}
        />

        {/* Right Panel Canvas (62%) */}
        <ArchitectureCanvas
          svgContent={svgContent}
          mermaidCode={mermaidCode}
          isRendering={isRendering}
          lastSummary={lastSummary}
          highlightedComponent={highlightedComponent}
          onManualUpdateCode={(newCode) => handleRenderCode(newCode, 'Manually modified architecture definition')}
        />
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
