import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const RAPIDAPI_HOST = 'pokemon-tcg-api.p.rapidapi.com';

async function searchCard(name, setName, cardNumber) {
  const params = new URLSearchParams({ name });
  if (setName) params.set('set', setName);
  if (cardNumber) params.set('number', cardNumber);
  const res = await axios.get(`https://${RAPIDAPI_HOST}/cards?${params}`, {
    headers: { 'x-rapidapi-key': process.env.POKEMON_API_KEY, 'x-rapidapi-host': RAPIDAPI_HOST },
    timeout: 10000,
  });
  const items = res.data?.data ?? res.data ?? [];
  return Array.isArray(items) ? items.map(c => ({ id: c.id, name: c.name })) : [];
}

const setFilter = process.argv[2];

let query = supabase.from('cards').select('id, name, set_name, set_number').is('pokemon_api_id', null);
if (setFilter) query = query.eq('set_name', setFilter);

const { data: cards } = await query;
console.log(`Kobler ${cards.length} kort${setFilter ? ` i "${setFilter}"` : ''}...`);

let linked = 0, errors = 0;

for (const card of cards) {
  try {
    const results = await searchCard(card.name, card.set_name, card.set_number);
    if (results.length === 0) {
      console.log(`  ✗ Ingen treff: ${card.name}`);
      errors++;
    } else {
      const match = results.find(r => r.name.toLowerCase() === card.name.toLowerCase()) ?? results[0];
      await supabase.from('cards').update({ pokemon_api_id: match.id }).eq('id', card.id);
      linked++;
      console.log(`  ✓ ${card.name} → ${match.id}`);
    }
  } catch (err) {
    console.log(`  ✗ Feil for ${card.name}: ${err.message}`);
    errors++;
  }
  await new Promise(r => setTimeout(r, 150));
}

console.log(`\nFerdig: ${linked} koblet, ${errors} feil`);
