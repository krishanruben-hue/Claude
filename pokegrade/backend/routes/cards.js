import { Router } from 'express';
import { supabase, isMockMode } from '../db/supabase.js';
import { MOCK_CARDS, MOCK_FX_RATE, MOCK_FINN_LISTINGS } from '../db/mockData.js';
import {
  calculateROI, calculateMultiplier, calculateGemRate,
  calculateBreakEvenGrade, calculateGradingCost, calculateFinnDeviation, usdToNok,
} from '../services/calculations.js';
import { getLatestFxRate } from '../services/exchangerate.js';

const router = Router();

// Beregn metrics for et kort gitt raapriser og PSA-pop
function computeMetrics(card, fxRate, batchSize = 1) {
  const gradingCost = calculateGradingCost(batchSize);
  const rawUsd = card.raw_usd;
  const psa10Usd = card.psa10_usd;
  const psa9Usd = card.psa9_usd;

  const rawNok = rawUsd ? usdToNok(rawUsd, fxRate) : null;
  const psa10Nok = psa10Usd ? usdToNok(psa10Usd, fxRate) : null;

  const gemRate = calculateGemRate(card.grade_10, card.total);
  const multiplier = calculateMultiplier(psa10Usd, rawUsd);
  const roi = calculateROI(psa10Usd, rawUsd, gradingCost);

  const gradedPrices = {};
  for (let g = 1; g <= 10; g++) gradedPrices[g] = card[`psa${g}_usd`] || null;
  gradedPrices[10] = psa10Usd;
  gradedPrices[9] = psa9Usd;

  const breakEvenGrade = calculateBreakEvenGrade(gradedPrices, rawUsd, gradingCost);

  return {
    raw_usd: rawUsd,
    raw_nok: rawNok ? Math.round(rawNok) : null,
    psa10_usd: psa10Usd,
    psa10_nok: psa10Nok ? Math.round(psa10Nok) : null,
    psa9_usd: psa9Usd,
    multiplier: multiplier ? Math.round(multiplier * 10) / 10 : null,
    gem_rate: gemRate,
    roi,
    break_even_grade: breakEvenGrade,
    grading_cost_usd: gradingCost,
    low_data_warning: (card.total || 0) < 50,
    psa10_pop: card.grade_10 || 0,
    total_pop: card.total || 0,
    finn_count: card.finn_count || 0,
    finn_min_nok: card.finn_min_nok || null,
    finn_max_nok: card.finn_max_nok || null,
  };
}

// Visningsnavn for alle sett (set_id → navn)
const SET_NAMES = {
  // Sword & Shield
  swsh1: 'Sword & Shield',
  swsh2: 'Rebel Clash',
  swsh3: 'Darkness Ablaze',
  swsh35: "Champion's Path",
  swsh4: 'Vivid Voltage',
  swsh45: 'Shining Fates',
  swsh45sv: 'Shining Fates – Shiny Vault',
  swsh5: 'Battle Styles',
  swsh6: 'Chilling Reign',
  swsh7: 'Evolving Skies',
  cel25: 'Celebrations',
  cel25c: 'Celebrations – Classic Collection',
  swsh8: 'Fusion Strike',
  swsh9: 'Brilliant Stars',
  swsh9tg: 'Brilliant Stars – Trainer Gallery',
  swsh10: 'Astral Radiance',
  swsh10tg: 'Astral Radiance – Trainer Gallery',
  pgo: 'Pokémon GO',
  swsh11: 'Lost Origin',
  swsh11tg: 'Lost Origin – Trainer Gallery',
  swsh12: 'Silver Tempest',
  swsh12tg: 'Silver Tempest – Trainer Gallery',
  swsh12pt5: 'Crown Zenith',
  swsh12pt5gg: 'Crown Zenith – Galarian Gallery',
  // Scarlet & Violet
  sv1: 'Scarlet & Violet',
  sv2: 'Paldea Evolved',
  sv3: 'Obsidian Flames',
  sv3pt5: '151',
  sv4: 'Paradox Rift',
  sv4pt5: 'Paldean Fates',
  sv5: 'Temporal Forces',
  sv6: 'Twilight Masquerade',
  sv6pt5: 'Shrouded Fable',
  sv7: 'Stellar Crown',
  sv8: 'Surging Sparks',
  sv8pt5: 'Prismatic Evolutions',
  sv9: 'Journey Together',
  sv10: 'Destined Rivals',
  zsv10pt5: 'Black Bolt',
  rsv10pt5: 'White Flare',
  // Mega Evolution
  me1: 'Mega Evolution',
  me2: 'Phantasmal Flames',
  me2pt5: 'Ascended Heroes',
};

// GET /api/sets — returnerer alle sett (statisk liste synkronisert med import-skriptet)
router.get('/sets', (_req, res) => {
  const sets = Object.entries(SET_NAMES)
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json(sets);
});

