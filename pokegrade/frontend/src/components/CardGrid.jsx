import React, { useState } from 'react';
import { fmtNok, fmtPct, fmtMultiplier, roiColor } from '../utils/format.js';
import WatchlistPopover from './WatchlistPopover.jsx';

// Grid-view: store kortbilder med nøkkeldata under
export function CardGrid({ cards, onCardClick, watchlists, onToggleWatchlist, onCreateWatchlist }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map(card => (
        <GridCard
          key={card.id}
          card={card}
          onClick={onCardClick}
          watchlists={watchlists}
          onToggleWatchlist={onToggleWatchlist}
          onCreateWatchlist={onCreateWatchlist}
        />
      ))}
    </div>
  );
}

function GridCard({ card, onClick, watchlists, onToggleWatchlist, onCreateWatchlist }) {
  const [imgError, setImgError] = useState(false);
  const roiCls = roiColor(card.roi);

  return (
    <div
      className="bg-pg-card border border-pg-border rounded-xl overflow-hidden hover:border-pg-accent transition-colors cursor-pointer group"
      onClick={() => onClick(card)}
    >
      <div className="aspect-[2.5/3.5] bg-pg-bg relative">
        {card.image_url && !imgError ? (
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎴</div>
        )}
        <div className="absolute top-1 right-1" onClick={e => e.stopPropagation()}>
          <WatchlistPopover
            cardId={card.id}
            watchlists={watchlists}
            onToggle={onToggleWatchlist}
            onCreate={onCreateWatchlist}
          />
        </div>
      </div>
      <div className="p-2">
        <div className="text-xs font-semibold text-white truncate">{card.name}</div>
        <div className="text-xs text-gray-500 truncate mb-1">{card.set_name} #{card.set_number}</div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{fmtNok(card.raw_nok) ?? '–'}</span>
          <span className={`font-semibold ${roiCls}`}>{fmtPct(card.roi) ?? '–'}</span>
        </div>
      </div>
    </div>
  );
}

// Icon-view: kun kortbilder i et tett rutenett
export function CardIconView({ cards, onCardClick }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-2">
      {cards.map(card => (
        <IconCard key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  );
}

function IconCard({ card, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="aspect-[2.5/3.5] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform hover:ring-2 hover:ring-pg-accent"
      onClick={() => onClick(card)}
      title={`${card.name} – ${card.set_name} #${card.set_number}`}
    >
      {card.image_url && !imgError ? (
        <img
          src={card.image_url}
          alt={card.name}
          className="w-full h-full object-contain bg-pg-bg"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-pg-card flex items-center justify-center text-2xl">🎴</div>
      )}
    </div>
  );
}
