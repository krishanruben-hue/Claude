import axios from 'axios';

const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const FINDING_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';
const POKEMON_CATEGORY_ID = '183454';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;
  if (!appId || !certId) throw new Error('EBAY_APP_ID eller EBAY_CERT_ID ikke konfigurert');

  const credentials = Buffer.from(`${appId}:${certId}`).toString('base64');
  const res = await axios.post(
    TOKEN_URL,
    'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return cachedToken;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function searchSoldItems(token, appId, keywords) {
  try {
    const res = await axios.get(FINDING_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-SOA-GLOBAL-ID': 'EBAY-US',
      },
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
    if (ack === 'Failure') {
      const msg = res.data?.findCompletedItemsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0];
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

export async function fetchPrices(cardName) {
  const appId = process.env.EBAY_APP_ID;
  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    console.warn(`[eBay] Token-feil for "${cardName}": ${err.message}`);
    return { raw_usd: null, psa9_usd: null, psa10_usd: null, graded: {} };
  }

  const [psa10Prices, psa9Prices] = await Promise.all([
    searchSoldItems(token, appId, `${cardName} PSA 10`),
    searchSoldItems(token, appId, `${cardName} PSA 9`),
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
