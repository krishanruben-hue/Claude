import React, { useState } from 'react';
import CardRow from './CardRow.jsx';

const COLS = [
  { key: 'name', label: 'Kort', align: 'left' },
  { key: 'raw_nok', label: 'Raw-pris', align: 'right' },
  { key: 'psa10_nok', label: 'PSA 10-pris', align: 'right' },
  { key: 'multiplier', label: 'Multiplier', align: 'right' },
  { key: 'gem_rate', label: 'Gem rate', align: 'right' },
  { key: 'roi', label: 'ROI (PSA10)', align: 'right' },
  { key: 'psa10_pop', label: 'PSA10 pop', align: 'right' },
  { key: 'finn_count', label: 'Finn.no', align: 'right' },
];

export default function CardList({ cards, onCardClick, watchlists, onToggleWatchlist, onCreateWatchlist }) {
  const [sort, setSort] = useState({ key: 'roi', dir: 'desc' });

  function toggleSort(key) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' }
    );
  }

  const sorted = [...cards].sort((a, b) => {
    let av = a[sort.key] ?? -Infinity;
    let bv = b[sort.key] ?? -Infinity;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sort.dir === 'asc' ? -1 : 1;
    if (av > bv) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-pg-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-pg-card border-b border-pg-border">
            {COLS.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-white transition-colors ${col.align === 'right' ? 'text-right' : 'text-left'} ${sort.key === col.key ? 'text-pg-accent' : ''}`}
              >
                {col.label}
                {sort.key === col.key && (
                  <span className="ml-1">{sort.dir === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
            ))}
            <th className="px-2 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="bg-pg-bg">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                Ingen kort matcher aktive filtre
              </td>
            </tr>
          ) : (
            sorted.map(card => (
              <CardRow
                key={card.id}
                card={card}
                onClick={onCardClick}
                watchlists={watchlists}
                onToggleWatchlist={onToggleWatchlist}
                onCreateWatchlist={onCreateWatchlist}
              />
            ))
          )}
        </tbody>
      </table>
      <div className="bg-pg-card px-4 py-2 text-xs text-gray-500 border-t border-pg-border">
        {sorted.length} av {cards.length} kort vises
      </div>
    </div>
  );
}
