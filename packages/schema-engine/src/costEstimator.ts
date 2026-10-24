/**
 * Cloud Infrastructure Cost & Latency Model Estimator
 */

export interface InfrastructureMetrics {
  monthlyCostUSD: number;
  p99LatencyMs: number;
  availabilityTier: string;
  componentCount: number;
}

export function estimateInfrastructureMetrics(mermaidCode: string): InfrastructureMetrics {
  const codeLower = mermaidCode.toLowerCase();

  let baseCost = 65; // Base networking & monitoring
  let p99 = 18; // Base edge latency

  if (codeLower.includes('kafka') || codeLower.includes('messaging')) {
    baseCost += 240; // MSK Cluster / Confluent
    p99 += 8;
  }

  if (codeLower.includes('postgres') || codeLower.includes('supabase') || codeLower.includes('database')) {
    baseCost += 120; // Multi-AZ RDS / Aurora
    p99 += 12;
  }

  if (codeLower.includes('redis') || codeLower.includes('cache')) {
    baseCost += 45; // ElastiCache Redis
    p99 -= 6; // Cache reduces P99
  }

  if (codeLower.includes('clickhouse') || codeLower.includes('olap')) {
    baseCost += 180; // ClickHouse cluster
    p99 += 15;
  }

  if (codeLower.includes('flink')) {
    baseCost += 150; // Managed Apache Flink
    p99 += 10;
  }

  if (codeLower.includes('cloudflare') || codeLower.includes('edge')) {
    baseCost += 25; // Workers & R2
    p99 -= 10; // Edge acceleration
  }

  // Count total nodes
  const nodeMatches = mermaidCode.match(/\[["']?[^"'\n\]]+["']?\]/g);
  const componentCount = nodeMatches ? nodeMatches.length : 1;
  baseCost += componentCount * 12;

  const finalLatency = Math.max(8, p99);
  const tier = componentCount > 6 ? '99.99% High-Availability' : '99.9% Standard Multi-AZ';

  return {
    monthlyCostUSD: Math.round(baseCost),
    p99LatencyMs: Math.round(finalLatency),
    availabilityTier: tier,
    componentCount
  };
}
