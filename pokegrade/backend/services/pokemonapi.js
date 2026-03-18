import axios from 'axios';

// Verifiser RAPIDAPI_HOST fra https://www.pokemon-api.com/docs/ etter innlogging
const RAPIDAPI_HOST = 'pokemon-tcg-api.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

// Pris-mapping:
//   raw_usd   ← TCGPlayer market_price (USD)
//   psa9_usd  ← Cardmarket graded PSA 9 (EUR)
//   psa10_usd ← Cardmarket graded PSA 10 (EUR)
// Merk: raw_usd er USD mens psa-priser er EUR. Juster mapping ved behov.

function makeHeaders(apiKey) {
  return {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };
}

export async function fetchPrices(pokemonApiId) {
  const apiKey = process.env.POKEMON_API_KEY;
  if (!apiKey) throw new Error('POKEMON_API_KEY ikke konfigurert');

  const res = await axios.get(`${BASE_URL}/cards/${pokemonApiId}`, {
    headers: makeHeaders(apiKey),
    timeout: 10000,
  });

  const data = res.data;
  const cm = data.prices?.cardmarket;
  const tcg = data.prices?.tcg_player;
  const psa = cm?.graded?.psa ?? {};

  return {
    raw_usd: parseFloat(tcg?.market_price) || null,
    psa9_usd: parseFloat(psa.psa9) || null,
    psa10_usd: parseFloat(psa.psa10) || null,
  };
}

// Søk etter kort via navn og sett-navn, returner liste av kandidater med id + navn
export async function searchCards(name, setName) {
  const apiKey = process.env.POKEMON_API_KEY;
  if (!apiKey) throw new Error('POKEMON_API_KEY ikke konfigurert');

  const params = new URLSearchParams({ name });
  if (setName) params.set('set', setName);

  const res = await axios.get(`${BASE_URL}/cards?${params.toString()}`, {
    headers: makeHeaders(apiKey),
    timeout: 10000,
  });

  const items = res.data?.data ?? res.data ?? [];
  return Array.isArray(items) ? items.map(c => ({ id: c.id, name: c.name, set: c.set?.name ?? '' })) : [];
}
