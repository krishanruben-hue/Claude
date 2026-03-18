/**
 * Importerer ALLE kort fra PokemonTCG/pokemon-tcg-data (GitHub)
 * til Supabase-databasen.
 *
 * Kjør lokalt:  node db/import-from-github.js
 *
 * Krav:
 *  - .env med SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY (eller SUPABASE_ANON_KEY)
 *  - Internettilgang til raw.githubusercontent.com
 *  - Supabase-tabellen cards må ha kolonnene:
 *      name, set_name, set_number, set_id, supertype, rarity, image_url
 *    (kjør de ALTER TABLE-linjene i schema.sql om de mangler)
 */

import 'dotenv/config';
import { supabase } from './supabase.js';

const BASE_URL =
  'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en';

// Alle sett brukeren vil ha, i rekkefølge
const SET_IDS = [
  // ── Sword & Shield ────────────────────────────────────
  'swsh1',       // Sword & Shield
  'swsh2',       // Rebel Clash
  'swsh3',       // Darkness Ablaze
  'swsh35',      // Champion's Path
  'swsh4',       // Vivid Voltage
  'swsh45',      // Shining Fates
  'swsh45sv',    // Shining Fates – Shiny Vault
  'swsh5',       // Battle Styles
  'swsh6',       // Chilling Reign
  'swsh7',       // Evolving Skies
  'cel25',       // Celebrations
  'cel25c',      // Celebrations – Classic Collection
  'swsh8',       // Fusion Strike
  'swsh9',       // Brilliant Stars
  'swsh9tg',     // Brilliant Stars – Trainer Gallery
  'swsh10',      // Astral Radiance
  'swsh10tg',    // Astral Radiance – Trainer Gallery
  'pgo',         // Pokémon GO
  'swsh11',      // Lost Origin
  'swsh11tg',    // Lost Origin – Trainer Gallery
  'swsh12',      // Silver Tempest
  'swsh12tg',    // Silver Tempest – Trainer Gallery
  'swsh12pt5',   // Crown Zenith
  'swsh12pt5gg', // Crown Zenith – Galarian Gallery

  // ── Scarlet & Violet ──────────────────────────────────
  'sv1',         // Scarlet & Violet
  'sv2',         // Paldea Evolved
  'sv3',         // Obsidian Flames
  'sv3pt5',      // 151
  'sv4',         // Paradox Rift
  'sv4pt5',      // Paldean Fates
  'sv5',         // Temporal Forces
  'sv6',         // Twilight Masquerade
  'sv6pt5',      // Shrouded Fable
  'sv7',         // Stellar Crown
  'sv8',         // Surging Sparks
  'sv8pt5',      // Prismatic Evolutions
  'sv9',         // Journey Together
  'sv10',        // Destined Rivals

  // ── Mega Evolution ────────────────────────────────────
  'me1',         // Mega Evolution
  'me2',         // Phantasmal Flames
  'me2pt5',      // Ascended Heroes
  // me3 (Perfect Order) og me4 (Chaos Rising) er ikke i repoet ennå
];

async function fetchCards(setId) {
  const url = `${BASE_URL}/${setId}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ⚠️  Kunne ikke hente ${setId}: HTTP ${res.status}`);
    return [];
  }
  return res.json();
}

async function upsertBatch(rows) {
  const { error } = await supabase
    .from('cards')
    .upsert(rows, { onConflict: 'set_id,set_number' });
  if (error) throw new Error(error.message);
}

async function main() {
  if (!supabase) {
    console.error('Supabase ikke konfigurert. Sjekk .env-filen.');
    process.exit(1);
  }

  let totalInserted = 0;
  const BATCH_SIZE = 100;

  for (const setId of SET_IDS) {
    process.stdout.write(`Henter ${setId}… `);
    const cards = await fetchCards(setId);
    if (cards.length === 0) {
      console.log('ingen kort.');
      continue;
    }

    // Dedupliser på (set_id, set_number) — noen sett har duplikate numre
    const seen = new Set();
    const rows = cards
      .map((c) => ({
        name: c.name,
        set_name: c.set?.name ?? setId,
        set_number: c.number,
        set_id: setId,
        supertype: c.supertype ?? null,
        rarity: c.rarity ?? null,
        image_url: c.images?.small ?? null,
      }))
      .filter((r) => {
        const key = `${r.set_id}|${r.set_number}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      await upsertBatch(rows.slice(i, i + BATCH_SIZE));
    }

    totalInserted += rows.length;
    console.log(`${rows.length} kort lagt inn.`);
  }

  console.log(`\nFerdig! Totalt ${totalInserted} kort importert.`);
}

main().catch((err) => {
  console.error('Feil:', err.message);
  process.exit(1);
});
