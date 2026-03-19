import axios from 'axios';

const BASE_URL = 'https://api.pokemontcg.io/v2';

function makeHeaders() {
  const key = process.env.PTCG_API_KEY;
  return key ? { 'X-Api-Key': key } : {};
}

// Henter RAW-pris fra TCGPlayer via pokemontcg.io
export async function fetchPrices(pokemonApiId) {
  if (!pokemonApiId) return { raw_usd: null, psa9_usd: null, psa10_usd: null };

  // Numeriske IDer er ugyldige for pokemontcg.io (skal være f.eks. "sv3pt5-1")
  if (/^\d+$/.test(String(pokemonApiId))) {
    throw new Error(`Ugyldig pokemon_api_id "${pokemonApiId}" – er et rent tall, ikke en TCG-ID`);
  }

  let res;
  try {
    res = await axios.get(`${BASE_URL}/cards/${pokemonApiId}`, {
      headers: makeHeaders(),
      timeout: 10000,
    });
  } catch (err) {
    const status = err.response?.status;
    const detail = status ? `HTTP ${status}` : (err.code ?? err.message);
    throw new Error(`${detail} fra pokemontcg.io for ID "${pokemonApiId}"`);
  }

  const prices = res.data?.data?.tcgplayer?.prices ?? {};

  // Prøv pristyper i rekkefølge – sjeldne kort er nesten alltid holofoil
  const market =
    prices.holofoil?.market ??
    prices.normal?.market ??
    prices.reverseHolofoil?.market ??
    prices['1stEditionHolofoil']?.market ??
    null;

  return {
    raw_usd: market ? Math.round(market * 100) / 100 : null,
    psa9_usd: null,  // hentes av 130point-scraperen
    psa10_usd: null, // hentes av 130point-scraperen
  };
}

// Søker etter kort i pokemontcg.io – brukes av autoLinkCardIds
export async function searchCards(name, setName) {
  let q = `name:"${name}"`;
  if (setName) q += ` set.name:"${setName}"`;

  const res = await axios.get(`${BASE_URL}/cards`, {
    headers: makeHeaders(),
    params: { q, pageSize: 10 },
    timeout: 10000,
  });

  const items = res.data?.data ?? [];
  return items.map(c => ({ id: c.id, name: c.name, set: c.set?.name ?? '' }));
}
