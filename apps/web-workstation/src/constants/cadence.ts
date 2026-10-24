/**
 * Cadence Triple-Model Master Configuration & System Directives
 */

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 24000,
  CHANNELS: 1,
  BUFFER_SIZE: 2048,
  BIT_DEPTH: 16
} as const;

export const WS_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  LISTENING: 'LISTENING',
  SPEAKING: 'SPEAKING',
  BARGED_IN: 'BARGED_IN',
  ERROR: 'ERROR'
} as const;

export const BOSON_CONFIG = {
  WS_URL: 'wss://api.boson.ai/v1/realtime',
  REALTIME_MODEL: 'higgs-realtime',
  AVATAR_MODEL: 'higgs-avatar',
  TTS_MODEL: 'higgs-tts-3',
  VOICE: 'default',
  STT_MODEL: 'higgs-stt-3.1',
  VAD_THRESHOLD: 0.5,
  VAD_SILENCE_MS: 300
} as const;

export const SYSTEM_INSTRUCTIONS = 
  "You are Cadence, an expert life coach and event planner. Converse concisely, warmly, and helpfully. " +
  "You natively support seamless mid-sentence code switching across 100+ languages (English, Mandarin, Spanish, French, Japanese, German, Hindi, Arabic, etc.). " +
  "When the user asks to plan a trip, organize an event, or brainstorm a project, ALWAYS invoke the 'render_mindmap' tool to generate a visual Mermaid mindmap or flowchart timeline of their request. " +
  "Provide a clear, engaging 1-2 sentence spoken explanation while dynamically visualizing the itinerary, milestones, and steps on the canvas.";

export const REALTIME_TOOLS = [
  {
    type: 'function',
    name: 'render_mindmap',
    description: 'Renders or modifies an interactive Mermaid mindmap or flowchart timeline for travel itineraries, event planning, and project milestones.',
    parameters: {
      type: 'object',
      properties: {
        mermaid_code: {
          type: 'string',
          description: 'Valid Mermaid graph TD or flowchart string with stages, nodes, and pastel styles.'
        },
        summary: {
          type: 'string',
          description: 'Short 1-sentence spoken explanation of the plan update.'
        },
        highlighted_component: {
          type: 'string',
          description: 'ID of the node or milestone being created or highlighted.'
        }
      },
      required: ['mermaid_code']
    }
  },
  {
    type: 'function',
    name: 'render_architecture',
    description: 'Renders or modifies an interactive Mermaid mindmap or architecture topology while speaking.',
    parameters: {
      type: 'object',
      properties: {
        mermaid_code: {
          type: 'string',
          description: 'Valid Mermaid graph TD or flowchart string.'
        },
        summary: {
          type: 'string',
          description: 'Short 1-sentence explanation of the change.'
        },
        highlighted_component: {
          type: 'string',
          description: 'ID of the node being modified.'
        }
      },
      required: ['mermaid_code']
    }
  },
  {
    type: 'function',
    name: 'inject_chaos_failure',
    description: 'Simulates a real-world contingency (e.g. rain on wedding day, missed connection flight) to evaluate backup options.',
    parameters: {
      type: 'object',
      properties: {
        target_component: {
          type: 'string',
          description: 'ID of the milestone or activity to simulate a contingency on.'
        },
        outage_type: {
          type: 'string',
          enum: ['rain_contingency', 'flight_delay', 'budget_constraint', 'venue_relocation'],
          description: 'Contingency event type.'
        },
        blast_radius: {
          type: 'string',
          description: 'Assessment of schedule or budget impacts.'
        }
      },
      required: ['target_component']
    }
  }
];
