export interface Card {
  id: string;
  name: string;
  set: string;
  number: string;
}

export interface StoredCard extends Card {
  rawNok: number;
  psa10Usd: number;
  psa10Pop: number;
  totalGraded: number;
  gemRate: number; // 0–1 decimal
  finnAvgPrice: number;
  finnListingsCount: number;
  lastUpdated: string;
}

export interface CardMetrics {
  card: Card;
  rawNok: number;
  psa10Nok: number;
  psa10Usd: number;
  multiplier: number;
  gemRate: number;
  roi: number;
  psa10Pop: number;
  totalGraded: number;
  finnListingsCount: number;
  finnAvgPrice: number;
  finnDeviation: number; // % deviation of finnAvgPrice from rawNok
}

export interface FilterState {
  minGemRate: number | null;
  minMultiplier: number | null;
  minRoi: number | null;
  maxPsa10Pop: number | null;
  maxRawNok: number | null;
  minTotalGraded: number | null;
  maxFinnDeviation: number | null;
  searchQuery: string;
  selectedSets: string[];
}
