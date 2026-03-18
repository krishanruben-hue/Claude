// Pokemon TCG image CDN – offentlig tilgjengelig, ingen API-nokkel noedvendig
// Format: https://images.pokemontcg.io/{setCode}/{number}.png

const SET_CODES = {
  'Prismatic Evolutions': 'sv8pt5',
  'Evolving Skies': 'swsh7',
  'Scarlet & Violet 151': 'sv3pt5',
};

export function getCardImageUrl(setName, setNumber) {
  const code = SET_CODES[setName];
  if (!code || !setNumber) return null;
  return `https://images.pokemontcg.io/${code}/${setNumber}.png`;
}

export function getCardImageUrlHires(setName, setNumber) {
  const code = SET_CODES[setName];
  if (!code || !setNumber) return null;
  return `https://images.pokemontcg.io/${code}/${setNumber}_hires.png`;
}
