import axios from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

/** Henter median-salgspris (USD) for "PSA 10 {cardName}" fra eBay sold listings */
export async function scrapeEbaySoldPrice(cardName: string): Promise<number | null> {
  // Build query: "psa 10 <card name> pokemon" – shorter names work better
  const shortName = cardName
    .replace(/\s+(Alt Art|Full Art|Rainbow Rare|Secret Rare|Gold Secret|SIR|SAR|VMAX|VSTAR|GX)\b.*/i, '')
    .trim();
  const query = `psa 10 ${shortName} pokemon`;
  const url =
    `https://www.ebay.com/sch/i.html` +
    `?_nkw=${encodeURIComponent(query)}` +
    `&LH_Complete=1&LH_Sold=1&_sop=12&_ipg=50&LH_ItemCondition=4`;

  try {
    const { data: html } = await axios.get<string>(url, {
      headers: HEADERS,
      timeout: 20000,
    });

    const $ = cheerio.load(html);
    const prices: number[] = [];

    $('.s-item').each((_, el) => {
      const $el = $(el);
      // Skip ad items (they have class s-item--watch-at-corner)
      if ($el.hasClass('s-item--watch-at-corner')) return;

      const title = $el.find('.s-item__title').text().toLowerCase();
      // Only keep results that mention "psa 10" in the title
      if (!title.includes('psa 10') && !title.includes('psa10')) return;

      const priceText = $el.find('.s-item__price').first().text();
      // Handle price ranges like "$100.00 to $200.00" – take lower bound
      const match = priceText.match(/\$?([\d,]+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 5) prices.push(price);
      }
    });

    if (prices.length === 0) return null;

    // Remove outliers (outside 1.5×IQR) and return median
    prices.sort((a, b) => a - b);
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    const iqr = q3 - q1;
    const filtered = prices.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr);
    return filtered[Math.floor(filtered.length / 2)] ?? prices[Math.floor(prices.length / 2)];
  } catch (err) {
    console.warn(`eBay scrape feilet for "${cardName}":`, err instanceof Error ? err.message : err);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Oppdaterer PSA 10 USD for en liste med kort, med polite delay mellom requests */
export async function scrapeAllPrices(
  cards: { id: string; name: string }[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const price = await scrapeEbaySoldPrice(card.name);
    if (price !== null) results.set(card.id, price);
    onProgress?.(i + 1, cards.length);
    // Polite delay: 2–4 seconds between requests to avoid rate limiting
    await sleep(2000 + Math.random() * 2000);
  }
  return results;
}
