import React from 'react';
import { fmtNok, fmtPct, deviationColor } from '../utils/format.js';

const FLAG_LABELS = {
  none: { label: 'Enkelt kort', color: 'bg-green-900/50 text-green-400' },
  bundle: { label: 'Samling/Lot', color: 'bg-yellow-900/50 text-yellow-400' },
  irrelevant: { label: 'Irrelevant', color: 'bg-gray-800 text-gray-500' },
};

export default function FinnListings({ listings, cardName }) {
  const none = listings.filter(l => l.flag === 'none');
  const others = listings.filter(l => l.flag !== 'none');

  if (listings.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        Ingen Finn.no-annonser lastet enda
      </div>
    );
  }

  const finnUrl = `https://www.finn.no/bap/forsale/search.html?q=${encodeURIComponent(cardName)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{none.length} relevante annonser</span>
        <a
          href={finnUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Aapne Finn.no-sok ↗
        </a>
      </div>

      <div className="space-y-2">
        {[...none, ...others].map((listing, i) => {
          const flagInfo = FLAG_LABELS[listing.flag] || FLAG_LABELS.none;
          const devCls = deviationColor(listing.deviation);

          return (
            <div
              key={listing.id || i}
              className="flex items-start justify-between gap-3 p-3 bg-pg-bg rounded-lg border border-pg-border"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{listing.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${flagInfo.color}`}>
                    {flagInfo.label}
                  </span>
                  {listing.location && (
                    <span className="text-xs text-gray-500">{listing.location}</span>
                  )}
                  {listing.views > 0 && (
                    <span className="text-xs text-gray-600">{listing.views} visninger</span>
                  )}
                  {listing.listing_type && (
                    <span className="text-xs text-gray-600">{listing.listing_type}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-white">{fmtNok(listing.price_nok)}</div>
                {listing.deviation != null && listing.flag === 'none' && (
                  <div className={`text-xs ${devCls}`}>
                    {fmtPct(listing.deviation)} vs Pricecharting
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
