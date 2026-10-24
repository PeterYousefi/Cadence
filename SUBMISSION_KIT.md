# Cadence // Boson AI Hackathon Official Submission Kit

> **Ready-to-paste copy kit directly formatted for the official Boson AI Hackathon submission form.**

---

### 1. Basic Information
- **Project Name:** Cadence
- **Tagline / Headline:** Autonomous Real-Time Voice Systems Architect & Live Infrastructure Blueprint Engine
- **Primary Track:** **03 — Agents That Act**
- **Secondary Tracks Spanned:**
  - **02 — Conversation as the Interface** (Sub-second full-duplex voice + 0.125s VAD barge-in + 100+ language mid-sentence code switching)
  - **01 — Put a Face to the Voice** (Higgs Avatar video stream + custom engineer portrait cloning + 60fps Web Audio lip-sync)
- **GitHub Repository:** [https://github.com/PeterYousefi/Cadence](https://github.com/PeterYousefi/Cadence)
- **Live Demo Link:** [http://localhost:5173](http://localhost:5173)

---

### 2. One-Sentence Showcase Description
> **Cadence pairs Boson AI's triple-model suite (Higgs Realtime, Higgs Avatar, and Higgs TTS 3) with a reactive, Swiss CAD architectural canvas that autonomously designs, mutates, stress-tests, and deploys cloud topologies in sub-second full-duplex speech across 100+ languages.**

---

### 3. Project Write-Up (< 200 words)
*Target: <200 words (Word Count: ~165 words)*

Software architecture meetings are historically agonizing: teams spend hours arguing over whiteboards, manually translating sketches into Terraform, and struggling through post-mortems after outages. 

**Cadence** transforms this workflow into an interactive, full-duplex voice partnership. Instead of clicking through cloud consoles, engineering leads converse with Cadence—an autonomous Principal Systems Architect. As you speak, Cadence converses with sub-second voice while dynamically drafting, rewiring, and styling production-ready Mermaid.js topologies on a Swiss CAD drafting canvas. 

Cadence executes three native mid-conversation tools: mutating live infrastructure (`render_architecture`), simulating chaos failures to assess blast radius (`inject_chaos_failure`), and generating deployable Terraform HCL (`generate_iac_manifest`). Crucially, Cadence natively supports seamless mid-sentence code-switching across 100+ languages without flag resets, and features instant 0.125s interruption flushing—enabling natural, zero-lag architectural debates. Cadence is built for engineering teams, cloud architects, and incident commanders who need to design resilient systems at the speed of thought.

---

### 4. How We Built It (< 200 words)
*Target: <200 words (Word Count: ~185 words)*

We architected Cadence as an enterprise monorepo combining Boson AI’s complete audio model family:

1. **Higgs Realtime (`higgs-realtime` over WebSockets):** Downsamples browser mic audio to 24kHz mono signed 16-bit PCM chunks, streaming bidirectionally with subprotocols. When server VAD triggers `speech_started`, our audio ring-buffer flushes within <125ms, delivering instant barge-in response.
2. **Higgs Avatar (`higgs-avatar`):** Embeds the Principal Architect viewport via `/v1/videos` and `/v1/avatar/sessions`, supporting zero-shot custom engineer portrait uploads and a 60fps Web Audio reactive lip-sync engine.
3. **Higgs TTS 3 (`higgs-tts-3`):** Generates expressive incident post-mortems and architecture pitches via `/v1/audio/speech` using inline control tags (`<|emotion:urgent|>`, `<|sfx:sigh|>Uh`, `<|prosody:speed_fast|>`) paired with word-level microsecond timestamp teleprompter tracking.

**What was technically hard:** Achieving zero-latency synchronization between incoming 24kHz PCM audio chunks, server-side tool calling handshakes, AST-level Mermaid syntax recovery, and instant Web Audio timeline flushing without browser crackle or audio buffer underruns.

---

### 5. Honest Known Limitations & Roadmap (Technical Execution Rubric)
As encouraged by the Technical Execution judging criteria, here is our transparent assessment:
- **Audio Worklet Fallback:** Currently uses `ScriptProcessorNode` with linear resampling down to 24kHz for universal browser compatibility; an AudioWorklet processor module is provisioned for Safari 17+ edge isolation.
- **Boson Avatar Live Video Chunking:** While our zero-shot portrait upload and lip-sync visualizer operate at 60fps, full MP4 rendering over `/v1/videos` depends on upstream Boson video generation throughput.
- **Complex Edge Routing in Mermaid:** Highly recursive topologies with >30 circular dependencies can occasionally require manual viewport zoom/fit adjustments.
- **Terraform Provider Scope:** Current IaC generation generates complete AWS resources and Docker Compose; GCP and Azure native providers are scheduled for v2.
