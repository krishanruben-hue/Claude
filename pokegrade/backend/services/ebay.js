import axios from 'axios';

const FINDING_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';
const POKEMON_CATEGORY_ID = '183454'; // Pokémon Trading Card Game singles

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function searchSoldItems(appId, keywords) {
  const params = {
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'keywords': keywords,
    'categoryId': POKEMON_CATEGORY_ID,
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'sortOrder': 'EndTimeSoonest',
    'paginationInput.entriesPerPage': '50',
  };

  try {
    const res = await axios.get(FINDING_API_URL, { params, timeout: 10000 });
    const ack = res.data?.findCompletedItemsResponse?.[0]?.ack?.[0];
    if (ack === 'Failure') {
      const errMsg = res.data?.findCompletedItemsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0];
      console.warn(`[eBay] API-feil for "${keywords}": ${errMsg}`);
      return [];
    }
    const items =
      res.data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
    return items
      .map(item => parseFloat(item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.['__value__']))
      .filter(p => !isNaN(p) && p > 0);
  } catch (err) {
    const status = err.response?.status;
    const body = err.response?.data;
    console.warn(`[eBay] HTTP ${status} for "${keywords}": ${body}`);
    return [];
  }
}

export async function fetchPrices(cardName) {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) throw new Error('EBAY_APP_ID ikke konfigurert');

  const [psa10Prices, psa9Prices] = await Promise.all([
    searchSoldItems(appId, `${cardName} PSA 10`),
    searchSoldItems(appId, `${cardName} PSA 9`),
  ]);

  const psa10 = median(psa10Prices);
  const psa9 = median(psa9Prices);

  return {
    raw_usd: null,
    psa9_usd: psa9,
    psa10_usd: psa10,
    graded: {
      9: psa9,
      10: psa10,
    },
  };
}
