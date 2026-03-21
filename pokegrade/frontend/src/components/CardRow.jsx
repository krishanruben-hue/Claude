import React, { useState } from 'react';
import { fmtNok, fmtUsd, fmtPct, fmtMultiplier, fmtNumber, roiColor } from '../utils/format.js';
import { getCardImageUrl } from '../utils/cardImages.js';
import WatchlistPopover from './WatchlistPopover.jsx';

export default function CardRow({ card, onClick, watchlists, onToggleWatchlist, onCreateWatchlist }) {
  const roiCls = roiColor(card.roi);
  const gemPct = card.gem_rate != null ? (card.gem_rate * 100).toFixed(1) : null;
  const imgUrl = card.image_url || getCardImageUrl(card.set_name, card.set_number);
  const [imgError, setImgError] = useState(false);

  return (
    <tr
      className="border-b border-pg-border hover:bg-pg-card cursor-pointer transition-colors"
      onClick={() => onClick(card)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-11 shrink-0 overflow-hidden bg-pg-card flex items-center justify-center">
            {imgUrl && !imgError ? (
              <img
                src={imgUrl}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-base opacity-20">▪</span>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-white tracking-wide">{card.name}</div>
            <div className="text-[10px] tracking-[0.08em] text-gray-600 mt-0.5">{card.set_name} · {card.set_number}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="text-sm text-white">{fmtNok(card.raw_nok)}</div>
        <div className="text-[10px] text-gray-600">{fmtUsd(card.raw_usd)}</div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="text-sm text-white">{fmtNok(card.psa10_nok)}</div>
        <div className="text-[10px] text-gray-600">{fmtUsd(card.psa10_usd)}</div>
      </td>
      <td className="px-3 py-3 text-right text-sm font-medium text-pg-accent">
        {fmtMultiplier(card.multiplier)}
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <div className="flex items-center justify-end gap-1">
          {card.low_data_warning && <span title="Lavt datagrunnlag" className="text-[10px] text-gray-600">!</span>}
          <span className={card.low_data_warning ? 'text-yellow-400' : 'text-white'}>
            {gemPct != null ? `${gemPct}%` : '–'}
          </span>
        </div>
      </td>
      <td className={`px-3 py-3 text-right text-sm font-medium ${roiCls}`}>
        {fmtPct(card.roi)}
      </td>
      <td className="px-3 py-3 text-right text-sm text-gray-400">
        {fmtNumber(card.psa10_pop)}
      </td>
      <td className="px-3 py-3 text-right">
        {card.finn_count > 0 ? (
          <div>
            <div className="text-sm text-blue-400">{card.finn_count}</div>
            <div className="text-[10px] text-gray-600">
              {fmtNok(card.finn_min_nok)} – {fmtNok(card.finn_max_nok)}
            </div>
          </div>
        ) : (
          <span className="text-gray-600">–</span>
        )}
      </td>
      <td className="px-2 py-3">
        <WatchlistPopover
          cardId={card.id}
          watchlists={watchlists}
          onToggle={onToggleWatchlist}
          onCreate={onCreateWatchlist}
        />
      </td>
    </tr>
  );
}
