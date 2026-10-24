/**
 * Real-Time Session Audio Unit Economics & Cost Savings Calculator
 */

export interface SessionCostMetrics {
  inputSeconds: number;
  outputSeconds: number;
  bosonCostUSD: number;
  openaiCostUSD: number;
  savedUSD: number;
  savingsPercentage: number;
}

// Rates per minute
export const BOSON_RATES = {
  INPUT_PER_MIN: 0.0023,
  OUTPUT_PER_MIN: 0.014
} as const;

export const OPENAI_REALTIME_RATES = {
  INPUT_PER_MIN: 0.06,
  OUTPUT_PER_MIN: 0.24
} as const;

export function calculateSessionEconomics(
  inputSeconds: number,
  outputSeconds: number
): SessionCostMetrics {
  const inputMinutes = inputSeconds / 60;
  const outputMinutes = outputSeconds / 60;

  const bosonInput = inputMinutes * BOSON_RATES.INPUT_PER_MIN;
  const bosonOutput = outputMinutes * BOSON_RATES.OUTPUT_PER_MIN;
  const bosonTotal = +(bosonInput + bosonOutput).toFixed(5);

  const openaiInput = inputMinutes * OPENAI_REALTIME_RATES.INPUT_PER_MIN;
  const openaiOutput = outputMinutes * OPENAI_REALTIME_RATES.OUTPUT_PER_MIN;
  const openaiTotal = +(openaiInput + openaiOutput).toFixed(5);

  const saved = +(openaiTotal - bosonTotal).toFixed(5);
  const percentage = openaiTotal > 0 ? Math.round(((openaiTotal - bosonTotal) / openaiTotal) * 100) : 90;

  return {
    inputSeconds,
    outputSeconds,
    bosonCostUSD: bosonTotal,
    openaiCostUSD: openaiTotal,
    savedUSD: Math.max(0, saved),
    savingsPercentage: percentage
  };
}
