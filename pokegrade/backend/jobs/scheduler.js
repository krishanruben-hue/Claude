import cron from 'node-cron';
import { supabase, isMockMode } from '../db/supabase.js';
import { fetchPrices, searchCards } from '../services/pokemonapi.js';
import { scrapePsaPopulation } from '../scrapers/psa.js';
import { scrapeFinnListings } from '../scrapers/finn.js';
import { scrapePsa10Price } from '../scrapers/130point.js';
import { backfillMissingFxRates } from '../services/exchangerate.js';

export function startScheduler() {
  if (isMockMode) {
    console.log('[Scheduler] Mock-modus – planlagte jobber er deaktivert');
    return;
  }

  // PSA Pop Report – 03:00 daglig
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Starter PSA-scraping...');
    await refreshAllPsaData();
  });

  // Finn.no – hvert 60. minutt
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Starter Finn.no-scraping...');
    await refreshAllFinnData();
  });

  console.log('[Scheduler] Planlagte jobber aktivert');
}

export async function refreshAllPrices(setId = null) {
  if (!supabase) return { refreshed: 0, errors: [] };
  let query = supabase.from('cards').select('id, name, pokemon_api_id');
  if (setId) query = query.eq('set_id', setId);
  const { data: cards, error: cardsError } = await query;
  if (cardsError) {
    console.error('[refreshAllPrices] Supabase-feil ved henting av kort:', cardsError);
    throw new Error(`Supabase-feil: ${cardsError.message}`);
  }
  const errors = [];
  let refreshed = 0;

  for (const card of cards || []) {
    if (!card.pokemon_api_id) continue;
    try {
      const prices = await fetchPrices(card.pokemon_api_id);
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('price_snapshots').upsert({
        card_id: card.id,
        date: today,
        ...prices,
      }, { onConflict: 'card_id,date' });
      refreshed++;
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    } catch (err) {
      errors.push({ card: card.name, error: err.message });
    }
  }

  await backfillMissingFxRates();
  return { refreshed, errors };
}

export async function refreshAllPsaData() {
  if (!supabase) return { refreshed: 0, errors: [] };
  const { data: cards } = await supabase.from('cards').select('id, name, set_name');
  const errors = [];
  let refreshed = 0;

  for (const card of cards || []) {
    const pop = await scrapePsaPopulation(card.name, card.set_name);
    if (pop) {
      await supabase.from('psa_population').insert({ card_id: card.id, ...pop });
      refreshed++;
    } else {
      errors.push({ card: card.name, error: 'Scraping returnerte ingen data' });
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  return { refreshed, errors };
}

export async function refreshAllFinnData() {
  if (!supabase) return { refreshed: 0, errors: [] };
  const { data: cards } = await supabase.from('cards').select('id, name');
  const errors = [];
  let refreshed = 0;

  for (const card of cards || []) {
    try {
      const listings = await scrapeFinnListings(card.name);
      if (listings.length > 0) {
        const rows = listings.map(l => ({ ...l, card_id: card.id }));
        await supabase.from('finn_listings').insert(rows);
        refreshed++;
      }
    } catch (err) {
      errors.push({ card: card.name, error: err.message });
    }
    await new Promise(r => setTimeout(r, 3000));
  }

  return { refreshed, errors };
}

// Auto-kobler pokemon_api_id for alle kort som mangler det, ved å søke i RapidAPI
export async function autoLinkCardIds() {
  if (!supabase) return { linked: 0, errors: [] };
  const { data: cards } = await supabase
    .from('cards')
    .select('id, name, set_name, set_number')
    .is('pokemon_api_id', null);

  const errors = [];
  let linked = 0;

  for (const card of cards || []) {
    try {
      const results = await searchCards(card.name, card.set_name, card.set_number);
      if (results.length === 0) {
        errors.push({ card: card.name, error: 'Ingen treff i API' });
      } else {
        // Velg beste treff: eksakt navnematch, ellers første
        const match = results.find(r => r.name.toLowerCase() === card.name.toLowerCase()) ?? results[0];
        await supabase.from('cards').update({ pokemon_api_id: match.id }).eq('id', card.id);
        linked++;
      }
    } catch (err) {
      errors.push({ card: card.name, error: err.message });
    }
    await new Promise(r => setTimeout(r, 150));
  }

  return { linked, errors };
}

// Henter PSA 10-priser fra 130point.com for alle kort med raw_usd > $4 i dag
export async function refreshPsa10Prices() {
  if (!supabase) return { refreshed: 0, errors: [] };

  const today = new Date().toISOString().split('T')[0];

  // Hent kort som har raw_usd > 4 i dagens snapshot
  const { data: snapshots, error } = await supabase
    .from('price_snapshots')
    .select('card_id, cards(name)')
    .eq('date', today)
    .gt('raw_usd', 4);

  if (error) throw new Error(`Supabase-feil: ${error.message}`);

  const errors = [];
  let refreshed = 0;

  for (const snap of snapshots || []) {
    const cardName = snap.cards?.name;
    if (!cardName) continue;
    try {
      const psa10 = await scrapePsa10Price(cardName);
      if (psa10 !== null) {
        await supabase
          .from('price_snapshots')
          .update({ psa10_usd: psa10 })
          .eq('card_id', snap.card_id)
          .eq('date', today);
        refreshed++;
      }
    } catch (err) {
      errors.push({ card: cardName, error: err.message });
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  return { refreshed, errors };
}

export async function refreshFinnForCard(cardId, cardName) {
  if (!supabase) return { listings: [] };
  const listings = await scrapeFinnListings(cardName);
  if (listings.length > 0) {
    const rows = listings.map(l => ({ ...l, card_id: cardId }));
    await supabase.from('finn_listings').insert(rows);
  }
  return { listings };
}
