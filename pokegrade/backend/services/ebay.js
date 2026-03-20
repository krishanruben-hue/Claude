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
      });

      const ack = res.data?.findCompletedItemsResponse?.[0]?.ack?.[0];
      if (ack !== 'Success' && ack !== 'Warning') {
        const errorId = res.data?.findCompletedItemsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.errorId?.[0];
        const msg = res.data?.findCompletedItemsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0];
        if (errorId === '10001' && attempt < retries) {
          console.warn(`[eBay] Rate limit for "${keywords}", venter ${attempt * 5}s (forsøk ${attempt}/${retries})`);
          await delay(attempt * 5000);
          continue;
        }
        console.warn(`[eBay] API-feil for "${keywords}": ${msg}`);
        return [];
      }

      const items = res.data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
      return items
        .map(item => parseFloat(item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.['__value__']))
        .filter(p => !isNaN(p) && p > 0);
    } catch (err) {
      console.warn(`[eBay] HTTP ${err.response?.status} for "${keywords}": ${JSON.stringify(err.response?.data)}`);
      return [];
    }
  }
  return [];
}

export async function fetchPrices(cardName) {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) throw new Error('EBAY_APP_ID ikke konfigurert');

  // Sekvensielle kall for å unngå rate limiting
  const psa10Prices = await searchSoldItems(appId, `${cardName} PSA 10`);
  await delay(1500);
  const psa9Prices = await searchSoldItems(appId, `${cardName} PSA 9`);

  return {
    raw_usd: null,
    psa9_usd: median(psa9Prices),
    psa10_usd: median(psa10Prices),
  };
}
