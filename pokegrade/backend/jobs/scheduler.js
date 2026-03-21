import cron from 'node-cron';
import { supabase, isMockMode } from '../db/supabase.js';
import { fetchPrices } from '../services/ebay.js';
import { scrapePsaPopulation } from '../scrapers/psa.js';
import { scrapeFinnListings } from '../scrapers/finn.js';
import { backfillMissingFxRates } from '../services/exchangerate.js';
import { startProgress, incrementProgress, endProgress } from '../services/progress.js';

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
  const list = cards || [];
  startProgress('Oppdaterer priser', list.length);
  const errors = [];
  let refreshed = 0;
  let nullPrices = 0;

  for (const card of list) {
    try {
      const prices = await fetchPrices(card.name);
      const hasPrices = prices.psa10_usd != null || prices.psa9_usd != null || prices.raw_usd != null;

      if (!hasPrices) {
        nullPrices++;
        console.warn(`[Prices] Ingen eBay-treff for "${card.name}"`);
      } else {
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
      }

      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    } catch (err) {
      errors.push({ card: card.name, error: err.message });
    }
    incrementProgress();
  }

  endProgress();

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
  const list = cards || [];
  startProgress('Scraper PSA Pop Report', list.length);
  const errors = [];
  let refreshed = 0;

  for (const card of list) {
    const pop = await scrapePsaPopulation(card.name, card.set_name);
    if (pop) {
      await supabase.from('psa_population').insert({ card_id: card.id, ...pop });
      refreshed++;
    } else {
      errors.push({ card: card.name, error: 'Scraping returnerte ingen data' });
    }
    incrementProgress();
    await new Promise(r => setTimeout(r, 2000));
  }

  endProgress();
  return { refreshed, errors };
}

export async function refreshAllFinnData() {
  if (!supabase) return { refreshed: 0, errors: [] };
  const { data: cards } = await supabase.from('cards').select('id, name');
  const list = cards || [];
  startProgress('Scraper Finn.no', list.length);
  const errors = [];
  let refreshed = 0;

  for (const card of list) {
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
    incrementProgress();
    await new Promise(r => setTimeout(r, 3000));
  }

  endProgress();
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
