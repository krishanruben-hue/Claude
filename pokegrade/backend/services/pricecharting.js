import axios from 'axios';

const BASE_URL = 'https://www.pricecharting.com/api/product';

export async function fetchPrices(pricechartingId) {
  const apiKey = process.env.PRICECHARTING_API_KEY;
  if (!apiKey) throw new Error('PRICECHARTING_API_KEY ikke konfigurert');

  const res = await axios.get(BASE_URL, {
    params: { id: pricechartingId, key: apiKey },
    timeout: 10000,
  });

  const data = res.data;
  return {
    raw_usd: parseFloat(data['price']) || null,
    psa9_usd: parseFloat(data['graded-price-90']) || null,
    psa10_usd: parseFloat(data['graded-price-100']) || null,
    // Alle graded-prices for break-even beregning
    graded: {
      1: parseFloat(data['graded-price-10']) || null,
      2: parseFloat(data['graded-price-20']) || null,
      3: parseFloat(data['graded-price-30']) || null,
      4: parseFloat(data['graded-price-40']) || null,
      5: parseFloat(data['graded-price-50']) || null,
      6: parseFloat(data['graded-price-60']) || null,
      7: parseFloat(data['graded-price-70']) || null,
      8: parseFloat(data['graded-price-80']) || null,
      9: parseFloat(data['graded-price-90']) || null,
      10: parseFloat(data['graded-price-100']) || null,
    },
  };
}
