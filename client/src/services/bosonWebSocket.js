import { BOSON_CONFIG, SYSTEM_INSTRUCTIONS } from '../constants/cadence.js';

export class BosonWebSocketClient {
  constructor(options = {}) {
    this.token = options.token || null;
    this.wsUrl = options.wsUrl || BOSON_CONFIG.WS_URL;
    this.ws = null;
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
    this.isConnected = false;
  }

  connect(ephemeralToken) {
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

    this.ws.onopen = (event) => {
      this.isConnected = true;
      console.log('[Cadence WS] Connection opened successfully');
      this.sendSessionUpdate();
      this.callbacks.onOpen(event);
    };

    this.ws.onmessage = (event) => {
      this.handleIncomingMessage(event);
    };

    this.ws.onerror = (event) => {
      console.error('[Cadence WS] WebSocket error:', event);
      this.callbacks.onError(event);
    };

    this.ws.onclose = (event) => {
      this.isConnected = false;
      console.log(`[Cadence WS] Connection closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
      this.callbacks.onClose(event);
    };
  }

  sendSessionUpdate() {
    const sessionPayload = {
      type: 'session.update',
      session: {
        model: BOSON_CONFIG.MODEL,
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
        tools: [
          {
            type: 'function',
            name: 'render_architecture',
            description: 'Renders or updates an interactive Mermaid system architecture diagram.',
            parameters: {
              type: 'object',
              properties: {
                mermaid_code: {
                  type: 'string',
                  description: 'Complete Mermaid graph TD string.'
                },
                summary: {
                  type: 'string',
                  description: 'Short 1-sentence spoken explanation of the change.'
                },
                highlighted_component: {
                  type: 'string',
                  description: 'ID of node being modified or added.'
                }
              },
              required: ['mermaid_code']
            }
          }
        ]
      }
    };

    this.send(sessionPayload);
    console.log('[Cadence WS] Dispatched session.update configuration');
  }

  /**
   * Append PCM audio chunk from microphone
   * @param {string} base64Chunk
   */
  appendAudioBuffer(base64Chunk) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'input_audio_buffer.append',
      audio: base64Chunk
    });
  }

  handleIncomingMessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    this.callbacks.onRawEvent(data);

    switch (data.type) {
      // Audio stream delta from Boson TTS
      case 'response.output_audio.delta':
        if (data.delta) {
          this.callbacks.onAudioDelta(data.delta);
        }
        break;

      // Realtime text transcript from agent
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

      // User speech barge-in detection
      case 'input_audio_buffer.speech_started':
        console.log('[Cadence WS] VAD speech_started -> trigger barge-in flush');
        this.callbacks.onSpeechStarted();
        break;

      case 'input_audio_buffer.speech_stopped':
        this.callbacks.onSpeechStopped();
        break;

      // User STT transcription
      case 'conversation.item.input_audio_transcription.completed':
        if (data.transcript) {
          this.callbacks.onUserTranscript(data.transcript);
        }
        break;

      // Function/Tool Call response
      case 'response.done':
        this.handleResponseDone(data);
        break;

      default:
        break;
    }
  }

  handleResponseDone(data) {
    const outputItems = data.response?.output || [];
    for (const item of outputItems) {
      if (item.type === 'function_call' && item.name === 'render_architecture') {
        const callId = item.call_id;
        let parsedArgs = {};
        try {
          parsedArgs = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : item.arguments;
        } catch (e) {
          console.error('[Cadence WS] Failed parsing tool arguments:', e);
          parsedArgs = { mermaid_code: item.arguments };
        }

        console.log('[Cadence WS] Executing render_architecture tool call:', parsedArgs);
        this.callbacks.onToolCall({
          callId,
          ...parsedArgs
        });

        // Send tool output handshake back to socket
        this.sendToolResponse(callId, {
          status: 'success',
          diagram_updated: true
        });
      }
    }
  }

  /**
   * Complete tool handshake and trigger agent verbal response
   * @param {string} callId
   * @param {object} output
   */
  sendToolResponse(callId, output = { status: 'success' }) {
    // 1. Tool result item
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(output)
      }
    });

    // 2. Request Cadence verbal confirmation response
    this.send({
      type: 'response.create'
    });
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  disconnect() {
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
