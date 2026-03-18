import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { fmtNok, fmtUsd, fmtPct, fmtMultiplier, fmtNumber, roiColor } from '../utils/format.js';
import { calculateGradingCost, calculateROI } from '../utils/calculations.js';
import { getCardImageUrlHires } from '../utils/cardImages.js';
import FinnListings from './FinnListings.jsx';
import WatchlistPopover from './WatchlistPopover.jsx';

function MetricBox({ label, value, sub, color }) {
  return (
    <div className="bg-pg-bg rounded-lg p-3 border border-pg-border">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function CardDetail({ cardId, onClose, watchlists, onToggleWatchlist, onCreateWatchlist }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [batchSize, setBatchSize] = useState(10);
  const [customGradingCost, setCustomGradingCost] = useState(null);
  const [refreshingFinn, setRefreshingFinn] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    api.getCard(cardId)
      .then(data => { setCard(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cardId]);

  async function handleRefreshFinn() {
    setRefreshingFinn(true);
    try {
      await api.refreshFinnCard(cardId);
      const updated = await api.getCard(cardId);
      setCard(updated);
    } finally {
      setRefreshingFinn(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="text-white">Laster...</div>
      </div>
    );
  }

  if (!card) return null;

  const gradingCost = customGradingCost ?? calculateGradingCost(batchSize);
  const roi = card.raw_usd ? calculateROI(card.psa10_usd, card.raw_usd, gradingCost) : card.roi;
  const roiCls = roiColor(roi);
  const gemPct = card.gem_rate != null ? (card.gem_rate * 100).toFixed(1) : null;
  const popTable = card.psa_population_table || {};
  const hiresUrl = getCardImageUrlHires(card.set_name, card.set_number);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-pg-card border border-pg-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-pg-border sticky top-0 bg-pg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-white">{card.name}</h2>
            <div className="text-sm text-gray-400">{card.set_name} #{card.set_number}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none ml-4">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Kortbilde + nøkkeltall side ved side */}
          <div className="flex gap-5 items-start">
            {/* Kortbilde + watchlist */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="w-36 rounded-xl overflow-hidden bg-pg-border shadow-lg">
              {hiresUrl && !imgError ? (
                <img
                  src={hiresUrl}
                  alt={card.name}
                  className="w-full h-auto"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full aspect-[2.5/3.5] flex items-center justify-center text-4xl bg-pg-bg rounded-xl">
                  🎴
                </div>
              )}
              </div>
              {/* Watchlist-knapp under bildet */}
              <WatchlistPopover
                cardId={card.id}
                watchlists={watchlists || []}
                onToggle={onToggleWatchlist || (() => {})}
                onCreate={onCreateWatchlist || (() => {})}
              />
              {(watchlists || []).filter(w => w.cardIds.includes(card.id)).length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {(watchlists || []).filter(w => w.cardIds.includes(card.id)).map(w => (
                    <span key={w.id} className="text-xs bg-pg-accent/20 text-pg-accent px-2 py-0.5 rounded-full border border-pg-accent/30">
                      {w.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Nøkkeltall + advarsel */}
            <div className="flex-1 space-y-3">
              {card.low_data_warning && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-sm text-yellow-300">
                  ⚠️ <strong>Lavt datagrunnlag:</strong> Færre enn 50 eksemplarer er gradert av PSA.
                  Gem rate og pop-tall bør tolkes med forsiktighet.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Raw-pris" value={fmtNok(card.raw_nok)} sub={fmtUsd(card.raw_usd)} />
                <MetricBox label="PSA 10-pris" value={fmtNok(card.psa10_nok)} sub={fmtUsd(card.psa10_usd)} />
                <MetricBox label="Multiplier" value={fmtMultiplier(card.multiplier)} color="text-violet-300" />
                <MetricBox label="Gem rate" value={gemPct != null ? `${gemPct}%` : '–'} color={card.low_data_warning ? 'text-yellow-400' : 'text-white'} />
              </div>
            </div>
          </div>

          {/* Graderingskost-kalkulator */}
          <div className="bg-pg-bg border border-pg-border rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3">Graderingskalkulator</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Batch-størrelse</label>
                <input
                  type="number"
                  value={batchSize}
                  min={1}
                  onChange={e => { setBatchSize(parseInt(e.target.value) || 1); setCustomGradingCost(null); }}
                  className="w-full bg-pg-card border border-pg-border rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-pg-accent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Graderingskost/kort (USD)</label>
                <input
                  type="number"
                  value={customGradingCost ?? gradingCost.toFixed(2)}
                  onChange={e => setCustomGradingCost(parseFloat(e.target.value) || null)}
                  className="w-full bg-pg-card border border-pg-border rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-pg-accent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">ROI (PSA 10)</label>
                <div className={`text-xl font-bold pt-1 ${roiCls}`}>{fmtPct(roi)}</div>
              </div>
            </div>
            {card.break_even_grade && (
              <div className="text-sm text-gray-400">
                Break-even grade: <span className="text-white font-semibold">PSA {card.break_even_grade}</span>
                <span className="text-gray-500 ml-2 text-xs">(laveste grade med positiv ROI)</span>
              </div>
            )}
          </div>

          {/* PSA Population tabell */}
          <div>
            <div className="text-sm font-semibold text-gray-300 mb-2">
              PSA Population — totalt {fmtNumber(card.total_pop)} graderte
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(g => {
                const count = popTable[g] || 0;
                const maxCount = Math.max(...Object.values(popTable), 1);
                const heightPct = (count / maxCount) * 100;
                return (
                  <div key={g} className="text-center">
                    <div className="flex items-end justify-center h-12 mb-1">
                      <div
                        className={`w-full rounded-t ${g === 10 ? 'bg-violet-500' : g >= 8 ? 'bg-blue-500' : 'bg-gray-600'}`}
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{g}</div>
                    <div className="text-xs text-white font-medium">{fmtNumber(count)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finn.no annonser */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-300">Finn.no-annonser</div>
              <button
                onClick={handleRefreshFinn}
                disabled={refreshingFinn}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors"
              >
                {refreshingFinn ? 'Oppdaterer...' : 'Oppdater annonser'}
              </button>
            </div>
            <FinnListings listings={card.finn_listings || []} cardName={card.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
