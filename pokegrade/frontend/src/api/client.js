const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API-feil ${res.status}: ${path}`);
  }
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API-feil ${res.status}: ${path}`);
  }
  return res.json();
}

export const api = {
  getSets: () => get('/cards/sets'),
  getCards: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page)     qs.set('page',     params.page);
    if (params.limit)    qs.set('limit',    params.limit);
    if (params.q)        qs.set('q',        params.q);
    if (params.set)      qs.set('set',      params.set);
    if (params.rarity)   qs.set('rarity',   params.rarity);
    if (params.sort_by)  qs.set('sort_by',  params.sort_by);
    if (params.sort_dir) qs.set('sort_dir', params.sort_dir);
    const q = qs.toString();
    return get(`/cards${q ? `?${q}` : ''}`);
  },
  getCard: (id) => get(`/cards/${id}`),
  refreshPrices: (setId) => post(`/admin/refresh-prices${setId ? `?set=${encodeURIComponent(setId)}` : ''}`),
  refreshPsa: () => post('/admin/refresh-psa'),
  refreshFinn: () => post('/admin/refresh-finn'),
  refreshFinnCard: (id) => post(`/admin/refresh-finn/${id}`),
};
