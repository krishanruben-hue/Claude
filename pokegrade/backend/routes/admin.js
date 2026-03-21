import { Router } from 'express';
import { isMockMode } from '../db/supabase.js';
import { refreshAllPrices, refreshPricesForSet, refreshAllPsaData, refreshAllFinnData, refreshFinnForCard } from '../jobs/scheduler.js';
import { supabase } from '../db/supabase.js';
import axios from 'axios';

const router = Router();

router.post('/refresh-prices', async (req, res) => {
  if (isMockMode) return res.json({ mock: true, message: 'Mock-modus – ingen oppdatering' });
  const setId = req.query.set?.trim();
  res.json({ started: true, message: 'Prisoppdatering startet i bakgrunnen' });
  try {
    const result = setId ? await refreshPricesForSet(setId) : await refreshAllPrices();
    console.log('[Admin] Prisoppdatering ferdig:', result);
  } catch (err) {
    console.error('[Admin] Prisoppdatering feilet:', err.message);
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

// Debug: test ett eBay-kall og returner rå svar
router.get('/debug-ebay', async (req, res) => {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) return res.status(500).json({ error: 'EBAY_APP_ID ikke satt' });

  const keywords = req.query.q || 'Charizard PSA 10';
  try {
    const response = await axios.get('https://svcs.ebay.com/services/search/FindingService/v1', {
      params: {
        'OPERATION-NAME': 'findCompletedItems',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': appId,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'GLOBAL-ID': 'EBAY-US',
        'siteid': '0',
        'keywords': keywords,
        'categoryId': '183454',
        'itemFilter(0).name': 'SoldItemsOnly',
        'itemFilter(0).value': 'true',
        'paginationInput.entriesPerPage': '5',
      },
      timeout: 10000,
    });
    res.json({ status: response.status, appId: appId.slice(0, 8) + '...', keywords, data: response.data });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      httpStatus: err.response?.status,
      data: err.response?.data,
      appId: appId.slice(0, 8) + '...',
      keywords,
    });
  }
});

export default router;
