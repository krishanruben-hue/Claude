import { Router } from 'express';
import { isMockMode } from '../db/supabase.js';
import { refreshAllPrices, refreshAllPsaData, refreshAllFinnData, refreshFinnForCard, autoLinkCardIds } from '../jobs/scheduler.js';
import { supabase } from '../db/supabase.js';

const router = Router();

router.post('/refresh-prices', async (req, res) => {
  if (isMockMode) return res.json({ mock: true, message: 'Mock-modus – ingen oppdatering' });
  try {
    const { set_id } = req.body || {};
    const result = await refreshAllPrices(set_id || null);
    res.json(result);
  } catch (err) {
    console.error('[admin] POST /refresh-prices feil:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh-psa', async (req, res) => {
  if (isMockMode) return res.json({ mock: true, message: 'Mock-modus – ingen oppdatering' });
  try {
    const result = await refreshAllPsaData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh-finn', async (req, res) => {
  if (isMockMode) return res.json({ mock: true, message: 'Mock-modus – ingen oppdatering' });
  try {
    const result = await refreshAllFinnData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auto-link-cards', async (req, res) => {
  if (isMockMode) return res.json({ mock: true, message: 'Mock-modus – ingen oppdatering' });
  try {
    const result = await autoLinkCardIds();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/link-progress', async (req, res) => {
  if (isMockMode) return res.json({ linked: 0, remaining: 0, total: 0 });
  try {
    const { count: total } = await supabase.from('cards').select('*', { count: 'exact', head: true });
    const { count: remaining } = await supabase.from('cards').select('*', { count: 'exact', head: true }).is('pokemon_api_id', null);
    res.json({ linked: total - remaining, remaining, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh-finn/:cardId', async (req, res) => {
  if (isMockMode) return res.json({ mock: true, message: 'Mock-modus – ingen oppdatering' });
  const { cardId } = req.params;
  try {
    const { data: card } = await supabase.from('cards').select('name').eq('id', cardId).single();
    if (!card) return res.status(404).json({ error: 'Kort ikke funnet' });
    const result = await refreshFinnForCard(cardId, card.name);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
