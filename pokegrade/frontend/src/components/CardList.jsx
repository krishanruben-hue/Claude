import React from 'react';
import CardRow from './CardRow.jsx';

const COLS = [
  { key: 'name', label: 'Kort', align: 'left' },
  { key: 'set_number', label: '#', align: 'right' },
  { key: 'raw_nok', label: 'Raw-pris', align: 'right' },
  { key: 'psa10_nok', label: 'PSA 10-pris', align: 'right' },
  { key: 'multiplier', label: 'Multiplier', align: 'right' },
  { key: 'gem_rate', label: 'Gem rate', align: 'right' },
  { key: 'roi', label: 'ROI (PSA10)', align: 'right' },
  { key: 'psa10_pop', label: 'PSA10 pop', align: 'right' },
  { key: 'finn_count', label: 'Finn.no', align: 'right' },
];

export default function CardList({ cards, sort, onSortChange, onCardClick, watchlists, onToggleWatchlist, onCreateWatchlist }) {
  function toggleSort(key) {
    onSortChange(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' }
    );
  }

  return (
    <div className="overflow-x-auto border border-pg-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-pg-card border-b border-pg-border">
            {COLS.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`px-3 py-3 text-[9px] font-medium tracking-[0.2em] text-gray-600 uppercase cursor-pointer select-none hover:text-white transition-colors ${col.align === 'right' ? 'text-right' : 'text-left'} ${sort?.key === col.key ? 'text-pg-accent' : ''}`}
              >
                {col.label}
                {sort?.key === col.key && (
                  <span className="ml-1 opacity-60">{sort.dir === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
            ))}
            <th className="px-2 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="bg-pg-bg">
          {cards.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-16 text-center text-[10px] tracking-[0.25em] uppercase text-gray-600">
                Ingen kort matcher filtrene
              </td>
            </tr>
          ) : (
            cards.map(card => (
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
      <div className="bg-pg-card px-4 py-2 text-[9px] tracking-[0.15em] uppercase text-gray-600 border-t border-pg-border">
        {cards.length} kort
      </div>
    </div>
  );
}
