import React, { useState, useEffect, useMemo } from 'react';
import { api } from './api/client.js';
import CardList from './components/CardList.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import CardDetail from './components/CardDetail.jsx';
import BudgetSimulator from './components/BudgetSimulator.jsx';
import WatchlistManager from './components/WatchlistManager.jsx';
import { useWatchlists } from './hooks/useWatchlists.js';

const INITIAL_FILTERS = {
  gem_rate: null,
  multiplier: null,
  roi: null,
  psa10_pop: null,
  raw_nok: null,
  total_pop: null,
  finn_deviation: null,
  search: null,
  set: null,
  watchlist: null,
};

function applyFilters(cards, filters) {
  return cards.filter(card => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${card.name} ${card.set_name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.set && card.set_name !== filters.set) return false;
    if (filters.watchlist && !filters.watchlist.cardIds.includes(card.id)) return false;
    if (filters.gem_rate != null && (card.gem_rate ?? -Infinity) < filters.gem_rate) return false;
    if (filters.multiplier != null && (card.multiplier ?? -Infinity) < filters.multiplier) return false;
    if (filters.roi != null && (card.roi ?? -Infinity) < filters.roi) return false;
    if (filters.psa10_pop != null && (card.psa10_pop ?? Infinity) > filters.psa10_pop) return false;
    if (filters.raw_nok != null && (card.raw_nok ?? Infinity) > filters.raw_nok) return false;
    if (filters.total_pop != null && (card.total_pop ?? -Infinity) < filters.total_pop) return false;
    return true;
  });
}

export default function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showBudget, setShowBudget] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [fxRate, setFxRate] = useState(null);

  const {
    watchlists,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    toggleCardInWatchlist,
  } = useWatchlists();

  useEffect(() => {
    api.getCards()
      .then(res => {
        setCards(res.cards || []);
        setIsMock(res.mock);
        setFxRate(res.fx_rate);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  const allSets = useMemo(() => [...new Set(cards.map(c => c.set_name))].sort(), [cards]);
  const filtered = useMemo(() => applyFilters(cards, filters), [cards, filters]);
  const activeFilterCount = Object.values(filters).filter(v => v != null).length;

  async function adminAction(action, label) {
    setAdminStatus(`${label}...`);
    try {
      const res = await action();
      setAdminStatus(res.mock ? 'Mock-modus aktiv' : `Ferdig: ${res.refreshed} oppdatert`);
      if (!res.mock) {
        const updated = await api.getCards();
        setCards(updated.cards || []);
      }
    } catch (err) {
      setAdminStatus(`Feil: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-pg-bg text-gray-100">
      {/* Header */}
      <header className="border-b border-pg-border bg-pg-card sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎴</span>
            <span className="text-lg font-bold text-white tracking-tight">PokeGrade</span>
            {isMock && (
              <span className="text-xs bg-yellow-900/60 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-700/40">
                Demo-data
              </span>
            )}
            {fxRate && (
              <span className="text-xs text-gray-500 hidden sm:block">
                1 USD = {fxRate.toFixed(2)} NOK
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWatchlistManager(true)}
              className="text-sm px-3 py-1.5 rounded-lg border border-pg-border hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
            >
              ★ Watchlister {watchlists.length > 0 && <span className="ml-1 text-pg-accent">{watchlists.length}</span>}
            </button>
            <button
              onClick={() => setShowBudget(true)}
              className="text-sm px-3 py-1.5 rounded-lg border border-pg-border hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
            >
              Budsjett
            </button>
            <button
              onClick={() => setShowAdmin(prev => !prev)}
              className="text-sm px-3 py-1.5 rounded-lg border border-pg-border hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
            >
              ⚙ Admin
            </button>
          </div>
        </div>

        {/* Admin-panel */}
        {showAdmin && (
          <div className="border-t border-pg-border bg-pg-bg px-4 py-3">
            <div className="max-w-screen-xl mx-auto flex items-center gap-3 flex-wrap">
              <button
                onClick={() => adminAction(api.refreshPrices, 'Oppdaterer Pricecharting')}
                className="text-sm px-3 py-1.5 bg-pg-card border border-pg-border rounded-lg hover:border-pg-accent text-gray-300 hover:text-white transition-colors"
              >
                Oppdater priser
              </button>
              <button
                onClick={() => adminAction(api.refreshPsa, 'Scraper PSA Pop Report')}
                className="text-sm px-3 py-1.5 bg-pg-card border border-pg-border rounded-lg hover:border-pg-accent text-gray-300 hover:text-white transition-colors"
              >
                Oppdater PSA pop
              </button>
              <button
                onClick={() => adminAction(api.refreshFinn, 'Scraper Finn.no')}
                className="text-sm px-3 py-1.5 bg-pg-card border border-pg-border rounded-lg hover:border-pg-accent text-gray-300 hover:text-white transition-colors"
              >
                Oppdater Finn
              </button>
              {adminStatus && (
                <span className="text-sm text-gray-400">{adminStatus}</span>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Watchlist-filterlinje */}
      {watchlists.length > 0 && (
        <div className="border-b border-pg-border bg-pg-card/50 px-4 py-2">
          <div className="max-w-screen-xl mx-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Watchliste:</span>
            <button
              onClick={() => handleFilterChange('watchlist', null)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${!filters.watchlist ? 'border-pg-accent bg-pg-accent/20 text-white' : 'border-pg-border text-gray-400 hover:border-gray-500 hover:text-white'}`}
            >
              Alle
            </button>
            {watchlists.map(w => (
              <button
                key={w.id}
                onClick={() => handleFilterChange('watchlist', filters.watchlist?.id === w.id ? null : w)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filters.watchlist?.id === w.id ? 'border-pg-accent bg-pg-accent/20 text-white' : 'border-pg-border text-gray-400 hover:border-gray-500 hover:text-white'}`}
              >
                ★ {w.name} <span className="text-gray-500 ml-1">{w.cardIds.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hovedinnhold */}
      <main className="max-w-screen-xl mx-auto px-4 py-5">
        {loading && (
          <div className="text-center py-20 text-gray-400">Laster kortliste...</div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">
            Kunne ikke hente data: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <FilterPanel
              values={filters}
              onChange={handleFilterChange}
              activeCount={activeFilterCount}
              allSets={allSets}
            />
            <CardList
              cards={filtered}
              onCardClick={c => setSelectedCardId(c.id)}
              watchlists={watchlists}
              onToggleWatchlist={toggleCardInWatchlist}
              onCreateWatchlist={createWatchlist}
            />
          </>
        )}
      </main>

      {/* Modaler */}
      {selectedCardId && (
        <CardDetail
          cardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
          watchlists={watchlists}
          onToggleWatchlist={toggleCardInWatchlist}
          onCreateWatchlist={createWatchlist}
        />
      )}
      {showBudget && (
        <BudgetSimulator cards={cards} onClose={() => setShowBudget(false)} />
      )}
      {showWatchlistManager && (
        <WatchlistManager
          watchlists={watchlists}
          onCreate={createWatchlist}
          onDelete={deleteWatchlist}
          onRename={renameWatchlist}
          onClose={() => setShowWatchlistManager(false)}
        />
      )}
    </div>
  );
}