// GET /api/cards?page=1&limit=50&q=charizard&set=swsh1&rarity=SIR
router.get('/', async (req, res) => {
  try {
    const fxRate = isMockMode ? MOCK_FX_RATE : await getLatestFxRate();

    if (isMockMode) {
      const cards = MOCK_CARDS.map(card => ({
        ...card,
        ...computeMetrics(card, fxRate),
        fx_rate: fxRate,
      }));
      return res.json({ cards, total: cards.length, mock: true, fx_rate: fxRate });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const from  = (page - 1) * limit;
    const q     = req.query.q?.trim() || '';
    const set   = req.query.set?.trim() || '';
    const rarity = req.query.rarity?.trim() || '';

    // Bygg kortspørring med filtre
    let query = supabase.from('cards').select('*', { count: 'exact' });
    if (q)      query = query.ilike('name', `%${q}%`);
    if (set)    query = query.eq('set_id', set);
    if (rarity) query = query.eq('rarity', rarity);
    query = query.order('name').range(from, from + limit - 1);

    const { data: cards, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    if (!cards.length) return res.json({ cards: [], total: 0, mock: false, fx_rate: fxRate });

    const ids = cards.map(c => c.id);

    // Batch-hent siste snapshot per kort (én spørring)
    const { data: snapshots } = await supabase
      .from('price_snapshots')
      .select('card_id, raw_usd, psa9_usd, psa10_usd, date')
      .in('card_id', ids)
      .order('date', { ascending: false });

    const latestSnapshot = {};
    for (const s of snapshots || []) {
      if (!latestSnapshot[s.card_id]) latestSnapshot[s.card_id] = s;
    }

    // Batch-hent siste PSA-pop per kort (én spørring)
    const { data: pops } = await supabase
      .from('psa_population')
      .select('*')
      .in('card_id', ids)
      .order('fetched_at', { ascending: false });

    const latestPop = {};
    for (const p of pops || []) {
      if (!latestPop[p.card_id]) latestPop[p.card_id] = p;
    }

    // Batch-hent Finn-annonser siste 2 timer (én spørring)
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const { data: finnRows } = await supabase
      .from('finn_listings')
      .select('card_id, price_nok')
      .in('card_id', ids)
      .eq('flag', 'none')
      .gte('fetched_at', twoHoursAgo);

    const finnByCard = {};
    for (const f of finnRows || []) {
      if (!finnByCard[f.card_id]) finnByCard[f.card_id] = [];
      finnByCard[f.card_id].push(f.price_nok);
    }

    const enriched = cards.map(card => {
      const snapshot  = latestSnapshot[card.id] || {};
      const pop       = latestPop[card.id] || {};
      const finnPrices = (finnByCard[card.id] || []).filter(Boolean);
      const merged = {
        ...card,
        ...snapshot,
        ...pop,
        finn_count:   finnPrices.length,
        finn_min_nok: finnPrices.length ? Math.min(...finnPrices) : null,
        finn_max_nok: finnPrices.length ? Math.max(...finnPrices) : null,
      };
      return { ...merged, ...computeMetrics(merged, fxRate), fx_rate: fxRate };
    });

    res.json({ cards: enriched, total: count, page, limit, mock: false, fx_rate: fxRate });
  } catch (err) {
    console.error('[cards] GET /', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cards/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fxRate = isMockMode ? MOCK_FX_RATE : await getLatestFxRate();

    if (isMockMode) {
      const card = MOCK_CARDS.find(c => c.id === id);
      if (!card) return res.status(404).json({ error: 'Kort ikke funnet' });

      const finnListings = (MOCK_FINN_LISTINGS[id] || []).map(l => ({
        ...l,
        deviation: calculateFinnDeviation(l.price_nok, card.raw_usd * fxRate),
      }));

      const popTable = {};
      for (let g = 1; g <= 10; g++) popTable[g] = card[`grade_${g}`] || 0;

      return res.json({
        ...card,
        ...computeMetrics(card, fxRate),
        fx_rate: fxRate,
        psa_population_table: popTable,
        finn_listings: finnListings,
        mock: true,
      });
    }

    const { data: card, error } = await supabase.from('cards').select('*').eq('id', id).single();
    if (error || !card) return res.status(404).json({ error: 'Kort ikke funnet' });

    const { data: snapshot } = await supabase
      .from('price_snapshots')
      .select('*')
      .eq('card_id', id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const { data: pop } = await supabase
      .from('psa_population')
      .select('*')
      .eq('card_id', id)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    const { data: finnRows } = await supabase
      .from('finn_listings')
      .select('*')
      .eq('card_id', id)
      .order('fetched_at', { ascending: false })
      .limit(50);

    const rawNok = snapshot ? snapshot.raw_usd * fxRate : null;
    const finnListings = (finnRows || []).map(l => ({
      ...l,
      deviation: rawNok ? calculateFinnDeviation(l.price_nok, rawNok) : null,
    }));

    const popTable = {};
    for (let g = 1; g <= 10; g++) popTable[g] = pop?.[`grade_${g}`] || 0;

    const merged = { ...card, ...(snapshot || {}), ...(pop || {}) };

    res.json({
      ...merged,
      ...computeMetrics(merged, fxRate),
      fx_rate: fxRate,
      psa_population_table: popTable,
      finn_listings: finnListings,
    });
  } catch (err) {
    console.error('[cards] GET /:id', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
