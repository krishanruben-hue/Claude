import 'dotenv/config';
import { supabase } from './supabase.js';

const cards = [
  // Prismatic Evolutions
  // pokemon_api_id = kortets ID fra pokemon-api.com (finn via GET /cards?name=... eller søk i docs)
  // Prismatic Evolutions
  { name: 'Umbreon ex SIR', set_name: 'Prismatic Evolutions', set_number: '161', pokemon_api_id: null },
  { name: 'Espeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '162', pokemon_api_id: null },
  { name: 'Sylveon ex SIR', set_name: 'Prismatic Evolutions', set_number: '163', pokemon_api_id: null },
  { name: 'Flareon ex SIR', set_name: 'Prismatic Evolutions', set_number: '159', pokemon_api_id: null },
  { name: 'Vaporeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '160', pokemon_api_id: null },
  { name: 'Jolteon ex SIR', set_name: 'Prismatic Evolutions', set_number: '157', pokemon_api_id: null },
  // Evolving Skies
  { name: 'Umbreon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '215', pokemon_api_id: null },
  { name: 'Rayquaza VMAX Alt Art', set_name: 'Evolving Skies', set_number: '218', pokemon_api_id: null },
  { name: 'Glaceon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '209', pokemon_api_id: null },
  { name: 'Espeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '208', pokemon_api_id: null },
  { name: 'Leafeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '210', pokemon_api_id: null },
  // Scarlet & Violet 151
  { name: 'Mew ex SIR', set_name: 'Scarlet & Violet 151', set_number: '205', pokemon_api_id: null },
  { name: 'Charizard ex SIR', set_name: 'Scarlet & Violet 151', set_number: '204', pokemon_api_id: null },
  { name: 'Blastoise ex SIR', set_name: 'Scarlet & Violet 151', set_number: '202', pokemon_api_id: null },
  { name: 'Venusaur ex SIR', set_name: 'Scarlet & Violet 151', set_number: '198', pokemon_api_id: null },
];

if (!supabase) {
  console.error('Supabase ikke konfigurert. Legg til .env-fil.');
  process.exit(1);
}

const { error } = await supabase.from('cards').insert(cards);
if (error) {
  console.error('Seed-feil:', error);
} else {
  console.log(`Seeded ${cards.length} kort.`);
}
