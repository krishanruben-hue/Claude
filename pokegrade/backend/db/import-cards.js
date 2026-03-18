import 'dotenv/config';
import axios from 'axios';
import { supabase } from './supabase.js';

const PTCG_BASE = 'https://api.pokemontcg.io/v2';
const PTCG_KEY  = process.env.PTCG_API_KEY ?? '';

const TARGET_SERIES = new Set(['Sword & Shield', 'Scarlet & Violet']);

const VALUABLE_RARITIES = new Set([
  'Secret Rare',
  'Special Illustration Rare',
  'Illustration Rare',
  'Hyper Rare',
  'Rainbow Rare',
  'Amazing Rare',
  'Radiant Rare',
  'LEGEND',
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function headers() {
  return PTCG_KEY ? { 'X-Api-Key': PTCG_KEY } : {};
}

async function ptcgGet(url, retries = 5) {
  let delay = 3000;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await axios.get(url, { headers: headers(), timeout: 30000 });
      return data;
    } catch (err) {
      const status = err.response?.status;
      const retriable = !status || status === 429 || status >= 500;
      if (!retriable || attempt === retries) throw err;
      console.log(`  [${status ?? 'timeout'}] Prøver igjen om ${delay / 1000}s...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

async function fetchSets() {
  const data = await ptcgGet(`${PTCG_BASE}/sets?pageSize=250`);
  return data.data.filter(s => TARGET_SERIES.has(s.series));
}

async function fetchCardsForSet(setId) {
  const cards = [];
  let page = 1;
  while (true) {
    const data = await ptcgGet(`${PTCG_BASE}/cards?q=set.id:${setId}&page=${page}&pageSize=250`);
    cards.push(...data.data);
    if (cards.length >= data.totalCount) break;
    page++;
    await sleep(300);
  }
  return cards;
}

async function main() {
  if (!supabase) {
    console.error('Supabase ikke konfigurert. Sjekk backend/.env');
    process.exit(1);
  }

  console.log('Henter sett fra Pokemon TCG API...');
  const sets = await fetchSets();
  sets.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  console.log(`\nFant ${sets.length} sett (Sword & Shield + Scarlet & Violet):\n`);
  for (const s of sets) {
    console.log(`  ${s.name.padEnd(35)} (${s.id})`);
  }
  console.log('\nImporterer kun sjeldne/verdifulle kort...\n');

  let totalImported = 0;

  for (const set of sets) {
    process.stdout.write(`Henter ${set.name}...`);
    const cards = await fetchCardsForSet(set.id);

    const valuable = cards.filter(c => VALUABLE_RARITIES.has(c.rarity));
    if (valuable.length === 0) {
      console.log(' ingen verdifulle kort, hopper over');
      await sleep(300);
      continue;
    }

    const rows = valuable.map(c => ({
      name:              c.name,
      set_name:          c.set.name,
      set_number:        c.number,
      pricecharting_id:  null,
    }));

    const { error } = await supabase.from('cards').insert(rows);
    if (error) {
      console.log(` FEIL: ${error.message}`);
    } else {
      totalImported += rows.length;
      console.log(` ${rows.length} kort`);
    }

    await sleep(500);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Ferdig! ${totalImported} kort importert.`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(err => {
  console.error('Import feilet:', err);
  process.exit(1);
});
