import axios from 'axios';

const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const BROWSE_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
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

async function searchListings(token, keywords) {
  try {
    const res = await axios.get(BROWSE_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        q: keywords,
        category_ids: POKEMON_CATEGORY_ID,
        filter: 'buyingOptions:{FIXED_PRICE}',
        sort: 'price',
        limit: 50,
      },
      timeout: 10000,
    });

    const items = res.data?.itemSummaries || [];
    return items
      .map(item => parseFloat(item.price?.convertedFromValue || item.price?.value))
      .filter(p => !isNaN(p) && p > 0);
  } catch (err) {
    const status = err.response?.status;
    console.warn(`[eBay] HTTP ${status} for "${keywords}": ${JSON.stringify(err.response?.data)}`);
    return [];
  }
}

export async function fetchPrices(cardName) {
  const token = await getAccessToken();

  const [psa10Prices, psa9Prices] = await Promise.all([
    searchListings(token, `${cardName} PSA 10`),
    searchListings(token, `${cardName} PSA 9`),
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
