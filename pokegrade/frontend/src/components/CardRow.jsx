import React, { useState } from 'react';
import { fmtNok, fmtUsd, fmtPct, fmtMultiplier, fmtNumber, roiColor } from '../utils/format.js';
import { getCardImageUrl } from '../utils/cardImages.js';

export default function CardRow({ card, onClick }) {
  const roiCls = roiColor(card.roi);
  const gemPct = card.gem_rate != null ? (card.gem_rate * 100).toFixed(1) : null;
  const imgUrl = getCardImageUrl(card.set_name, card.set_number);
  const [imgError, setImgError] = useState(false);

  return (
    <tr
      className="border-b border-pg-border hover:bg-pg-card/60 cursor-pointer transition-colors"
      onClick={() => onClick(card)}
    >
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-pg-border flex items-center justify-center">
            {imgUrl && !imgError ? (
              <img
                src={imgUrl}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-lg">🎴</span>
            )}
          </div>
          <div>
            <div className="font-medium text-white">{card.name}</div>
            <div className="text-xs text-gray-500">{card.set_name} #{card.set_number}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="text-sm text-white">{fmtNok(card.raw_nok)}</div>
        <div className="text-xs text-gray-500">{fmtUsd(card.raw_usd)}</div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="text-sm text-white">{fmtNok(card.psa10_nok)}</div>
        <div className="text-xs text-gray-500">{fmtUsd(card.psa10_usd)}</div>
      </td>
      <td className="px-3 py-3 text-right text-sm font-semibold text-violet-300">
        {fmtMultiplier(card.multiplier)}
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <div className="flex items-center justify-end gap-1">
          {card.low_data_warning && <span title="Lavt datagrunnlag (under 50 graderte)">⚠️</span>}
          <span className={card.low_data_warning ? 'text-yellow-400' : 'text-white'}>
            {gemPct != null ? `${gemPct}%` : '–'}
          </span>
        </div>
      </td>
      <td className={`px-3 py-3 text-right text-sm font-semibold ${roiCls}`}>
        {fmtPct(card.roi)}
      </td>
      <td className="px-3 py-3 text-right text-sm text-gray-300">
        {fmtNumber(card.psa10_pop)}
      </td>
      <td className="px-3 py-3 text-right">
        {card.finn_count > 0 ? (
          <div>
            <div className="text-sm text-blue-400">{card.finn_count} annonser</div>
            <div className="text-xs text-gray-500">
              {fmtNok(card.finn_min_nok)} – {fmtNok(card.finn_max_nok)}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-600">–</span>
        )}
      </td>
    </tr>
  );
}
