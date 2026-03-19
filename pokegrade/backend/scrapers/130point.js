import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://130point.com/sales/';

// Henter PSA 10-priser fra 130point.com (aggregerer eBay-salg)
// Returnerer gjennomsnitt av siste salg i USD, eller null hvis ingen data
export async function scrapePsa10Price(cardName) {
  const url = `${BASE_URL}?search=${encodeURIComponent(cardName)}&grade=10`;

  let html;
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });
    html = res.data;
  } catch (err) {
    console.error(`[130point] HTTP-feil for "${cardName}":`, err.message);
    return null;
  }

  const $ = cheerio.load(html);
  const prices = [];

  // 130point viser salgspriser i tabellceller med dollartegn
  $('td').each((_, el) => {
    const text = $(el).text().trim();
    if (!text.startsWith('$')) return;
    const price = parseFloat(text.replace(/[$,]/g, ''));
    if (price > 0 && price < 100000) prices.push(price);
  });

  if (prices.length === 0) return null;

  // Gjennomsnitt av siste salg (maks 10)
  const recent = prices.slice(0, 10);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  return Math.round(avg * 100) / 100;
}
