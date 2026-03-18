import { chromium } from 'playwright';
import { classifyFinnListing } from '../services/calculations.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Scrape Finn.no-annonser for et gitt kortnavn
export async function scrapeFinnListings(cardName) {
  const searchUrl = `https://www.finn.no/bap/forsale/search.html?q=${encodeURIComponent(cardName)}`;
  const listings = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: randomUA() });
    const page = await context.newPage();

    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Finn alle annonsekort
    const items = await page.$$eval('[data-testid="advert-list"] article, [class*="ads__list"] article', (els) =>
      els.map((el) => {
        const titleEl = el.querySelector('h2, [data-testid="heading"]');
        const priceEl = el.querySelector('[class*="price"], [data-testid="price"]');
        const locationEl = el.querySelector('[class*="location"]');
        const linkEl = el.querySelector('a[href*="/bap/"]');
        const viewsEl = el.querySelector('[class*="views"], [class*="count"]');

        const priceText = priceEl?.textContent?.replace(/\s/g, '').replace(/kr/i, '').trim() || '';
        const priceNok = parseInt(priceText.replace(/[^0-9]/g, '')) || null;

        return {
          title: titleEl?.textContent?.trim() || '',
          price_nok: priceNok,
          location: locationEl?.textContent?.trim() || '',
          views: parseInt(viewsEl?.textContent) || 0,
          url: linkEl?.href || '',
          finn_id: linkEl?.href?.match(/\/(\d+)$/)?.[1] || null,
        };
      })
    );

    for (const item of items) {
      if (!item.title) continue;
      const flag = classifyFinnListing(item.title, cardName);
      listings.push({ ...item, flag, listing_type: 'fastpris' });
    }
  } catch (err) {
    console.error(`[Finn] Scraping-feil for "${cardName}":`, err.message);
  } finally {
    if (browser) await browser.close();
  }

  return listings;
}
