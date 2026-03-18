import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

// Scrape PSA Pop Report for et gitt kortnavn
export async function scrapePsaPopulation(cardName, setName) {
  const searchQuery = `${cardName} ${setName}`;
  const searchUrl = `https://www.psacard.com/pop/tcg-cards/search?q=${encodeURIComponent(searchQuery)}`;
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    const $ = cheerio.load(html);

    const pop = {
      grade_1: 0, grade_2: 0, grade_3: 0, grade_4: 0, grade_5: 0,
      grade_6: 0, grade_7: 0, grade_8: 0, grade_9: 0, grade_10: 0,
      total: 0,
    };

    // Parser PSA pop-tabell – kolonne-rekkefølge: 1, 1.5, 2, ..., 10
    $('table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 10) {
        // Prøv a lese grade-kolonner
        const values = cells.map((_, td) => parseInt($(td).text().replace(/,/g, '')) || 0).get();
        // PSA-tabell har typisk grade 10 i siste kolonne
        if (values.some(v => v > 0)) {
          pop.grade_10 = Math.max(pop.grade_10, values[values.length - 1]);
          pop.grade_9 = Math.max(pop.grade_9, values[values.length - 2] || 0);
          pop.grade_8 = Math.max(pop.grade_8, values[values.length - 3] || 0);
          pop.grade_7 = Math.max(pop.grade_7, values[values.length - 4] || 0);
        }
      }
    });

    pop.total = Object.values(pop).reduce((a, b) => a + b, 0);
    return pop;
  } catch (err) {
    console.error(`[PSA] Scraping-feil for "${cardName}":`, err.message);
    return null; // Returner null, ikke overskriv eksisterende data
  } finally {
    if (browser) await browser.close();
  }
}
