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

// GET /api/cards
router.get('/', async (req, res) => {
  try {
    const fxRate = isMockMode ? MOCK_FX_RATE : await getLatestFxRate();

    if (isMockMode) {
      const cards = MOCK_CARDS.map(card => ({
        ...card,
        ...computeMetrics(card, fxRate),
        fx_rate: fxRate,
      }));
      return res.json({ cards, mock: true, fx_rate: fxRate });
    }

    // Hent kort med siste snapshot og PSA-pop
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*');

    if (error) return res.status(500).json({ error: error.message });

    const enriched = await Promise.all(cards.map(async (card) => {
      // Siste priser
      const { data: snapshot } = await supabase
        .from('price_snapshots')
        .select('raw_usd, psa9_usd, psa10_usd')
        .eq('card_id', card.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      // Siste PSA-pop
      const { data: pop } = await supabase
        .from('psa_population')
        .select('*')
        .eq('card_id', card.id)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      // Finn-annonser siste 2 timer
      const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      const { data: finnRows } = await supabase
        .from('finn_listings')
        .select('price_nok, flag')
        .eq('card_id', card.id)
        .eq('flag', 'none')
        .gte('fetched_at', twoHoursAgo);

      const finnPrices = (finnRows || []).map(r => r.price_nok).filter(Boolean);
      const merged = {
        ...card,
        ...(snapshot || {}),
        ...(pop || {}),
        finn_count: finnPrices.length,
        finn_min_nok: finnPrices.length ? Math.min(...finnPrices) : null,
        finn_max_nok: finnPrices.length ? Math.max(...finnPrices) : null,
      };

      return { ...merged, ...computeMetrics(merged, fxRate), fx_rate: fxRate };
    }));

    res.json({ cards: enriched, mock: false, fx_rate: fxRate });
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
