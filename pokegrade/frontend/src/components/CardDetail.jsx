import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { fmtNok, fmtUsd, fmtPct, fmtMultiplier, fmtNumber, roiColor } from '../utils/format.js';
import { calculateGradingCost, calculateROI } from '../utils/calculations.js';
import { getCardImageUrlHires } from '../utils/cardImages.js';
import FinnListings from './FinnListings.jsx';
import WatchlistPopover from './WatchlistPopover.jsx';

function MetricBox({ label, value, sub, color }) {
  return (
    <div className="bg-pg-bg p-3 border border-pg-border">
      <div className="text-[9px] tracking-[0.18em] uppercase text-gray-600 mb-1.5">{label}</div>
      <div className={`text-lg font-medium ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-[10px] tracking-[0.3em] uppercase text-gray-600">Laster</div>
      </div>
    );
  }

  if (!card) return null;

  const gradingCost = customGradingCost ?? calculateGradingCost(batchSize);
  const roi = card.raw_usd ? calculateROI(card.psa10_usd, card.raw_usd, gradingCost) : card.roi;
  const roiCls = roiColor(roi);
  const gemPct = card.gem_rate != null ? (card.gem_rate * 100).toFixed(1) : null;
  const popTable = card.psa_population_table || {};
  const hiresUrl = card.image_url
    ? card.image_url.replace(/\.png$/, '_hires.png')
    : getCardImageUrlHires(card.set_name, card.set_number);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-pg-card border border-pg-border w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-pg-border sticky top-0 bg-pg-card z-10">
          <div>
            <h2 className="text-base font-medium tracking-wide text-white">{card.name}</h2>
            <div className="text-[10px] tracking-[0.12em] uppercase text-gray-600 mt-0.5">{card.set_name} · {card.set_number}</div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl leading-none ml-4 transition-colors">×</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Kortbilde + nøkkeltall */}
          <div className="flex gap-5 items-start">
            {/* Kortbilde */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="w-32 overflow-hidden bg-pg-bg">
                {hiresUrl && !imgError ? (
                  <img
                    src={hiresUrl}
                    alt={card.name}
                    className="w-full h-auto"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full aspect-[2.5/3.5] flex items-center justify-center text-2xl bg-pg-bg opacity-20">
                    ▪
                  </div>
                )}
              </div>
              <WatchlistPopover
                cardId={card.id}
                watchlists={watchlists || []}
                onToggle={onToggleWatchlist || (() => {})}
                onCreate={onCreateWatchlist || (() => {})}
              />
              {(watchlists || []).filter(w => w.cardIds.includes(card.id)).length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {(watchlists || []).filter(w => w.cardIds.includes(card.id)).map(w => (
                    <span key={w.id} className="text-[9px] tracking-[0.12em] uppercase text-pg-accent border border-pg-accent px-1.5 py-0.5">
                      {w.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Nøkkeltall */}
            <div className="flex-1 space-y-3">
              {card.low_data_warning && (
                <div className="border border-yellow-400/30 p-3 text-[11px] text-yellow-400">
                  Lavt datagrunnlag — færre enn 50 PSA-graderte. Gem rate og pop-tall er usikre.
                </div>
              )}
              <div className="grid grid-cols-2 gap-px bg-pg-border">
                <MetricBox label="Raw-pris" value={fmtNok(card.raw_nok)} sub={fmtUsd(card.raw_usd)} />
                <MetricBox label="PSA 10-pris" value={fmtNok(card.psa10_nok)} sub={fmtUsd(card.psa10_usd)} />
                <MetricBox label="Multiplier" value={fmtMultiplier(card.multiplier)} color="text-pg-accent" />
                <MetricBox label="Gem rate" value={gemPct != null ? `${gemPct}%` : '–'} color={card.low_data_warning ? 'text-yellow-400' : 'text-white'} />
              </div>
            </div>
          </div>

          {/* Graderingskalkulator */}
          <div className="border border-pg-border p-4">
            <div className="text-[9px] tracking-[0.22em] uppercase text-gray-600 mb-4">Graderingskalkulator</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="text-[9px] tracking-[0.15em] uppercase text-gray-600 block mb-1.5">Batch</label>
                <input
                  type="number"
                  value={batchSize}
                  min={1}
                  onChange={e => { setBatchSize(parseInt(e.target.value) || 1); setCustomGradingCost(null); }}
                  className="w-full bg-pg-bg border border-pg-border px-2 py-1.5 text-sm text-white focus:outline-none focus:border-pg-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[9px] tracking-[0.15em] uppercase text-gray-600 block mb-1.5">Kost/kort (USD)</label>
                <input
                  type="number"
                  value={customGradingCost ?? gradingCost.toFixed(2)}
                  onChange={e => setCustomGradingCost(parseFloat(e.target.value) || null)}
                  className="w-full bg-pg-bg border border-pg-border px-2 py-1.5 text-sm text-white focus:outline-none focus:border-pg-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[9px] tracking-[0.15em] uppercase text-gray-600 block mb-1.5">ROI (PSA 10)</label>
                <div className={`text-xl font-medium pt-1 ${roiCls}`}>{fmtPct(roi)}</div>
              </div>
            </div>
            {card.break_even_grade && (
              <div className="text-[10px] text-gray-600">
                Break-even: <span className="text-white">PSA {card.break_even_grade}</span>
              </div>
            )}
          </div>

          {/* PSA Population */}
          <div>
            <div className="text-[9px] tracking-[0.22em] uppercase text-gray-600 mb-3">
              PSA Pop — {fmtNumber(card.total_pop)} totalt
            </div>
            <div className="grid grid-cols-10 gap-px bg-pg-border">
              {[1,2,3,4,5,6,7,8,9,10].map(g => {
                const count = popTable[g] || 0;
                const maxCount = Math.max(...Object.values(popTable), 1);
                const heightPct = (count / maxCount) * 100;
                return (
                  <div key={g} className="text-center bg-pg-bg py-2">
                    <div className="flex items-end justify-center h-10 mb-1 px-1">
                      <div
                        className={g === 10 ? 'w-full bg-pg-accent' : g >= 8 ? 'w-full bg-pg-accent/50' : 'w-full bg-pg-border'}
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-gray-600">{g}</div>
                    <div className="text-[10px] text-white">{fmtNumber(count)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finn.no */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] tracking-[0.22em] uppercase text-gray-600">Finn.no</div>
              <button
                onClick={handleRefreshFinn}
                disabled={refreshingFinn}
                className="text-[10px] tracking-[0.15em] uppercase text-gray-600 hover:text-white disabled:opacity-30 transition-colors"
              >
                {refreshingFinn ? 'Oppdaterer' : 'Oppdater'}
              </button>
            </div>
            <FinnListings listings={card.finn_listings || []} cardName={card.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
