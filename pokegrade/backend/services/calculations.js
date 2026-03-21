// Kjerneberegninger ihht. spesifikasjon seksjon 8

export function calculateGradingCost(batchSize = 1) {
  return 32.99 + (55 / Math.max(1, batchSize));
}

export function calculateROI(psa10Usd, rawUsd, gradingCostUsd) {
  const cost = rawUsd + gradingCostUsd;
  if (cost <= 0) return null;
  return (psa10Usd - rawUsd - gradingCostUsd) / cost;
}

export function calculateMultiplier(psa10Usd, rawUsd) {
  if (!rawUsd || rawUsd <= 0) return null;
  return psa10Usd / rawUsd;
}

export function calculateGemRate(grade10Pop, totalPop) {
  if (!totalPop || totalPop <= 0) return null;
  return grade10Pop / totalPop;
}

// Iterer grade 10 ned til 1, returner forste grade med positiv margin
export function calculateBreakEvenGrade(gradedPrices, rawUsd, gradingCostUsd) {
  for (let grade = 10; grade >= 1; grade--) {
    const price = gradedPrices[grade];
    if (price != null && (price - rawUsd - gradingCostUsd) >= 0) {
      return grade;
    }
  }
  return null;
}

export function calculateFinnDeviation(finnPriceNok, rawNok) {
  if (!rawNok || rawNok <= 0) return null;
  return (finnPriceNok / rawNok) - 1;
}

export function usdToNok(usd, fxRate) {
  return usd * fxRate;
}

// Klassifiser Finn-annonse (seksjon 6.1)
export function classifyFinnListing(title, cardName) {
  const titleLower = title.toLowerCase();

  const bundleKeywords = ['samling', 'lot', 'bundle', 'pakke', 'flere', 'mixed', 'collection', 'bulk'];
  if (bundleKeywords.some(kw => titleLower.includes(kw))) return 'bundle';

  // Allerede gradert — ikke relevant som rå graderingskandidat
  const gradedKeywords = ['psa', 'bgs', 'cgc', 'ace', 'graded', 'gradert'];
  if (gradedKeywords.some(kw => titleLower.includes(kw))) return 'graded';

  const cardWords = cardName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const hasMatch = cardWords.some(word => titleLower.includes(word));
  if (!hasMatch) return 'irrelevant';

  return 'none';
}
