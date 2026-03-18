import axios from 'axios';

const RAPIDAPI_HOST = 'pokemon-tcg-api.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function makeHeaders(apiKey) {
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': RAPIDAPI_HOST,
  };
}

export async function fetchPrices(pokemonApiId, cardName, eurUsdRate = 1.08) {
  const apiKey = process.env.POKEMON_API_KEY;
  if (!apiKey) throw new Error('POKEMON_API_KEY ikke konfigurert');

  const params = new URLSearchParams({ search: cardName });
  const url = `${BASE_URL}/cards?${params.toString()}`;
  let res;
  try {
    res = await axios.get(url, { headers: makeHeaders(apiKey), timeout: 10000 });
  } catch (err) {
    const status = err.response?.status;
    const body = JSON.stringify(err.response?.data)?.slice(0, 200);
    throw new Error(`HTTP ${status} fra API (${url.slice(0, 80)}): ${body}`);
  }

  const items = res.data?.data ?? res.data ?? [];
  const cards = Array.isArray(items) ? items : [];

  // Finn kortets treff via lagret ID, fallback til første resultat
  const card = cards.find(c => String(c.id) === String(pokemonApiId)) ?? cards[0];
  if (!card) return { raw_usd: null, psa9_usd: null, psa10_usd: null };

  const cm = card?.prices?.cardmarket;
  const tcg = card?.prices?.tcg_player;
  const psa = cm?.graded?.psa ?? {};

  // TCGPlayer-priser er i USD, Cardmarket-priser (PSA) er i EUR → konverter til USD
  const psa9Eur = parseFloat(psa.psa9) || null;
  const psa10Eur = parseFloat(psa.psa10) || null;

  return {
    raw_usd: parseFloat(tcg?.market_price) || null,
    psa9_usd: psa9Eur ? Math.round(psa9Eur * eurUsdRate * 100) / 100 : null,
    psa10_usd: psa10Eur ? Math.round(psa10Eur * eurUsdRate * 100) / 100 : null,
  };
}

export async function searchCards(name, setName, cardNumber) {
  const apiKey = process.env.POKEMON_API_KEY;
  if (!apiKey) throw new Error('POKEMON_API_KEY ikke konfigurert');

  // Bygg søkestreng: navn + kortnummer gir mer presist treff
  const searchQuery = cardNumber ? `${name} ${cardNumber}` : name;
  const params = new URLSearchParams({ search: searchQuery });
  if (setName) params.set('set', setName);

  const res = await axios.get(`${BASE_URL}/cards?${params.toString()}`, {
    headers: makeHeaders(apiKey),
    timeout: 10000,
  });

  const items = res.data?.data ?? res.data ?? [];
  return Array.isArray(items)
    ? items.map(c => ({ id: c.id, name: c.name, set: c.set?.name ?? '' }))
    : [];
}
