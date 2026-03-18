export function calculateGradingCost(batchSize = 1) {
  return 32.99 + (55 / Math.max(1, batchSize));
}

export function calculateROI(psa10Usd, rawUsd, gradingCostUsd) {
  const cost = rawUsd + gradingCostUsd;
  if (!cost) return null;
  return (psa10Usd - rawUsd - gradingCostUsd) / cost;
}

export function calculateMultiplier(psa10Usd, rawUsd) {
  if (!rawUsd) return null;
  return psa10Usd / rawUsd;
}
