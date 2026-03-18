import { useState, useMemo } from 'react';
import type { CardMetrics } from '@/lib/types';
import { formatNok, formatPct } from '@/lib/calculations';
import { Calculator } from 'lucide-react';

interface Props {
  cards: CardMetrics[];
}

interface SimCard {
  metrics: CardMetrics;
  quantity: number;
}

const GRADING_FEE = 400;

export function BudgetSimulator({ cards }: Props) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState<number>(10000);
  const [selections, setSelections] = useState<SimCard[]>([]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      cards
        .filter(c => c.card.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 20),
    [cards, search],
  );

  const totalInvested = useMemo(
    () =>
      selections.reduce(
        (sum, s) => sum + (s.metrics.rawNok + GRADING_FEE) * s.quantity,
        0,
      ),
    [selections],
  );

  const totalExpected = useMemo(
    () =>
      selections.reduce(
        (sum, s) => sum + s.metrics.psa10Nok * s.metrics.gemRate * s.quantity,
        0,
      ),
    [selections],
  );

  const totalRoi = totalInvested > 0 ? ((totalExpected - totalInvested) / totalInvested) * 100 : 0;

  const addCard = (m: CardMetrics) => {
    setSelections(prev => {
      const ex = prev.find(s => s.metrics.card.id === m.card.id);
      if (ex) return prev.map(s => s.metrics.card.id === m.card.id ? { ...s, quantity: s.quantity + 1 } : s);
      return [...prev, { metrics: m, quantity: 1 }];
    });
  };

  const removeCard = (id: string) =>
    setSelections(prev => prev.filter(s => s.metrics.card.id !== id));

  const changeQty = (id: string, qty: number) => {
    if (qty <= 0) { removeCard(id); return; }
    setSelections(prev => prev.map(s => s.metrics.card.id === id ? { ...s, quantity: qty } : s));
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full justify-center rounded-lg border border-border border-dashed py-3 text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        <Calculator className="h-3.5 w-3.5" />
        Budsjett-simulator
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2.5 bg-muted border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Budsjett-simulator</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Lukk
        </button>
      </div>

      <div className="p-4 grid gap-4 sm:grid-cols-2">
        {/* Left: card picker */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-mono">Budsjett (kr)</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="ml-auto w-32 rounded border border-border bg-background px-2 py-1 text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk kort..."
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-border"
          />
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {filtered.map(m => (
              <button
                key={m.card.id}
                onClick={() => addCard(m)}
                className="w-full flex items-center justify-between rounded px-2 py-1.5 text-left hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <span className="text-xs truncate">{m.card.name}</span>
                <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">{formatNok(m.rawNok)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: selection & summary */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Valgte kort</div>
          {selections.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Ingen kort valgt</p>
          ) : (
            <div className="space-y-1.5">
              {selections.map(s => (
                <div key={s.metrics.card.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate">{s.metrics.card.name}</span>
                  <input
                    type="number"
                    min={0}
                    value={s.quantity}
                    onChange={e => changeQty(s.metrics.card.id, Number(e.target.value))}
                    className="w-12 rounded border border-border bg-background px-1.5 py-0.5 text-center font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => removeCard(s.metrics.card.id)}
                    className="text-muted-foreground hover:text-negative transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="rounded border border-border bg-muted p-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investert</span>
              <span className={totalInvested > budget ? 'text-negative' : ''}>{formatNok(totalInvested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budsjett</span>
              <span>{formatNok(budget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rest</span>
              <span className={budget - totalInvested < 0 ? 'text-negative' : 'text-positive'}>
                {formatNok(budget - totalInvested)}
              </span>
            </div>
            <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between">
              <span className="text-muted-foreground">Forventet verdi</span>
              <span>{formatNok(totalExpected)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">ROI</span>
              <span className={totalRoi >= 0 ? 'text-positive' : 'text-negative'}>
                {totalRoi >= 0 ? '+' : ''}{formatPct(totalRoi)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
