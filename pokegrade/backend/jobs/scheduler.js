import cron from 'node-cron';
import { supabase, isMockMode } from '../db/supabase.js';
import { fetchPrices } from '../services/ebay.js';
import { searchCards } from '../services/pokemonapi.js';
import { scrapePsaPopulation } from '../scrapers/psa.js';
import { scrapeFinnListings } from '../scrapers/finn.js';
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

async function refreshPricesForCards(cards) {
  const errors = [];
  let refreshed = 0;
  let nullPrices = 0;

  for (const card of cards || []) {
    try {
      const prices = await fetchPrices(card.name);
      const hasPrices = prices.psa10_usd != null || prices.psa9_usd != null || prices.raw_usd != null;

      if (!hasPrices) {
        nullPrices++;
        console.warn(`[Prices] Ingen eBay-treff for "${card.name}"`);
        continue;
      }

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('price_snapshots').upsert({
        card_id: card.id,
        date: today,
        ...prices,
      }, { onConflict: 'card_id,date' });

      if (error) {
        errors.push({ card: card.name, error: error.message });
      } else {
        refreshed++;
      }

      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    } catch (err) {
      errors.push({ card: card.name, error: err.message });
    }
  }

  if (nullPrices > 0) {
    errors.push({ card: '(ingen treff)', error: `${nullPrices} kort hadde ingen eBay solgt-data` });
  }

  return { refreshed, errors };
}

export async function refreshAllPrices() {
  if (!supabase) return { refreshed: 0, errors: [] };
  const { data: cards } = await supabase.from('cards').select('id, name');
  const result = await refreshPricesForCards(cards);
  await backfillMissingFxRates();
  return result;
}

export async function refreshPricesForSet(setId) {
  if (!supabase) return { refreshed: 0, errors: [] };
  const { data: cards } = await supabase.from('cards').select('id, name').eq('set_id', setId);
  const result = await refreshPricesForCards(cards);
  await backfillMissingFxRates();
  return result;
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

export async function refreshFinnForCard(cardId, cardName) {
  if (!supabase) return { listings: [] };
  const listings = await scrapeFinnListings(cardName);
  if (listings.length > 0) {
    const rows = listings.map(l => ({ ...l, card_id: cardId }));
    await supabase.from('finn_listings').insert(rows);
  }
  return { listings };
}
