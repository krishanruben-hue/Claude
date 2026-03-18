import { useState, useEffect, useCallback } from 'react';
import type { CardMetrics } from '@/lib/types';
import { getCards } from '@/lib/api';
import { computeMetrics } from '@/lib/calculations';

const FALLBACK_FX = 10.7;

async function fetchFxRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return FALLBACK_FX;
    const data = (await res.json()) as { rates?: { NOK?: number } };
    return data.rates?.NOK ?? FALLBACK_FX;
  } catch {
    return FALLBACK_FX;
  }
}

export function useCardData() {
  const [allMetrics, setAllMetrics] = useState<CardMetrics[]>([]);
  const [availableSets, setAvailableSets] = useState<string[]>([]);
  const [fxRate, setFxRate] = useState<number>(FALLBACK_FX);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rate, cards] = await Promise.all([fetchFxRate(), getCards()]);
      setFxRate(rate);
      const metrics = cards.map(c => computeMetrics(c, rate));
      setAllMetrics(metrics);
      const sets = [...new Set(cards.map(c => c.set))].sort();
      setAvailableSets(sets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ukjent feil – er backend-serveren oppe?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    allMetrics,
    availableSets,
    fxRate,
    loading,
    error,
    isEmpty: allMetrics.length === 0,
    refresh: load,
  };
}
