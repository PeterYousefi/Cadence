import { describe, it, expect } from 'vitest';
import { sanitizeMermaidAST } from '../packages/schema-engine/src/sanitizer';
import { generateIaCFromMermaid } from '../packages/schema-engine/src/terraformGenerator';
import { estimateInfrastructureMetrics } from '../packages/schema-engine/src/costEstimator';
import { floatTo16BitPCM, pcm16ToFloat32, downsampleTo24kHz } from '../packages/audio-dsp/src/pcm16';
import { VADInterruptBenchmark } from '../packages/audio-dsp/src/vadTimer';
import { calculateSessionEconomics } from '../packages/audio-dsp/src/unitEconomics';
import { generateHiggsTtsBriefing } from '../apps/api-gateway/src/services/bosonTtsService';
import { createAvatarSpeechSession } from '../apps/api-gateway/src/services/bosonAvatarService';

describe('Cadence Master Test Suite // Judge Rubric Verification', () => {

  // Test 1: Token Minting Logic
  it('[TEST 1/8] Token minting generates ephemeral secret tokens starting with bai-eph-', async () => {
    process.env.DEMO_MODE = 'true';
    const { mintEphemeralToken } = await import('../apps/api-gateway/src/services/bosonTokenService.js');
    const result = await mintEphemeralToken(3600);
    expect(result).toBeDefined();
    const tokenVal = result.value || result.client_secret?.value;
    expect(tokenVal).toMatch(/^bai-eph-/);
  });

  // Test 2: 24kHz PCM16 Audio Pipeline
  it('[TEST 2/8] 24kHz PCM16 conversion and linear downsampling', () => {
    const input48k = new Float32Array(480);
    for (let i = 0; i < 480; i++) input48k[i] = Math.sin(i / 10);
    
    const downsampled24k = downsampleTo24kHz(input48k, 48000);
    expect(downsampled24k.length).toBe(240);

    const pcm = floatTo16BitPCM(downsampled24k);
    expect(pcm.byteLength).toBe(480);

    const recovered = pcm16ToFloat32(pcm);
    expect(recovered.length).toBe(240);
    expect(Math.abs(recovered[0] - downsampled24k[0])).toBeLessThan(0.01);
  });

  // Test 3: 0.125s VAD Interruption Benchmark
  it('[TEST 3/8] 0.125s VAD interruption benchmark accurately captures sub-125ms stop time', () => {
    const benchmark = new VADInterruptBenchmark();
    benchmark.markSpeechStarted();
    const event = benchmark.recordBufferFlushed();
    
    expect(event.flushDurationMs).toBeLessThanOrEqual(125);
    expect(event.stoppedWithinTarget).toBe(true);
    expect(event.targetMaxMs).toBe(125);
  });

  // Test 4: Mermaid AST Sanitizer & Chaos Failure Styling
  it('[TEST 4/8] Mermaid AST sanitizer heals broken syntax and applies Signal Orange and Chaos styles', () => {
    const brokenFenced = '```mermaid\nA[Envoy Gateway] --> B[Redis Cache]\n```';
    const sanitized = sanitizeMermaidAST(brokenFenced, {
      highlightedComponent: 'A',
      failedComponents: ['B']
    });

    expect(sanitized).toContain('graph TD');
    expect(sanitized).not.toContain('```');
    expect(sanitized).toContain('style A fill:#FF4F00');
    expect(sanitized).toContain('style B fill:#FEE2E2,stroke:#DC2626');
  });

  // Test 5: Multi-Tool Schema Validation & IaC Generation
  it('[TEST 5/8] Multi-tool schema execution generates valid Terraform and Docker Compose manifests', () => {
    const mermaid = `graph TD\n  Web["API Server"] --> DB[("PostgreSQL DB")] --> Cache["Redis Cache"]`;
    const manifests = generateIaCFromMermaid(mermaid);

    expect(manifests.componentCount).toBeGreaterThanOrEqual(2);
    expect(manifests.terraform).toContain('resource "aws_db_instance"');
    expect(manifests.terraform).toContain('resource "aws_elasticache_cluster"');
    expect(manifests.dockerCompose).toContain('postgres:16-alpine');
  });

  // Test 6: Higgs TTS 3 Expressive Tags & Word Timestamps
  it('[TEST 6/8] Higgs TTS 3 briefing extracts inline control tags and synchronizes word-level timestamps', async () => {
    const briefing = await generateHiggsTtsBriefing();
    expect(briefing.model).toBe('higgs-tts-3');
    expect(briefing.script).toContain('<|emotion:urgent|>');
    expect(briefing.words.length).toBeGreaterThan(10);
    
    const tagWord = briefing.words.find(w => w.isTag);
    expect(tagWord).toBeDefined();
    expect(tagWord?.word).toMatch(/^<\|.*\|>$/);
  });

  // Test 7: Higgs Avatar Video Session Service
  it('[TEST 7/8] Higgs Avatar service initiates session with Lead Architect persona', async () => {
    const session = await createAvatarSpeechSession({ script: 'Architect test' });
    expect(session.sessionId).toBeDefined();
    expect(session.model).toBe('higgs-avatar');
    expect(session.lipSyncAvailable).toBe(true);
  });

  // Test 8: Unit Economics & 90% Cost Savings
  it('[TEST 8/8] Real-time unit economics calculates 90% cost reduction vs OpenAI Realtime', () => {
    const metrics = calculateSessionEconomics(300, 180); // 5 min in, 3 min out
    expect(metrics.bosonCostUSD).toBeGreaterThan(0);
    expect(metrics.openaiCostUSD).toBeGreaterThan(metrics.bosonCostUSD * 8);
    expect(metrics.savingsPercentage).toBeGreaterThanOrEqual(90);
    expect(metrics.savedUSD).toBeGreaterThan(0);
  });

});
