import cron from 'node-cron';
import axios from 'axios';

const BASE = 'http://localhost:3001';

export function startScheduler(): void {
  // Finn.no – hvert 6. time
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Starter Finn-scraping...');
    try {
      await axios.post(`${BASE}/api/scrape/finn`, {}, { timeout: 5000 });
    } catch (err) {
      console.error('[Scheduler] Finn-trigger feilet:', err instanceof Error ? err.message : err);
    }
  });

  // eBay-priser – én gang daglig kl. 03:00
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Starter eBay-prisscraping...');
    try {
      await axios.post(`${BASE}/api/scrape/prices`, {}, { timeout: 5000 });
    } catch (err) {
      console.error('[Scheduler] eBay-trigger feilet:', err instanceof Error ? err.message : err);
    }
  });

  console.log('[Scheduler] Aktiv – Finn hvert 6t, priser daglig kl. 03:00');
}
