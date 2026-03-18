import 'dotenv/config';
import { supabase } from './supabase.js';

const cards = [
  // ── Prismatic Evolutions ──────────────────────────────────────────────────
  { name: 'Umbreon ex SIR', set_name: 'Prismatic Evolutions', set_number: '161' },
  { name: 'Espeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '162' },
  { name: 'Sylveon ex SIR', set_name: 'Prismatic Evolutions', set_number: '163' },
  { name: 'Flareon ex SIR', set_name: 'Prismatic Evolutions', set_number: '159' },
  { name: 'Vaporeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '160' },
  { name: 'Jolteon ex SIR', set_name: 'Prismatic Evolutions', set_number: '157' },
  { name: 'Leafeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '158' },
  { name: 'Glaceon ex SIR', set_name: 'Prismatic Evolutions', set_number: '156' },
  { name: 'Eevee ex SIR', set_name: 'Prismatic Evolutions', set_number: '155' },
  { name: 'Umbreon ex IR', set_name: 'Prismatic Evolutions', set_number: '131' },
  { name: 'Espeon ex IR', set_name: 'Prismatic Evolutions', set_number: '132' },

  // ── Scarlet & Violet 151 ──────────────────────────────────────────────────
  { name: 'Mew ex SIR', set_name: 'Scarlet & Violet 151', set_number: '205' },
  { name: 'Charizard ex SIR', set_name: 'Scarlet & Violet 151', set_number: '204' },
  { name: 'Blastoise ex SIR', set_name: 'Scarlet & Violet 151', set_number: '202' },
  { name: 'Venusaur ex SIR', set_name: 'Scarlet & Violet 151', set_number: '198' },
  { name: 'Alakazam ex SIR', set_name: 'Scarlet & Violet 151', set_number: '201' },
  { name: 'Mewtwo ex SIR', set_name: 'Scarlet & Violet 151', set_number: '206' },
  { name: 'Pikachu ex SIR', set_name: 'Scarlet & Violet 151', set_number: '207' },
  { name: 'Mew ex IR', set_name: 'Scarlet & Violet 151', set_number: '193' },
  { name: 'Charizard ex IR', set_name: 'Scarlet & Violet 151', set_number: '182' },

  // ── Evolving Skies ────────────────────────────────────────────────────────
  { name: 'Umbreon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '215' },
  { name: 'Rayquaza VMAX Alt Art', set_name: 'Evolving Skies', set_number: '218' },
  { name: 'Glaceon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '209' },
  { name: 'Espeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '208' },
  { name: 'Leafeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '210' },
  { name: 'Flareon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '211' },
  { name: 'Vaporeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '212' },
  { name: 'Jolteon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '213' },
  { name: 'Ditto VMAX Alt Art', set_name: 'Evolving Skies', set_number: '217' },
  { name: 'Dragonite V Alt Art', set_name: 'Evolving Skies', set_number: '192' },
  { name: 'Umbreon V Alt Art', set_name: 'Evolving Skies', set_number: '188' },
  { name: 'Rayquaza V Alt Art', set_name: 'Evolving Skies', set_number: '194' },

  // ── Paldean Fates ─────────────────────────────────────────────────────────
  { name: 'Charizard ex SIR', set_name: 'Paldean Fates', set_number: '90' },
  { name: 'Meowscarada ex SIR', set_name: 'Paldean Fates', set_number: '91' },
  { name: 'Skeledirge ex SIR', set_name: 'Paldean Fates', set_number: '92' },
  { name: 'Quaquaval ex SIR', set_name: 'Paldean Fates', set_number: '93' },
  { name: 'Iono SIR', set_name: 'Paldean Fates', set_number: '94' },

  // ── Obsidian Flames ───────────────────────────────────────────────────────
  { name: 'Charizard ex SIR', set_name: 'Obsidian Flames', set_number: '234' },
  { name: 'Tyranitar ex SIR', set_name: 'Obsidian Flames', set_number: '235' },
  { name: 'Revavroom ex SIR', set_name: 'Obsidian Flames', set_number: '236' },
  { name: 'Charizard ex IR', set_name: 'Obsidian Flames', set_number: '228' },
  { name: 'Pidgeot ex IR', set_name: 'Obsidian Flames', set_number: '226' },

  // ── Paradox Rift ──────────────────────────────────────────────────────────
  { name: 'Roaring Moon ex SIR', set_name: 'Paradox Rift', set_number: '254' },
  { name: 'Iron Valiant ex SIR', set_name: 'Paradox Rift', set_number: '255' },
  { name: 'Garchomp ex SIR', set_name: 'Paradox Rift', set_number: '253' },
  { name: 'Roaring Moon ex IR', set_name: 'Paradox Rift', set_number: '245' },
  { name: 'Iron Valiant ex IR', set_name: 'Paradox Rift', set_number: '246' },

  // ── Temporal Forces ───────────────────────────────────────────────────────
  { name: 'Walking Wake ex SIR', set_name: 'Temporal Forces', set_number: '202' },
  { name: 'Iron Leaves ex SIR', set_name: 'Temporal Forces', set_number: '203' },
  { name: 'Raging Bolt ex SIR', set_name: 'Temporal Forces', set_number: '204' },
  { name: 'Iron Crown ex SIR', set_name: 'Temporal Forces', set_number: '205' },
  { name: 'Ursaluna ex IR', set_name: 'Temporal Forces', set_number: '193' },

  // ── Twilight Masquerade ───────────────────────────────────────────────────
  { name: 'Bloodmoon Ursaluna ex SIR', set_name: 'Twilight Masquerade', set_number: '221' },
  { name: 'Teal Mask Ogerpon ex SIR', set_name: 'Twilight Masquerade', set_number: '218' },
  { name: 'Kieran SIR', set_name: 'Twilight Masquerade', set_number: '223' },
  { name: 'Perrin SIR', set_name: 'Twilight Masquerade', set_number: '222' },

  // ── Shrouded Fable ────────────────────────────────────────────────────────
  { name: 'Pecharunt ex SIR', set_name: 'Shrouded Fable', set_number: '100' },
  { name: 'Darkrai ex SIR', set_name: 'Shrouded Fable', set_number: '98' },
  { name: 'Fezandipiti ex SIR', set_name: 'Shrouded Fable', set_number: '99' },

  // ── Stellar Crown ─────────────────────────────────────────────────────────
  { name: 'Terapagos ex SIR', set_name: 'Stellar Crown', set_number: '182' },
  { name: 'Scizor ex SIR', set_name: 'Stellar Crown', set_number: '183' },
  { name: 'Ceruledge ex SIR', set_name: 'Stellar Crown', set_number: '184' },
  { name: 'Drayton SIR', set_name: 'Stellar Crown', set_number: '186' },

  // ── Surging Sparks ────────────────────────────────────────────────────────
  { name: 'Pikachu ex SIR', set_name: 'Surging Sparks', set_number: '261' },
  { name: 'Raichu ex SIR', set_name: 'Surging Sparks', set_number: '262' },
  { name: 'Zekrom ex SIR', set_name: 'Surging Sparks', set_number: '263' },
  { name: 'Pikachu ex IR', set_name: 'Surging Sparks', set_number: '252' },

  // ── Scarlet & Violet Base ─────────────────────────────────────────────────
  { name: 'Charizard ex SIR', set_name: 'Scarlet & Violet', set_number: '234' },
  { name: 'Arcanine ex SIR', set_name: 'Scarlet & Violet', set_number: '232' },
  { name: 'Gyarados ex SIR', set_name: 'Scarlet & Violet', set_number: '235' },
  { name: 'Miraidon ex SIR', set_name: 'Scarlet & Violet', set_number: '243' },
  { name: 'Koraidon ex SIR', set_name: 'Scarlet & Violet', set_number: '247' },

  // ── Paldea Evolved ────────────────────────────────────────────────────────
  { name: 'Iono SIR', set_name: 'Paldea Evolved', set_number: '269' },
  { name: 'Gardevoir ex SIR', set_name: 'Paldea Evolved', set_number: '266' },
  { name: 'Forretress ex SIR', set_name: 'Paldea Evolved', set_number: '264' },

  // ── Crown Zenith ──────────────────────────────────────────────────────────
  { name: 'Regieleki VMAX Alt Art', set_name: 'Crown Zenith', set_number: '167' },
  { name: 'Regidrago VSTAR Alt Art', set_name: 'Crown Zenith', set_number: '165' },
  { name: 'Glaceon VSTAR Alt Art', set_name: 'Crown Zenith', set_number: '164' },
  { name: 'Galarian Articuno V Alt Art', set_name: 'Crown Zenith', set_number: '174' },

  // ── Brilliant Stars ───────────────────────────────────────────────────────
  { name: 'Charizard VSTAR Rainbow', set_name: 'Brilliant Stars', set_number: '174' },
  { name: 'Arceus VSTAR Rainbow', set_name: 'Brilliant Stars', set_number: '176' },
  { name: 'Arceus V Alt Art', set_name: 'Brilliant Stars', set_number: '166' },

  // ── Astral Radiance ───────────────────────────────────────────────────────
  { name: 'Origin Forme Palkia VSTAR Alt Art', set_name: 'Astral Radiance', set_number: '202' },
  { name: 'Origin Forme Dialga VSTAR Alt Art', set_name: 'Astral Radiance', set_number: '200' },
  { name: 'Hisuian Zoroark VSTAR Alt Art', set_name: 'Astral Radiance', set_number: '207' },

  // ── Lost Origin ───────────────────────────────────────────────────────────
  { name: 'Giratina VSTAR Alt Art', set_name: 'Lost Origin', set_number: '214' },
  { name: 'Aerodactyl VSTAR Alt Art', set_name: 'Lost Origin', set_number: '211' },
  { name: 'Comfey Alt Art', set_name: 'Lost Origin', set_number: '207' },

  // ── Silver Tempest ────────────────────────────────────────────────────────
  { name: 'Lugia VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '211' },
  { name: 'Serperior VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '209' },
  { name: 'Alolan Vulpix VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '208' },

  // ── Fusion Strike ─────────────────────────────────────────────────────────
  { name: 'Gengar VMAX Alt Art', set_name: 'Fusion Strike', set_number: '271' },
  { name: 'Mew VMAX Alt Art', set_name: 'Fusion Strike', set_number: '269' },
  { name: 'Espeon VMAX Alt Art', set_name: 'Fusion Strike', set_number: '270' },
  { name: 'Beedrill V Alt Art', set_name: 'Fusion Strike', set_number: '261' },
];

if (!supabase) {
  console.error('Supabase ikke konfigurert.');
  process.exit(1);
}

// Slett gamle 15 kort og sett inn alle nye
const { error: delErr } = await supabase.from('cards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
if (delErr) {
  console.error('Feil ved sletting:', delErr.message);
  process.exit(1);
}

const { error } = await supabase.from('cards').insert(cards);
if (error) {
  console.error('Feil:', error.message);
} else {
  console.log(`Seeded ${cards.length} kort i Supabase.`);
}
