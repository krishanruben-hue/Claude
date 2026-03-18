import cron from 'node-cron';
import { supabase, isMockMode } from '../db/supabase.js';
import { fetchPrices } from '../services/pricecharting.js';
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

export async function refreshAllPrices() {
  if (!supabase) return { refreshed: 0, errors: [] };
  const { data: cards } = await supabase.from('cards').select('id, name, pricecharting_id');
  const errors = [];
  let refreshed = 0;

  for (const card of cards || []) {
    if (!card.pricecharting_id) continue;
    try {
      const prices = await fetchPrices(card.pricecharting_id);
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

export async function refreshFinnForCard(cardId, cardName) {
  if (!supabase) return { listings: [] };
  const listings = await scrapeFinnListings(cardName);
  if (listings.length > 0) {
    const rows = listings.map(l => ({ ...l, card_id: cardId }));
    await supabase.from('finn_listings').insert(rows);
  }
  return { listings };
}
