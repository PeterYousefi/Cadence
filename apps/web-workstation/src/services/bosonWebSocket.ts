import { BOSON_CONFIG, SYSTEM_INSTRUCTIONS, REALTIME_TOOLS } from '../constants/cadence';
import { ToolCallData } from '../types/cadence';

export interface BosonWebSocketCallbacks {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onAudioDelta?: (delta: string) => void;
  onSpeechStarted?: () => void;
  onSpeechStopped?: () => void;
  onUserTranscript?: (transcript: string) => void;
  onAgentTranscript?: (deltaOrDone: string, isDone: boolean) => void;
  onToolCall?: (toolData: ToolCallData) => void;
  onRawEvent?: (event: any) => void;
}

export interface BosonWebSocketOptions extends BosonWebSocketCallbacks {
  token?: string;
  wsUrl?: string;
}

export class BosonWebSocketClient {
  private token: string | null;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private callbacks: Required<BosonWebSocketCallbacks>;
  public isConnected: boolean = false;

  constructor(options: BosonWebSocketOptions = {}) {
    this.token = options.token || null;
    this.wsUrl = options.wsUrl || BOSON_CONFIG.WS_URL;
    this.callbacks = {
      onOpen: options.onOpen || (() => {}),
      onClose: options.onClose || (() => {}),
      onError: options.onError || (() => {}),
      onAudioDelta: options.onAudioDelta || (() => {}),
      onSpeechStarted: options.onSpeechStarted || (() => {}),
      onSpeechStopped: options.onSpeechStopped || (() => {}),
      onUserTranscript: options.onUserTranscript || (() => {}),
      onAgentTranscript: options.onAgentTranscript || (() => {}),
      onToolCall: options.onToolCall || (() => {}),
      onRawEvent: options.onRawEvent || (() => {})
    };
  }

  public connect(ephemeralToken?: string): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.token = ephemeralToken || this.token;
    if (!this.token) {
      throw new Error('Ephemeral client secret token is required to establish WebSocket connection.');
    }

    const subprotocols = ['realtime', `bai-client-secret.${this.token}`];
    console.log(`[Cadence WS] Connecting to ${this.wsUrl} with subprotocol bai-client-secret.***`);

    this.ws = new WebSocket(this.wsUrl, subprotocols);

    this.ws.onopen = (event: Event) => {
      this.isConnected = true;
      console.log('[Cadence WS] Connection opened successfully');
      this.sendSessionUpdate();
      this.callbacks.onOpen(event);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.handleIncomingMessage(event);
    };

    this.ws.onerror = (event: Event) => {
      console.error('[Cadence WS] WebSocket error:', event);
      this.callbacks.onError(event);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.isConnected = false;
      console.log(`[Cadence WS] Connection closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
      this.callbacks.onClose(event);
    };
  }

  public sendSessionUpdate(): void {
    const sessionPayload = {
      type: 'session.update',
      session: {
        model: BOSON_CONFIG.REALTIME_MODEL,
        voice: BOSON_CONFIG.VOICE,
        instructions: SYSTEM_INSTRUCTIONS,
        input_audio_transcription: {
          model: BOSON_CONFIG.STT_MODEL
        },
        turn_detection: {
          type: 'server_vad',
          threshold: BOSON_CONFIG.VAD_THRESHOLD,
          silence_duration_ms: BOSON_CONFIG.VAD_SILENCE_MS
        },
        tools: REALTIME_TOOLS
      }
    };

    this.send(sessionPayload);
    console.log('[Cadence WS] Dispatched session.update configuration with 3 native tools');
  }

  public appendAudioBuffer(base64Chunk: string): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'input_audio_buffer.append',
      audio: base64Chunk
    });
  }

  private handleIncomingMessage(event: MessageEvent): void {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    this.callbacks.onRawEvent(data);

    switch (data.type) {
      case 'response.output_audio.delta':
        if (data.delta) {
          this.callbacks.onAudioDelta(data.delta);
        }
        break;

      case 'response.audio_transcript.delta':
        if (data.delta) {
          this.callbacks.onAgentTranscript(data.delta, false);
        }
        break;

      case 'response.audio_transcript.done':
        if (data.transcript) {
          this.callbacks.onAgentTranscript(data.transcript, true);
        }
        break;

      case 'input_audio_buffer.speech_started':
        console.log('[Cadence WS] VAD speech_started -> trigger 0.125s barge-in flush');
        this.callbacks.onSpeechStarted();
        break;

      case 'input_audio_buffer.speech_stopped':
        this.callbacks.onSpeechStopped();
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (data.transcript) {
          this.callbacks.onUserTranscript(data.transcript);
        }
        break;

      case 'response.done':
        this.handleResponseDone(data);
        break;

      default:
        break;
    }
  }

  private handleResponseDone(data: any): void {
    const outputItems = data.response?.output || [];
    for (const item of outputItems) {
      if (item.type === 'function_call') {
        const callId = item.call_id;
        const toolName = item.name;
        let parsedArgs: any = {};

        try {
          parsedArgs = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : item.arguments;
        } catch (e) {
          console.error('[Cadence WS] Failed parsing tool arguments:', e);
          parsedArgs = { raw: item.arguments };
        }

        console.log(`[Cadence WS] Executing ${toolName} tool call:`, parsedArgs);
        this.callbacks.onToolCall({
          callId,
          toolName,
          ...parsedArgs
        });

        // Send tool handshake response back to socket
        this.sendToolResponse(callId, {
          status: 'success',
          tool: toolName,
          executed_at: new Date().toISOString()
        });
      }
    }
  }

  public sendToolResponse(callId: string, output: Record<string, any> = { status: 'success' }): void {
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(output)
      }
    });

    this.send({
      type: 'response.create'
    });
  }

  public send(obj: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // Ignore close error
      }
      this.ws = null;
    }
    this.isConnected = false;
  }
}
