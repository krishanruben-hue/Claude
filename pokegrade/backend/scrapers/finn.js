import { chromium } from 'playwright';
import { classifyFinnListing } from '../services/calculations.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Selektorer å prøve i prioritert rekkefølge
const ARTICLE_SELECTORS = [
  '[data-testid="advert-list"] article',
  '[data-testid="ads-list-item"]',
  '[class*="ads__unit"]',
  '[class*="sf-search-ad"]',
  'article[class*="card"]',
  'article',
];

export async function scrapeFinnListings(cardName) {
  const searchUrl = `https://www.finn.no/bap/forsale/search.html?q=${encodeURIComponent(cardName)}`;
  const listings = [];
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    });
    const context = await browser.newContext({
      userAgent: randomUA(),
      viewport: { width: 1280, height: 900 },
      locale: 'nb-NO',
      extraHTTPHeaders: {
        'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // Skjul headless-fingerprinting
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      window.chrome = { runtime: {} };
    });

    const page = await context.newPage();
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Diagnostikk: logg hvilken side vi faktisk fikk
    const pageTitle = await page.title();
    const finalUrl = page.url();
    console.log(`[Finn] "${cardName}" → title: "${pageTitle}" | url: ${finalUrl}`);

    // Finn annonseelementer med fallback-selektorer
    let items = [];
    for (const selector of ARTICLE_SELECTORS) {
      items = await page.$$eval(selector, (els) =>
        els.map((el) => {
          const titleEl =
            el.querySelector('[data-testid="heading"]') ||
            el.querySelector('h2') ||
            el.querySelector('h3') ||
            el.querySelector('[class*="title"]');

          const priceEl =
            el.querySelector('[data-testid="price"]') ||
            el.querySelector('[class*="price"]') ||
            el.querySelector('[class*="amount"]');

          const locationEl =
            el.querySelector('[class*="location"]') ||
            el.querySelector('[class*="address"]');

          const linkEl =
            el.querySelector('a[href*="/bap/"]') ||
            el.closest('a[href*="/bap/"]') ||
            el.querySelector('a');

          const priceText = priceEl?.textContent?.replace(/\s/g, '').replace(/kr/i, '').trim() || '';
          const priceNok = parseInt(priceText.replace(/[^0-9]/g, '')) || null;

          return {
            title: titleEl?.textContent?.trim() || '',
            price_nok: priceNok,
            location: locationEl?.textContent?.trim() || '',
            views: 0,
            url: linkEl?.href || '',
            finn_id: linkEl?.href?.match(/\/(\d+)$/)?.[1] || null,
          };
        })
      ).catch(() => []);

      if (items.length > 0) {
        console.log(`[Finn] "${cardName}" — ${items.length} annonser funnet med selektor: ${selector}`);
        break;
      }
    }

    if (items.length === 0) {
      // Siste utvei: dump første 500 tegn av body for debugging
      const bodySnippet = await page.$eval('body', el => el.innerText?.slice(0, 500)).catch(() => '(ikke tilgjengelig)');
      console.warn(`[Finn] "${cardName}" — 0 annonser funnet med alle selektorer. Body-snippet:\n${bodySnippet}`);
    }

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
