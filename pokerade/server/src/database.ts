import { createClient } from '@supabase/supabase-js';
import type { StoredCard } from '../../src/lib/types';

export type { StoredCard };

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Type helpers ─────────────────────────────────────────────────────────────

function rowToCard(row: Record<string, unknown>): StoredCard {
  return {
    id:                row.id as string,
    name:              row.name as string,
    set:               row.set_name as string,
    number:            row.number as string,
    rawNok:            row.raw_nok as number,
    psa10Usd:          row.psa10_usd as number,
    psa10Pop:          row.psa10_pop as number,
    totalGraded:       row.total_graded as number,
    gemRate:           row.gem_rate as number,
    finnAvgPrice:      row.finn_avg_price as number,
    finnListingsCount: row.finn_listings_count as number,
    lastUpdated:       row.last_updated as string,
  };
}

function cardToRow(card: StoredCard): Record<string, unknown> {
  return {
    id:                  card.id,
    name:                card.name,
    set_name:            card.set,
    number:              card.number,
    raw_nok:             card.rawNok,
    psa10_usd:           card.psa10Usd,
    psa10_pop:           card.psa10Pop,
    total_graded:        card.totalGraded,
    gem_rate:            card.gemRate,
    finn_avg_price:      card.finnAvgPrice,
    finn_listings_count: card.finnListingsCount,
    last_updated:        card.lastUpdated,
  };
}

// ─── Card helpers ─────────────────────────────────────────────────────────────

export async function getAllCards(): Promise<StoredCard[]> {
  const { data, error } = await supabase.from('cards').select('*').order('name');
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToCard);
}

export async function upsertCard(card: StoredCard): Promise<void> {
  const { error } = await supabase.from('cards').upsert(cardToRow(card));
  if (error) throw error;
}

export async function deleteCardById(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
}

export async function resetCards(seedData: StoredCard[]): Promise<void> {
  await supabase.from('finn_listings').delete().neq('finn_code', '');
  await supabase.from('cards').delete().neq('id', '');
  if (seedData.length > 0) {
    const { error } = await supabase.from('cards').insert(seedData.map(cardToRow));
    if (error) throw error;
  }
}

// ─── Finn helpers ─────────────────────────────────────────────────────────────

export interface FinnListing {
  finnCode: string;
  cardId: string | null;
  title: string;
  priceNok: number | null;
  url: string;
  thumbnail: string | null;
  publishedAt: string | null;
}

function listingToRow(l: FinnListing): Record<string, unknown> {
  return {
    finn_code:    l.finnCode,
    card_id:      l.cardId,
    title:        l.title,
    price_nok:    l.priceNok,
    url:          l.url,
    thumbnail:    l.thumbnail,
    published_at: l.publishedAt,
  };
}

export async function upsertFinnListings(listings: FinnListing[]): Promise<void> {
  if (listings.length === 0) return;
  const { error } = await supabase
    .from('finn_listings')
    .upsert(listings.map(listingToRow), { onConflict: 'finn_code' });
  if (error) throw error;
}

export async function updateCardFinnStats(cardId: string): Promise<void> {
  const { data } = await supabase
    .from('finn_listings')
    .select('price_nok')
    .eq('card_id', cardId)
    .not('price_nok', 'is', null)
    .gt('price_nok', 0);

  const rows = (data as { price_nok: number }[] | null) ?? [];
  const count = rows.length;
  const avg = count > 0 ? rows.reduce((s, r) => s + r.price_nok, 0) / count : 0;

  await supabase.from('cards').update({
    finn_avg_price:       avg,
    finn_listings_count:  count,
    last_updated:         new Date().toISOString(),
  }).eq('id', cardId);
}

// ─── Scrape log helpers ───────────────────────────────────────────────────────

export async function logScrape(type: string, status: string, message: string, cardsUpdated = 0): Promise<void> {
  await supabase.from('scrape_log').insert({ type, status, message, cards_updated: cardsUpdated });
}

export async function getLastScrapeLog(): Promise<{ finn: Record<string, unknown> | null; prices: Record<string, unknown> | null }> {
  const [finnResult, pricesResult] = await Promise.all([
    supabase.from('scrape_log').select('*').eq('type', 'finn').order('ran_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('scrape_log').select('*').eq('type', 'prices').order('ran_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    finn:   finnResult.data as Record<string, unknown> | null,
    prices: pricesResult.data as Record<string, unknown> | null,
  };
}
