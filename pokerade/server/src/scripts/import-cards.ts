/**
 * import-cards.ts
 *
 * Henter alle kort fra Pokemon TCG API for Sword & Shield og Scarlet & Violet
 * (inkl. Mega Evolution-sett) og lagrer dem i Supabase.
 *
 * Bruk:
 *   cd server
 *   npx tsx src/scripts/import-cards.ts
 *
 * Valgfritt: legg PTCG_API_KEY i .env for 20 000 req/dag (gratis: 1 000/dag).
 */

import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const PTCG_KEY     = process.env.PTCG_API_KEY ?? '';
const PTCG_BASE    = 'https://api.pokemontcg.io/v2';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Pokemon TCG API types ───────────────────────────────────────────────────

interface PtcgSet {
  id:          string;
  name:        string;
  series:      string;
  total:       number;
  releaseDate: string;
}

interface PtcgCard {
  id:     string;
  name:   string;
  number: string;
  rarity?: string;
  set: {
    id:   string;
    name: string;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function ptcgHeaders(): Record<string, string> {
  return PTCG_KEY ? { 'X-Api-Key': PTCG_KEY } : {};
}

async function fetchSets(): Promise<PtcgSet[]> {
  const { data } = await axios.get<{ data: PtcgSet[] }>(
    `${PTCG_BASE}/sets?pageSize=250`,
    { headers: ptcgHeaders() }
  );
  return data.data;
}

async function fetchCardsForSet(setId: string): Promise<PtcgCard[]> {
  const cards: PtcgCard[] = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get<{ data: PtcgCard[]; totalCount: number }>(
      `${PTCG_BASE}/cards?q=set.id:${setId}&page=${page}&pageSize=250`,
      { headers: ptcgHeaders() }
    );
    cards.push(...data.data);
    if (cards.length >= data.totalCount) break;
    page++;
    await sleep(300);
  }

  return cards;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Mangler SUPABASE_URL eller SUPABASE_KEY i .env');
    process.exit(1);
  }

  // Fetch all sets
  console.log('Henter settliste fra Pokemon TCG API...');
  const allSets = await fetchSets();

  // Filter: eksakt serienavn – Sword & Shield, Scarlet & Violet, Mega Evolution
  const TARGET_SERIES = new Set(['Sword & Shield', 'Scarlet & Violet', 'Mega Evolution']);
  const targetSets = allSets.filter(s => TARGET_SERIES.has(s.series));

  // Sort by release date
  targetSets.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  console.log(`\nFant ${targetSets.length} sett å importere:\n`);
  for (const s of targetSets) {
    console.log(`  [${s.series.padEnd(16)}] ${s.name.padEnd(30)} (${s.id}) – ${s.total} kort`);
  }
  console.log('\nStarter import...\n');

  let totalCards = 0;
  let totalErrors = 0;

  for (const set of targetSets) {
    process.stdout.write(`Henter ${set.name}...`);

    let cards: PtcgCard[];
    try {
      cards = await fetchCardsForSet(set.id);
    } catch (err) {
      console.log(` FEIL: ${err instanceof Error ? err.message : err}`);
      totalErrors++;
      continue;
    }

    // Map to Supabase rows
    const rows = cards.map(card => ({
      id:                  card.id,
      name:                card.name,
      set_name:            card.set.name,
      number:              card.number,
      raw_nok:             0,
      psa10_usd:           0,
      psa10_pop:           0,
      total_graded:        0,
      gem_rate:            0,
      finn_avg_price:      0,
      finn_listings_count: 0,
      last_updated:        new Date().toISOString(),
    }));

    // Insert in batches of 500
    let setInserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase
        .from('cards')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.log(`\n  Batch-feil: ${error.message}`);
        totalErrors++;
      } else {
        setInserted += batch.length;
      }
    }

    totalCards += setInserted;
    console.log(` ${setInserted} kort`);

    // Polite delay between sets
    await sleep(500);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Import ferdig!`);
  console.log(`  Kort importert: ${totalCards}`);
  console.log(`  Feil:          ${totalErrors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (totalCards > 0) {
    console.log('Neste steg: kjør eBay-prisscraping fra Admin-panelet i appen');
    console.log('for å fylle inn PSA 10-priser for kortene.\n');
  }
}

main().catch(err => {
  console.error('Import feilet:', err);
  process.exit(1);
});
