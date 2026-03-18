import 'dotenv/config';
import { supabase } from './supabase.js';

const cards = [
  // Prismatic Evolutions
  { name: 'Umbreon ex SIR', set_name: 'Prismatic Evolutions', set_number: '161', pricecharting_id: 'umbreon-ex-161-prismatic-evolutions' },
  { name: 'Espeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '162', pricecharting_id: 'espeon-ex-162-prismatic-evolutions' },
  { name: 'Sylveon ex SIR', set_name: 'Prismatic Evolutions', set_number: '163', pricecharting_id: 'sylveon-ex-163-prismatic-evolutions' },
  { name: 'Flareon ex SIR', set_name: 'Prismatic Evolutions', set_number: '159', pricecharting_id: 'flareon-ex-159-prismatic-evolutions' },
  { name: 'Vaporeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '160', pricecharting_id: 'vaporeon-ex-160-prismatic-evolutions' },
  { name: 'Jolteon ex SIR', set_name: 'Prismatic Evolutions', set_number: '157', pricecharting_id: 'jolteon-ex-157-prismatic-evolutions' },
  // Evolving Skies
  { name: 'Umbreon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '215', pricecharting_id: 'umbreon-vmax-215-evolving-skies' },
  { name: 'Rayquaza VMAX Alt Art', set_name: 'Evolving Skies', set_number: '218', pricecharting_id: 'rayquaza-vmax-218-evolving-skies' },
  { name: 'Glaceon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '209', pricecharting_id: 'glaceon-vmax-209-evolving-skies' },
  { name: 'Espeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '208', pricecharting_id: 'espeon-vmax-208-evolving-skies' },
  { name: 'Leafeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '210', pricecharting_id: 'leafeon-vmax-210-evolving-skies' },
  // Scarlet & Violet 151
  { name: 'Mew ex SIR', set_name: 'Scarlet & Violet 151', set_number: '205', pricecharting_id: 'mew-ex-205-scarlet-violet-151' },
  { name: 'Charizard ex SIR', set_name: 'Scarlet & Violet 151', set_number: '204', pricecharting_id: 'charizard-ex-204-scarlet-violet-151' },
  { name: 'Blastoise ex SIR', set_name: 'Scarlet & Violet 151', set_number: '202', pricecharting_id: 'blastoise-ex-202-scarlet-violet-151' },
  { name: 'Venusaur ex SIR', set_name: 'Scarlet & Violet 151', set_number: '198', pricecharting_id: 'venusaur-ex-198-scarlet-violet-151' },
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
