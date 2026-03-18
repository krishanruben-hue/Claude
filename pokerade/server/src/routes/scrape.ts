import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  getAllCards,
  upsertFinnListings,
  updateCardFinnStats,
  upsertCard,
  logScrape,
  getLastScrapeLog,
} from '../database';
import { scrapeFinn } from '../scrapers/finn';
import { scrapeAllPrices } from '../scrapers/ebay';

const router = Router();

// Tracks whether a scrape is already running
const running = { finn: false, prices: false };

// ── GET /api/scrape/status ────────────────────────────────────────────────────
router.get('/status', async (_req: Request, res: Response) => {
  res.json({ running, lastRun: await getLastScrapeLog() });
});

// ── POST /api/scrape/finn ─────────────────────────────────────────────────────
router.post('/finn', async (_req: Request, res: Response) => {
  if (running.finn) {
    res.status(409).json({ error: 'Finn-scraping kjører allerede' });
    return;
  }
  running.finn = true;
  res.json({ message: 'Finn-scraping startet i bakgrunnen' });

  try {
    const cards = (await getAllCards()).map(c => ({ id: c.id, name: c.name, set: c.set }));
    // Two broad queries cover most PSA-graded Pokemon listings on Finn
    const [batch1, batch2] = await Promise.all([
      scrapeFinn('pokemon PSA 10', 5, cards),
      scrapeFinn('pokemon PSA graded', 3, cards),
    ]);
    const all = [...batch1, ...batch2];

    // De-duplicate by finnCode
    const seen = new Set<string>();
    const unique = all.filter(l => { if (seen.has(l.finnCode)) return false; seen.add(l.finnCode); return true; });

    await upsertFinnListings(unique);

    // Update finn_avg_price / finn_listings_count per card
    const affectedCardIds = [...new Set(unique.map(l => l.cardId).filter(Boolean) as string[])];
    for (const id of affectedCardIds) await updateCardFinnStats(id);

    await logScrape('finn', 'ok', `Hentet ${unique.length} annonser, oppdaterte ${affectedCardIds.length} kort`, affectedCardIds.length);
    console.log(`[Finn] ${unique.length} annonser, ${affectedCardIds.length} kort oppdatert`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logScrape('finn', 'error', msg);
    console.error('[Finn] Feil:', msg);
  } finally {
    running.finn = false;
  }
});

// ── POST /api/scrape/prices ───────────────────────────────────────────────────
router.post('/prices', async (_req: Request, res: Response) => {
  if (running.prices) {
    res.status(409).json({ error: 'Prisscraping kjører allerede' });
    return;
  }
  running.prices = true;
  res.json({ message: 'eBay-prisscraping startet i bakgrunnen (tar ~5–10 min for alle kort)' });

  try {
    const cards = await getAllCards();
    let updated = 0;

    const results = await scrapeAllPrices(cards, (done, total) => {
      if (done % 10 === 0) console.log(`[eBay] ${done}/${total} kort prosessert`);
    });

    for (const [id, price] of results) {
      const card = cards.find(c => c.id === id);
      if (card) {
        await upsertCard({ ...card, psa10Usd: price, lastUpdated: new Date().toISOString() });
        updated++;
      }
    }

    await logScrape('prices', 'ok', `Oppdaterte PSA10 USD for ${updated} kort`, updated);
    console.log(`[eBay] Ferdig – ${updated} kort oppdatert`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logScrape('prices', 'error', msg);
    console.error('[eBay] Feil:', msg);
  } finally {
    running.prices = false;
  }
});

export default router;
