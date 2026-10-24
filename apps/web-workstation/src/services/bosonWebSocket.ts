import { BOSON_CONFIG, SYSTEM_INSTRUCTIONS, REALTIME_TOOLS } from '../constants/cadence';
import { ToolCallData } from '../types/cadence';

export interface BosonWebSocketCallbacks {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onErrorEvent?: (errorMessage: string) => void;
  onAudioDelta?: (delta: string) => void;
  onAudioChunksCount?: (count: number) => void;
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
  public audioChunksReceived: number = 0;

  constructor(options: BosonWebSocketOptions = {}) {
    this.token = options.token || null;
    this.wsUrl = options.wsUrl || BOSON_CONFIG.WS_URL;
    this.callbacks = {
      onOpen: options.onOpen || (() => {}),
      onClose: options.onClose || (() => {}),
      onError: options.onError || (() => {}),
      onErrorEvent: options.onErrorEvent || (() => {}),
      onAudioDelta: options.onAudioDelta || (() => {}),
      onAudioChunksCount: options.onAudioChunksCount || (() => {}),
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

    if (!this.token.startsWith('bai-eph-')) {
      throw new Error(`Invalid Boson ephemeral token format (expected 'bai-eph-...', got '${this.token.slice(0, 10)}...')`);
    }

    this.audioChunksReceived = 0;
    const subprotocols = ['realtime', `bai-client-secret.${this.token}`];
    console.log(`[Cadence WS] Establishing WebSocket to ${this.wsUrl} with subprotocol bai-client-secret.***`);

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
      console.error('[Cadence WS] WebSocket transport error:', event);
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
        modalities: ['text', 'audio'],
        model: BOSON_CONFIG.REALTIME_MODEL,
        voice: BOSON_CONFIG.VOICE,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: BOSON_CONFIG.STT_MODEL
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.4,
          prefix_padding_ms: 300,
          silence_duration_ms: 350
        },
        tool_choice: 'auto',
        instructions: SYSTEM_INSTRUCTIONS,
        tools: REALTIME_TOOLS
      }
    };

    this.send(sessionPayload);
    console.log('[Cadence WS] Dispatched session.update (modalities: text+audio, pcm16, server_vad 0.4)');
  }

  public appendAudioBuffer(base64Chunk: string): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'input_audio_buffer.append',
      audio: base64Chunk
    });
  }

  public commitTurnAndForceReply(): void {
    console.log('[Cadence WS] Force commit turn triggered');
    this.send({
      type: 'input_audio_buffer.commit'
    });
    this.send({
      type: 'response.create'
    });
  }

  public sendUserTextMessage(text: string): void {
    console.log('[Cadence WS] Sending user text message:', text);
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    });
    this.send({
      type: 'response.create'
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

    // Audio delta packet handling (both response.output_audio.delta and response.audio.delta)
    if (data.type === 'response.output_audio.delta' || data.type === 'response.audio.delta') {
      this.audioChunksReceived++;
      this.callbacks.onAudioChunksCount(this.audioChunksReceived);
      const audioChunk = data.delta || data.audio;
      if (audioChunk) {
        this.callbacks.onAudioDelta(audioChunk);
      }
      return;
    }

    // Print non-audio events to console for live packet tracing
    console.log(`[Cadence WS Packet: ${data.type}]`, data);

    switch (data.type) {
      // Audio transcript streaming
      case 'response.audio_transcript.delta':
      case 'response.output_audio_transcript.delta':
      case 'response.text.delta': {
        const delta = data.delta || data.text;
        if (delta) {
          this.callbacks.onAgentTranscript(delta, false);
        }
        break;
      }

      case 'response.audio_transcript.done':
      case 'response.output_audio_transcript.done':
      case 'response.text.done': {
        const text = data.transcript || data.text;
        if (text) {
          this.callbacks.onAgentTranscript(text, true);
        }
        break;
      }

      // VAD Interruption Barge-in triggers
      case 'input_audio_buffer.speech_started':
        console.log('[Cadence WS] VAD speech_started -> trigger 0.125s barge-in flush');
        this.callbacks.onSpeechStarted();
        break;

      case 'input_audio_buffer.speech_stopped':
        this.callbacks.onSpeechStopped();
        break;

      // User STT completed
      case 'conversation.item.input_audio_transcription.completed': {
        const userText = data.transcript || data.item?.content?.[0]?.transcript;
        if (userText) {
          this.callbacks.onUserTranscript(userText);
        }
        break;
      }

      // Tool call arriving in function_call_arguments.done
      case 'response.function_call_arguments.done': {
        const callId = data.call_id;
        const toolName = data.name;
        let parsedArgs: any = {};
        try {
          parsedArgs = typeof data.arguments === 'string' ? JSON.parse(data.arguments) : (data.arguments || {});
        } catch (e) {
          console.error('[Cadence WS] Error parsing tool arguments:', e);
          parsedArgs = { raw: data.arguments };
        }
        console.log(`[Cadence WS] Executing tool call via function_call_arguments.done: ${toolName}`, parsedArgs);
        this.callbacks.onToolCall({
          callId,
          toolName,
          ...parsedArgs
        });
        this.sendToolResponse(callId, {
          status: 'success',
          tool: toolName,
          executed_at: new Date().toISOString()
        });
        break;
      }

      // Tool call arriving inside response.done
      case 'response.done':
        this.handleResponseDone(data);
        break;

      // Remote error notification
      case 'error': {
        const errMsg = data.error?.message || data.message || JSON.stringify(data.error);
        console.error('[Cadence WS Remote Error]:', errMsg);
        this.callbacks.onErrorEvent(errMsg);
        break;
      }

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
          parsedArgs = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : (item.arguments || {});
        } catch (e) {
          console.error('[Cadence WS] Failed parsing tool arguments:', e);
          parsedArgs = { raw: item.arguments };
        }

        console.log(`[Cadence WS] Executing ${toolName} tool call via response.done:`, parsedArgs);
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
