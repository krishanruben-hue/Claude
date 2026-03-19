import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { searchCards } from '../services/pokemonapi.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function cleanName(name) {
  return name
    .replace(/\s+(SIR|IR|Alt Art|Rainbow|VSTAR Alt Art|VMAX Alt Art)$/i, '')
    .trim();
}

const setFilter = process.argv[2];

let query = supabase.from('cards').select('id, name, set_name, set_number').is('pokemon_api_id', null);
if (setFilter) query = query.eq('set_name', setFilter);

const { data: cards } = await query;
console.log(`Kobler ${cards.length} kort${setFilter ? ` i "${setFilter}"` : ''}...`);

let linked = 0, errors = 0;
const CONCURRENCY = 2;

async function processCard(card) {
  let results;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      results = await searchCards(cleanName(card.name), card.set_name);
      break;
    } catch (err) {
      if (attempt === 3) {
        console.log(`  ✗ Feil for ${card.name}: ${err.message}`);
        errors++;
        return;
      }
      await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }

  if (results.length === 0) {
    console.log(`  ✗ Ingen treff: ${card.name}`);
    errors++;
  } else {
    const match =
      results.find(r => r.name.toLowerCase() === card.name.toLowerCase()) ??
      results[0];
    await supabase.from('cards').update({ pokemon_api_id: match.id }).eq('id', card.id);
    linked++;
    console.log(`  ✓ ${card.name} → ${match.id}`);
  }
}

for (let i = 0; i < cards.length; i += CONCURRENCY) {
  const batch = cards.slice(i, i + CONCURRENCY);
  await Promise.allSettled(batch.map(processCard));
}

console.log(`\nFerdig: ${linked} koblet, ${errors} feil`);
