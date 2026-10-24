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
  "You are Cadence, an elite Principal Systems Architect. Converse concisely, authoritatively, and casually. " +
  "You natively support seamless mid-sentence code switching across 100+ languages (English, Mandarin, Spanish, French, Japanese, German, Hindi, Arabic, etc.). " +
  "Respond in the language or mix of languages the user speaks without needing any language flag restarts. " +
  "When designing, mutating, or analyzing system topologies, ALWAYS invoke one of your native architect tools:\n" +
  "1. 'render_architecture': For creating, rewiring, and styling live Mermaid.js graph TD diagrams.\n" +
  "2. 'inject_chaos_failure': For simulating infrastructure faults (e.g., node isolation, network partition, crash) with crimson blast radius.\n" +
  "3. 'generate_iac_manifest': For generating ready-to-deploy Terraform (main.tf) and docker-compose.yml specifications.";

export const REALTIME_TOOLS = [
  {
    type: 'function',
    name: 'render_architecture',
    description: 'Renders or modifies an interactive Mermaid system architecture topology while speaking.',
    parameters: {
      type: 'object',
      properties: {
        mermaid_code: {
          type: 'string',
          description: 'Valid Mermaid graph TD string with nodes, subgraphs, and styles.'
        },
        summary: {
          type: 'string',
          description: 'Short 1-sentence technical explanation of the architecture modification.'
        },
        highlighted_component: {
          type: 'string',
          description: 'Node ID being created or highlighted in Signal Orange #FF4F00.'
        }
      },
      required: ['mermaid_code']
    }
  },
  {
    type: 'function',
    name: 'inject_chaos_failure',
    description: 'Simulates chaos outage failure on target nodes to compute blast radius and trigger resilience failovers.',
    parameters: {
      type: 'object',
      properties: {
        target_component: {
          type: 'string',
          description: 'ID of the node to simulate outage failure on (e.g. Redis, KafkaBroker, PostgresDB).'
        },
        outage_type: {
          type: 'string',
          enum: ['network_partition', 'oom_crash', 'latency_spike', 'split_brain'],
          description: 'Specific failure mode injected.'
        },
        blast_radius: {
          type: 'string',
          description: 'Technical assessment of downstream systems impacted.'
        },
        mitigation_strategy: {
          type: 'string',
          description: 'Automatic failover action enacted (e.g. read replica promotion, circuit breaking).'
        }
      },
      required: ['target_component', 'outage_type']
    }
  },
  {
    type: 'function',
    name: 'generate_iac_manifest',
    description: 'Generates deployable Terraform HCL (main.tf) and Docker Compose definitions for the active architecture.',
    parameters: {
      type: 'object',
      properties: {
        cloud_provider: {
          type: 'string',
          enum: ['aws', 'gcp', 'azure', 'docker'],
          description: 'Target infrastructure provider.'
        },
        description: {
          type: 'string',
          description: 'Brief overview of the generated deployment manifest.'
        }
      }
    }
  }
];
