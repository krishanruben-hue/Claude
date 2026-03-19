const BASE = '/api';

async function handleError(res, path) {
  let detail = '';
  try {
    const body = await res.json();
    if (body?.error) detail = `: ${body.error}`;
  } catch {}
  throw new Error(`API-feil ${res.status}: ${path}${detail}`);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) await handleError(res, path);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) await handleError(res, path);
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
  autoLinkCards: () => post('/admin/auto-link-cards'),
  getLinkProgress: () => get('/admin/link-progress'),
  refreshPrices: (setId) => post('/admin/refresh-prices', setId ? { set_id: setId } : undefined),
  getPriceProgress: () => get('/admin/refresh-prices-progress'),
  stopPriceRefresh: () => post('/admin/refresh-prices-stop'),
  refreshPsa: () => post('/admin/refresh-psa'),
  refreshFinn: () => post('/admin/refresh-finn'),
  refreshFinnCard: (id) => post(`/admin/refresh-finn/${id}`),
};
