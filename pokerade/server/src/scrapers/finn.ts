import axios from 'axios';
import * as cheerio from 'cheerio';
import type { FinnListing } from '../database';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.7',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

interface RawDoc {
  id?: string;
  heading?: string;
  price?: { amount?: number };
  canonical_url?: string;
  published?: string;
  image?: { url?: string };
}

export async function scrapeFinnPage(query: string, page = 1): Promise<FinnListing[]> {
  const url =
    `https://www.finn.no/bap/forsale/search.html` +
    `?q=${encodeURIComponent(query)}&sort=PUBLISHED_DESC&page=${page}`;

  const { data: html } = await axios.get<string>(url, {
    headers: HEADERS,
    timeout: 15000,
  });

  const $ = cheerio.load(html);

  // ── Try __NEXT_DATA__ JSON (most reliable) ───────────────────────────────
  const nextRaw = $('script#__NEXT_DATA__').html();
  if (nextRaw) {
    try {
      const next = JSON.parse(nextRaw) as {
        props?: { pageProps?: { searchData?: { docs?: RawDoc[] } } };
      };
      const docs = next.props?.pageProps?.searchData?.docs;
      if (Array.isArray(docs) && docs.length > 0) {
        return docs.map(docToListing);
      }
    } catch {
      // fall through
    }
  }

  // ── HTML fallback ─────────────────────────────────────────────────────────
  const listings: FinnListing[] = [];
  $('article[data-testid="ad-list-item"], article.ads__unit').each((_, el) => {
    const $el = $(el);
    const title = $el.find('h2, [data-testid="ad-title"]').first().text().trim();
    const priceText = $el.find('[data-testid="price-primary"], .ads__unit__price').first().text().trim();
    const priceNok = parsePrice(priceText);
    const href = $el.find('a').first().attr('href') ?? '';
    const url = href.startsWith('http') ? href : `https://www.finn.no${href}`;
    const codeMatch = url.match(/finnkode[=/](\d+)/i) ?? url.match(/\/(\d{7,})(?:\?|$)/);
    const finnCode = codeMatch?.[1] ?? '';
    const thumbnail = $el.find('img').first().attr('src') ?? null;

    if (title && finnCode) {
      listings.push({ finnCode, cardId: null, title, priceNok, url, thumbnail, publishedAt: null });
    }
  });
  return listings;
}

function docToListing(doc: RawDoc): FinnListing {
  const finnCode = doc.id ?? '';
  return {
    finnCode,
    cardId: null,
    title: doc.heading ?? '',
    priceNok: doc.price?.amount ?? null,
    url: doc.canonical_url ?? `https://www.finn.no/bap/forsale/ad.html?finnkode=${finnCode}`,
    thumbnail: doc.image?.url ?? null,
    publishedAt: doc.published ?? null,
  };
}

function parsePrice(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, '');
  const n = parseInt(digits, 10);
  return isNaN(n) || n === 0 ? null : n;
}

// ── Match listing to a card by name keywords ─────────────────────────────────
export function matchCardId(
  title: string,
  cards: { id: string; name: string; set: string }[]
): string | null {
  const t = title.toLowerCase();
  let bestId: string | null = null;
  let bestScore = 0;

  for (const card of cards) {
    // Split card name into words and check how many appear in the title
    const words = card.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    const hits = words.filter(w => t.includes(w)).length;
    const score = hits / words.length;
    if (score > 0.6 && score > bestScore) {
      bestScore = score;
      bestId = card.id;
    }
  }
  return bestId;
}

// ── Scrape multiple pages for a broad query ───────────────────────────────────
export async function scrapeFinn(
  query: string,
  maxPages = 3,
  cards: { id: string; name: string; set: string }[] = []
): Promise<FinnListing[]> {
  const all: FinnListing[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const listings = await scrapeFinnPage(query, page);
      if (listings.length === 0) break;
      for (const l of listings) {
        l.cardId = matchCardId(l.title, cards);
      }
      all.push(...listings);
      // Polite delay between pages
      if (page < maxPages) await sleep(1500);
    } catch (err) {
      console.error(`Finn scrape feilet side ${page}:`, err instanceof Error ? err.message : err);
      break;
    }
  }
  return all;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
