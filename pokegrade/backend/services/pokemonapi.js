import axios from 'axios';

const RAPIDAPI_HOST = 'cardmarket-api-tcg.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function makeHeaders(apiKey) {
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': RAPIDAPI_HOST,
  };
}

export async function fetchPrices(pokemonApiId) {
  const apiKey = process.env.POKEMON_API_KEY;
  if (!apiKey) throw new Error('POKEMON_API_KEY ikke konfigurert');

  const res = await axios.get(`${BASE_URL}/pokemon/cards/${pokemonApiId}`, {
    headers: makeHeaders(apiKey),
    timeout: 10000,
  });

  const data = res.data?.data ?? res.data;
  const cm = data?.prices?.cardmarket;
  const psa = cm?.graded?.psa ?? {};

  return {
    raw_usd: parseFloat(cm?.lowest_near_mint) || null,
    psa9_usd: parseFloat(psa.psa9) || null,
    psa10_usd: parseFloat(psa.psa10) || null,
  };
}

// Søk etter kort via navn og kortnummer, returner liste av kandidater med id + navn
export async function searchCards(name, setName, cardNumber) {
  const apiKey = process.env.POKEMON_API_KEY;
  if (!apiKey) throw new Error('POKEMON_API_KEY ikke konfigurert');

  const params = new URLSearchParams({ name });
  if (cardNumber) params.set('card_number', cardNumber);

  const res = await axios.get(`${BASE_URL}/pokemon/cards/search?${params.toString()}`, {
    headers: makeHeaders(apiKey),
    timeout: 10000,
  });

  const items = res.data?.data ?? [];
  return Array.isArray(items)
    ? items.map(c => ({ id: c.id, name: c.name, set: c.episode?.name ?? '', tcgid: c.tcgid }))
    : [];
}
