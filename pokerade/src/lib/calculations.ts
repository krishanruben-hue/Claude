import type { StoredCard, CardMetrics, FilterState } from './types';

const GRADING_FEE_NOK = 400; // estimated PSA grading + shipping cost in NOK

export function computeMetrics(card: StoredCard, fxRate: number): CardMetrics {
  const psa10Nok = card.psa10Usd * fxRate;
  const multiplier = card.rawNok > 0 ? psa10Nok / card.rawNok : 0;

  // Expected profit per attempt: psa10Nok * gemRate - rawNok - gradingFee
  // ROI relative to total invested (rawNok + gradingFee)
  const invested = card.rawNok + GRADING_FEE_NOK;
  const expectedReturn = psa10Nok * card.gemRate;
  const roi = invested > 0 ? ((expectedReturn - invested) / invested) * 100 : 0;

  const finnDeviation =
    card.rawNok > 0 && card.finnAvgPrice > 0
      ? ((card.finnAvgPrice - card.rawNok) / card.rawNok) * 100
      : 0;

  return {
    card: {
      id: card.id,
      name: card.name,
      set: card.set,
      number: card.number,
    },
    rawNok: card.rawNok,
    psa10Nok,
    psa10Usd: card.psa10Usd,
    multiplier,
    gemRate: card.gemRate,
    roi,
    psa10Pop: card.psa10Pop,
    totalGraded: card.totalGraded,
    finnListingsCount: card.finnListingsCount,
    finnAvgPrice: card.finnAvgPrice,
    finnDeviation,
  };
}

export function applyFilters(metrics: CardMetrics[], filters: FilterState): CardMetrics[] {
  return metrics.filter(m => {
    if (filters.minGemRate !== null && m.gemRate * 100 < filters.minGemRate) return false;
    if (filters.minMultiplier !== null && m.multiplier < filters.minMultiplier) return false;
    if (filters.minRoi !== null && m.roi < filters.minRoi) return false;
    if (filters.maxPsa10Pop !== null && m.psa10Pop > filters.maxPsa10Pop) return false;
    if (filters.maxRawNok !== null && m.rawNok > filters.maxRawNok) return false;
    if (filters.minTotalGraded !== null && m.totalGraded < filters.minTotalGraded) return false;
    if (filters.maxFinnDeviation !== null && Math.abs(m.finnDeviation) > filters.maxFinnDeviation) return false;
    if (filters.selectedSets.length > 0 && !filters.selectedSets.includes(m.card.set)) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (!m.card.name.toLowerCase().includes(q) && !m.card.set.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function formatNok(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M kr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k kr`;
  return `${Math.round(value)} kr`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${Math.round(value)}`;
}
