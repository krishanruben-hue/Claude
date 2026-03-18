const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API-feil ${res.status}: ${path}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API-feil ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  getCards: () => get('/cards'),
  getCard: (id) => get(`/cards/${id}`),
  refreshPrices: () => post('/admin/refresh-prices'),
  refreshPsa: () => post('/admin/refresh-psa'),
  refreshFinn: () => post('/admin/refresh-finn'),
  refreshFinnCard: (id) => post(`/admin/refresh-finn/${id}`),
};
