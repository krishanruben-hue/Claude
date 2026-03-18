import type { CardMetrics } from '@/lib/types';
import { formatNok, formatPct, formatUsd } from '@/lib/calculations';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  cards: CardMetrics[];
  onCardClick: (id: string) => void;
  sortField: string;
  sortDir: 'asc' | 'desc';
  onSort: (field: string) => void;
}

interface ColDef {
  field: string;
  label: string;
  align?: 'right';
  render: (m: CardMetrics) => React.ReactNode;
}

const COLS: ColDef[] = [
  {
    field: 'name',
    label: 'Kort',
    render: m => (
      <div className="min-w-0">
        <div className="text-xs font-medium text-foreground truncate">{m.card.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{m.card.set} · #{m.card.number}</div>
      </div>
    ),
  },
  {
    field: 'rawNok',
    label: 'Rå kr',
    align: 'right',
    render: m => <span className="text-xs font-mono">{formatNok(m.rawNok)}</span>,
  },
  {
    field: 'psa10Nok',
    label: 'PSA 10',
    align: 'right',
    render: m => (
      <div className="text-right">
        <div className="text-xs font-mono">{formatNok(m.psa10Nok)}</div>
        <div className="text-xs text-muted-foreground font-mono">{formatUsd(m.psa10Usd)}</div>
      </div>
    ),
  },
  {
    field: 'multiplier',
    label: 'Multi',
    align: 'right',
    render: m => <span className="text-xs font-mono">{m.multiplier.toFixed(1)}x</span>,
  },
  {
    field: 'gemRate',
    label: 'Gem%',
    align: 'right',
    render: m => (
      <span className="text-xs font-mono">
        {formatPct(m.gemRate * 100)}
      </span>
    ),
  },
  {
    field: 'roi',
    label: 'ROI',
    align: 'right',
    render: m => (
      <span
        className={`text-xs font-mono font-semibold ${
          m.roi >= 0 ? 'text-positive' : 'text-negative'
        }`}
      >
        {m.roi >= 0 ? '+' : ''}
        {formatPct(m.roi)}
      </span>
    ),
  },
  {
    field: 'psa10Pop',
    label: 'Pop10',
    align: 'right',
    render: m => <span className="text-xs font-mono">{m.psa10Pop.toLocaleString()}</span>,
  },
  {
    field: 'finnListingsCount',
    label: 'Finn',
    align: 'right',
    render: m => <span className="text-xs font-mono text-muted-foreground">{m.finnListingsCount}</span>,
  },
];

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <span className="opacity-20 ml-0.5"><ChevronDown className="h-3 w-3 inline" /></span>;
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 inline ml-0.5 opacity-70" />
    : <ChevronDown className="h-3 w-3 inline ml-0.5 opacity-70" />;
}

export function CardTable({ cards, onCardClick, sortField, sortDir, onSort }: Props) {
  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-border py-10 text-center text-sm text-muted-foreground">
        Ingen kort matcher filteret.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted">
              {COLS.map(col => (
                <th
                  key={col.field}
                  onClick={() => onSort(col.field)}
                  className={`px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.label}
                  <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cards.map((m, i) => (
              <tr
                key={m.card.id}
                onClick={() => onCardClick(m.card.id)}
                className={`cursor-pointer border-b border-border last:border-0 hover:bg-muted transition-colors ${i % 2 === 0 ? '' : 'bg-muted/30'}`}
              >
                {COLS.map(col => (
                  <td key={col.field} className={`px-3 py-2 ${col.align === 'right' ? 'text-right' : ''}`}>
                    {col.render(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 text-xs text-muted-foreground font-mono border-t border-border">
        {cards.length} kort
      </div>
    </div>
  );
}
