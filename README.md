# Cadence — Autonomous Real-Time Voice Systems Architect

Cadence is a full-stack, real-time application pairing **Boson AI's `higgs-realtime` Speech-to-Speech WebSocket API** with a reactive, visual Mermaid.js architecture canvas. When the user speaks, Cadence converses with sub-second full-duplex voice while dynamically generating, rewiring, and styling system architecture diagrams on the canvas via tool calling.

## Architecture Highlights
- **Boson AI Realtime Engine:** Sub-second speech-to-speech with `higgs-realtime` over WebSockets.
- **Bi-directional Streaming:** 24 kHz mono signed 16-bit PCM audio streaming and gapless audio playback.
- **Barge-in / Interrupt Handling:** Instant playback timeline flushing on `speech_started`.
- **Dynamic Mermaid Canvas:** Auto-sanitized tool-directed graph updates with zoom, pan, and SVG transitions.
- **Cyberpunk Telemetry Console:** Real-time dual-waveform visualizer, latency telemetry, and activity logs.
