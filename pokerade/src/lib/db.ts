import type { StoredCard } from './types';

const DB_KEY = 'pokerade_cards';

const SEED_DATA: StoredCard[] = [
  {
    id: 'charizard-1ed-base',
    name: 'Charizard 1st Edition',
    set: 'Base Set',
    number: '4/102',
    rawNok: 18000,
    psa10Usd: 350000,
    psa10Pop: 3,
    totalGraded: 2100,
    gemRate: 0.003,
    finnAvgPrice: 17500,
    finnListingsCount: 2,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'charizard-shadowless-base',
    name: 'Charizard Shadowless',
    set: 'Base Set',
    number: '4/102',
    rawNok: 7500,
    psa10Usd: 36000,
    psa10Pop: 58,
    totalGraded: 3200,
    gemRate: 0.018,
    finnAvgPrice: 7200,
    finnListingsCount: 4,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'charizard-unlimited-base',
    name: 'Charizard Unlimited',
    set: 'Base Set',
    number: '4/102',
    rawNok: 1100,
    psa10Usd: 2600,
    psa10Pop: 2400,
    totalGraded: 21000,
    gemRate: 0.114,
    finnAvgPrice: 1050,
    finnListingsCount: 18,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'blastoise-1ed-base',
    name: 'Blastoise 1st Edition',
    set: 'Base Set',
    number: '2/102',
    rawNok: 4200,
    psa10Usd: 7500,
    psa10Pop: 62,
    totalGraded: 2200,
    gemRate: 0.028,
    finnAvgPrice: 4000,
    finnListingsCount: 3,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'lugia-neo-genesis',
    name: 'Lugia Holo',
    set: 'Neo Genesis',
    number: '9/111',
    rawNok: 2100,
    psa10Usd: 4200,
    psa10Pop: 290,
    totalGraded: 4100,
    gemRate: 0.071,
    finnAvgPrice: 2000,
    finnListingsCount: 7,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'umbreon-gold-star',
    name: 'Umbreon Gold Star',
    set: 'EX Unseen Forces',
    number: '17/115',
    rawNok: 5800,
    psa10Usd: 16000,
    psa10Pop: 72,
    totalGraded: 860,
    gemRate: 0.084,
    finnAvgPrice: 5600,
    finnListingsCount: 2,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'espeon-gold-star',
    name: 'Espeon Gold Star',
    set: 'EX Unseen Forces',
    number: '16/115',
    rawNok: 5200,
    psa10Usd: 13000,
    psa10Pop: 88,
    totalGraded: 920,
    gemRate: 0.096,
    finnAvgPrice: 5400,
    finnListingsCount: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'rayquaza-gold-star',
    name: 'Rayquaza Gold Star',
    set: 'EX Deoxys',
    number: '107/107',
    rawNok: 3800,
    psa10Usd: 11000,
    psa10Pop: 130,
    totalGraded: 1600,
    gemRate: 0.081,
    finnAvgPrice: 3900,
    finnListingsCount: 5,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mewtwo-1ed-base',
    name: 'Mewtwo 1st Edition',
    set: 'Base Set',
    number: '10/102',
    rawNok: 1800,
    psa10Usd: 5500,
    psa10Pop: 180,
    totalGraded: 3500,
    gemRate: 0.051,
    finnAvgPrice: 1750,
    finnListingsCount: 6,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'pikachu-illustrator',
    name: 'Pikachu Illustrator',
    set: 'Promo',
    number: 'CoroCoro',
    rawNok: 1800000,
    psa10Usd: 5275000,
    psa10Pop: 1,
    totalGraded: 23,
    gemRate: 0.043,
    finnAvgPrice: 0,
    finnListingsCount: 0,
    lastUpdated: new Date().toISOString(),
  },
];

function seed(): void {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
  }
}

export function getCards(): StoredCard[] {
  seed();
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) ?? '[]') as StoredCard[];
  } catch {
    return [];
  }
}

export function saveCards(cards: StoredCard[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(cards));
}

export function addCard(card: StoredCard): void {
  const cards = getCards();
  cards.push(card);
  saveCards(cards);
}

export function updateCard(card: StoredCard): void {
  const cards = getCards();
  const idx = cards.findIndex(c => c.id === card.id);
  if (idx >= 0) cards[idx] = card;
  else cards.push(card);
  saveCards(cards);
}

export function deleteCard(id: string): void {
  const cards = getCards().filter(c => c.id !== id);
  saveCards(cards);
}

export function resetToSeed(): void {
  localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
}
