import React from 'react';
import { fmtNok, fmtPct, deviationColor } from '../utils/format.js';

const FLAG_LABELS = {
  none:       { label: 'Rå',          color: 'text-green-400 border-green-400' },
  graded:     { label: 'Gradert',     color: 'text-pg-accent border-pg-accent' },
  bundle:     { label: 'Samling',     color: 'text-yellow-400 border-yellow-400' },
  irrelevant: { label: 'Irrelevant',  color: 'text-gray-600 border-gray-600' },
};

export default function FinnListings({ listings, cardName }) {
  const none = listings.filter(l => l.flag === 'none');
  const others = listings.filter(l => l.flag !== 'none');

  if (listings.length === 0) {
    return (
      <div className="text-center py-8 text-[10px] tracking-[0.25em] uppercase text-gray-600">
        Ingen annonser lastet
      </div>
    );
  }

  const finnUrl = `https://www.finn.no/bap/forsale/search.html?q=${encodeURIComponent(cardName)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.15em] uppercase text-gray-600">
          {none.length} rå · {listings.length} totalt
        </span>
        <a
          href={finnUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-[0.15em] uppercase text-blue-400 hover:text-white transition-colors"
        >
          Åpne Finn.no ↗
        </a>
      </div>

      <div className="space-y-0 border border-pg-border">
        {[...none, ...others].map((listing, i) => {
          const flagInfo = FLAG_LABELS[listing.flag] || FLAG_LABELS.none;
          const devCls = deviationColor(listing.deviation);
          const isIrrelevant = listing.flag === 'irrelevant';

          return (
            <a
              key={listing.id || i}
              href={listing.url || finnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start justify-between gap-3 px-3 py-2.5 border-b border-pg-border last:border-b-0 hover:bg-pg-card transition-colors ${isIrrelevant ? 'opacity-40' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{listing.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[9px] tracking-[0.15em] uppercase border px-1.5 py-0.5 ${flagInfo.color}`}>
                    {flagInfo.label}
                  </span>
                  {listing.location && (
                    <span className="text-[10px] text-gray-600">{listing.location}</span>
                  )}
                  {listing.views > 0 && (
                    <span className="text-[10px] text-gray-600">{listing.views} vis.</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm text-white">{fmtNok(listing.price_nok)}</div>
                {listing.deviation != null && listing.flag === 'none' && (
                  <div className={`text-[10px] ${devCls}`}>
                    {fmtPct(listing.deviation)} vs raw
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
