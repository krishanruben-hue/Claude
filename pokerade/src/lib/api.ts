/**
 * API-klient som erstatter localStorage-tilgang.
 * Alle kall går til backend på /api (proxied til localhost:3001).
 */
import type { StoredCard } from './types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getCards(): Promise<StoredCard[]> {
  return request<StoredCard[]>('/cards');
}

export async function addCard(card: StoredCard): Promise<StoredCard> {
  return request<StoredCard>('/cards', { method: 'POST', body: JSON.stringify(card) });
}

export async function updateCard(card: StoredCard): Promise<StoredCard> {
  return request<StoredCard>(`/cards/${card.id}`, { method: 'PUT', body: JSON.stringify(card) });
}

export async function deleteCard(id: string): Promise<void> {
  return request<void>(`/cards/${id}`, { method: 'DELETE' });
}

export async function resetToSeed(): Promise<void> {
  return request<void>('/cards/reset', { method: 'POST' });
}

export async function triggerFinnScrape(): Promise<{ message: string }> {
  return request<{ message: string }>('/scrape/finn', { method: 'POST' });
}

export async function triggerPriceScrape(): Promise<{ message: string }> {
  return request<{ message: string }>('/scrape/prices', { method: 'POST' });
}

export async function getScrapeStatus(): Promise<{
  running: { finn: boolean; prices: boolean };
  lastRun: { finn: Record<string, unknown> | null; prices: Record<string, unknown> | null };
}> {
  return request('/scrape/status');
}
