export type WSStatus = 
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'LISTENING'
  | 'SPEAKING'
  | 'BARGED_IN'
  | 'ERROR';

export interface ArchitecturePreset {
  id: string;
  title: string;
  badge: string;
  color: string;
  description: string;
  mermaid: string;
}

export interface ToolCallData {
  callId: string;
  mermaid_code?: string;
  summary?: string;
  highlighted_component?: string;
  [key: string]: any;
}

export interface ActivityLogItem {
  id: string;
  time: string;
  role: 'user' | 'cadence' | 'tool' | 'system';
  text?: string;
  toolName?: string;
  mermaid_code?: string;
  summary?: string;
  highlighted_component?: string;
  payload?: any;
}

export interface AudioVisualizerSource {
  getTimeDomainData: (target: Uint8Array) => void;
  getFrequencyData?: (target: Uint8Array) => void;
}
