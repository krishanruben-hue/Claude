import axios from 'axios';

// Finding API bruker App ID direkte — ingen OAuth token nødvendig
const FINDING_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';
const POKEMON_CATEGORY_ID = '183454';

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function searchSoldItems(appId, keywords, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await axios.get(FINDING_URL, {
        params: {
          'OPERATION-NAME': 'findCompletedItems',
          'SERVICE-VERSION': '1.0.0',
          'SECURITY-APPNAME': appId,
          'RESPONSE-DATA-FORMAT': 'JSON',
          'GLOBAL-ID': 'EBAY-US',
          'siteid': '0',
          'keywords': keywords,
          'categoryId': POKEMON_CATEGORY_ID,
          'itemFilter(0).name': 'SoldItemsOnly',
          'itemFilter(0).value': 'true',
          'sortOrder': 'EndTimeSoonest',
          'paginationInput.entriesPerPage': '50',
        },
        timeout: 10000,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const response = res.data?.findCompletedItemsResponse?.[0];
      const ack = response?.ack?.[0];
      if (ack !== 'Success' && ack !== 'Warning') {
        const errorId = response?.errorMessage?.[0]?.error?.[0]?.errorId?.[0];
        const msg = response?.errorMessage?.[0]?.error?.[0]?.message?.[0];
        if (errorId === '10001' && attempt < retries) {
          console.warn(`[eBay] Rate limit for "${keywords}", venter ${attempt * 5}s (forsøk ${attempt}/${retries})`);
          await delay(attempt * 5000);
          continue;
        }
        console.warn(`[eBay] API-feil (ack=${ack}, id=${errorId}) for "${keywords}": ${msg}`);
        return [];
      }

      const totalResults = parseInt(response?.paginationOutput?.[0]?.totalEntries?.[0] ?? '0');
      const items = response?.searchResult?.[0]?.item || [];
      const prices = items
        .map(item => parseFloat(item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.['__value__']))
        .filter(p => !isNaN(p) && p > 0);
      console.log(`[eBay] "${keywords}" → ${totalResults} totalt, ${items.length} hentet, ${prices.length} gyldige priser`);
      return prices;
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[eBay] HTTP-feil ${err.response?.status} for "${keywords}": ${err.message}`);
      return [];
    }
  }
  return [];
}

// Rens settnavn for eBay-søk: fjern em-strek og spesialtegn
function buildSearchBase(cardName, setName) {
  const parts = [cardName];
  if (setName) {
    const cleanSet = setName.replace(/\s*[–—]\s*/g, ' ').replace(/&/g, '').trim();
    parts.push(cleanSet);
  }
  return parts.join(' ');
}

export async function fetchPrices(cardName, setName) {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) throw new Error('EBAY_APP_ID ikke konfigurert');

  const base = buildSearchBase(cardName, setName);

  // Sekvensielle kall for å unngå rate limiting
  const psa10Prices = await searchSoldItems(appId, `${base} PSA 10`);
  await delay(1500);
  const psa9Prices = await searchSoldItems(appId, `${base} PSA 9`);
  await delay(1500);
  // Raw: ekskluder graderte kort via negative keywords
  const rawPrices = await searchSoldItems(appId, `${base} -PSA -BGS -CGC -SGC`);

  return {
    raw_usd: median(rawPrices),
    psa9_usd: median(psa9Prices),
    psa10_usd: median(psa10Prices),
  };
}
