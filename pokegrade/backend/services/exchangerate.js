import axios from 'axios';
import { supabase } from '../db/supabase.js';

const BASE_URL = 'https://api.exchangerate.host/timeseries';

// Hent historiske FX-kurser for datoperiode
export async function fetchFxRates(startDate, endDate) {
  const params = {
    start_date: startDate,
    end_date: endDate,
    base: 'USD',
    symbols: 'NOK',
  };
  if (process.env.EXCHANGERATE_API_KEY) {
    params.access_key = process.env.EXCHANGERATE_API_KEY;
  }

  const res = await axios.get(BASE_URL, { params, timeout: 15000 });
  const rates = res.data.rates || {};

  // Format: { 'YYYY-MM-DD': { NOK: 10.65 }, ... }
  const result = {};
  for (const [date, currencies] of Object.entries(rates)) {
    if (currencies.NOK) result[date] = currencies.NOK;
  }
  return result;
}

// Lagre FX-kurser i databasen
export async function storeFxRates(ratesMap) {
  if (!supabase) return;
  const rows = Object.entries(ratesMap).map(([date, usd_nok]) => ({ date, usd_nok }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('fx_rates').upsert(rows, { onConflict: 'date' });
  if (error) console.error('[FX] Lagrings-feil:', error.message);
}

// Hent siste tilgjengelige kurs fra database
export async function getLatestFxRate() {
  if (!supabase) return 10.65; // fallback
  const { data, error } = await supabase
    .from('fx_rates')
    .select('usd_nok')
    .order('date', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return 10.65;
  return data.usd_nok;
}

// Forward-fill manglende datoer (helger/helligdager)
export async function backfillMissingFxRates() {
  if (!supabase) return;
  try {
    // Finn eldste dato i price_snapshots
    const { data: oldest } = await supabase
      .from('price_snapshots')
      .select('date')
      .order('date', { ascending: true })
      .limit(1)
      .single();

    if (!oldest) return;

    const start = oldest.date;
    const end = new Date().toISOString().split('T')[0];

    const rates = await fetchFxRates(start, end);
    await storeFxRates(rates);
    console.log(`[FX] Backfilled ${Object.keys(rates).length} kurser`);
  } catch (err) {
    console.error('[FX] Backfill-feil:', err.message);
  }
}
