import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from './api/client.js';
import CardList from './components/CardList.jsx';
import { CardGrid, CardIconView } from './components/CardGrid.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import CardDetail from './components/CardDetail.jsx';
import BudgetSimulator from './components/BudgetSimulator.jsx';
import WatchlistManager from './components/WatchlistManager.jsx';
import { useWatchlists } from './hooks/useWatchlists.js';

const PAGE_SIZE = 50;

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
  rarity: null,
  watchlist: null,
};

// Metrics-filtre gjøres klient-side (beregnes på backend, ikke lagret i DB)
function applyClientFilters(cards, filters) {
  return cards.filter(card => {
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
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored !== null ? stored === 'true' : true;
  });
  const [cards, setCards] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showBudget, setShowBudget] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');
  const [progress, setProgress] = useState({ running: false, current: 0, total: 0, label: '' });
  const [isMock, setIsMock] = useState(false);
  const [fxRate, setFxRate] = useState(null);
  const [allSets, setAllSets] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'grid' | 'icon'
  const [sort, setSort] = useState({ key: 'roi', dir: 'desc' });
  const searchTimer = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const {
    watchlists,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    toggleCardInWatchlist,
  } = useWatchlists();

  const fetchCards = useCallback((currentPage, currentFilters, currentSort) => {
    setLoading(true);
    api.getCards({
      page: currentPage,
      limit: PAGE_SIZE,
      q: currentFilters.search || '',
      set: currentFilters.set || '',
      rarity: currentFilters.rarity || '',
      sort_by:  currentSort?.key  || 'name',
      sort_dir: currentSort?.dir  || 'asc',
    })
      .then(res => {
        setCards(res.cards || []);
        setTotal(res.total || 0);
        setIsMock(res.mock);
        setFxRate(res.fx_rate);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Last sett én gang
  useEffect(() => {
    api.getSets().then(setAllSets).catch(() => {});
  }, []);

  // Refetch når side endres
  useEffect(() => {
    fetchCards(page, filters, sort);
  }, [page]); // eslint-disable-line

  // Refetch fra side 1 når server-side filtre eller sort endres
  useEffect(() => {
    setPage(1);
    fetchCards(1, filters, sort);
  }, [filters.search, filters.set, filters.rarity, sort]); // eslint-disable-line

  function handleFilterChange(key, value) {
    if (key === 'search') {
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: value }));
      }, 350);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  // Klient-side filtre (gem_rate, multiplier, roi osv. beregnes på backend og returneres)
  const filtered = useMemo(() => applyClientFilters(cards, filters), [cards, filters]);
  const activeFilterCount = Object.values(filters).filter(v => v != null).length;

  async function adminAction(action, label) {
    setAdminStatus(`${label}...`);
    setProgress({ running: true, current: 0, total: 0, label });

    try {
      const res = await action();

      if (res.mock) {
        setAdminStatus('Mock-modus aktiv');
        setProgress({ running: false, current: 0, total: 0, label: '' });
        return;
      }

      if (res.started) {
        // Backend kjører asynkront — poll til done:true
        await new Promise((resolve) => {
          const deadline = setTimeout(resolve, 15 * 60 * 1000); // maks 15 min
          const poller = setInterval(async () => {
            try {
              const p = await api.getProgress();
              setProgress(p);
              if (!p.running && p.done) {
                clearInterval(poller);
                clearTimeout(deadline);
                const { result } = p;
                const count = result?.refreshed ?? 0;
                const errCount = result?.errors?.length ?? 0;
                const errMsg = errCount > 0 ? ` (${errCount} feil: ${result.errors[0]?.error})` : '';
                setAdminStatus(`Ferdig: ${count} oppdatert${errMsg}`);
                fetchCards(page, filters);
                resolve();
              }
            } catch {}
          }, 500);
        });
      } else {
        // Synkront svar (PSA, Finn)
        const finalP = await api.getProgress().catch(() => null);
        setProgress(finalP ?? { running: false, current: 0, total: 0, label });
        const count = res.refreshed ?? res.listings?.length ?? 0;
        const errCount = res.errors?.length ?? 0;
        const errMsg = errCount > 0 ? ` (${errCount} feil: ${res.errors[0]?.error})` : '';
        setAdminStatus(`Ferdig: ${count} oppdatert${errMsg}`);
        fetchCards(page, filters);
      }
    } catch (err) {
      setAdminStatus(`Feil: ${err.message}`);
      setProgress({ running: false, current: 0, total: 0, label: '' });
    }
  }

  return (
    <div className="min-h-screen bg-pg-bg text-gray-100">
      {/* Header */}
      <header className="border-b border-pg-border bg-pg-bg sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[11px] tracking-[0.4em] uppercase font-medium text-white">POKEGRADE</span>
            {isMock && (
              <span className="text-[9px] tracking-[0.2em] uppercase border border-pg-border text-gray-500 px-2 py-0.5">
                DEMO
              </span>
            )}
            {fxRate && (
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-600 hidden sm:block">
                1 USD = {fxRate.toFixed(2)} NOK
              </span>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setDarkMode(d => !d)}
              className="text-[10px] tracking-[0.18em] uppercase px-4 py-3 border-l border-t border-b border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
              title={darkMode ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
            >
              {darkMode ? '○' : '●'}
            </button>
            <button
              onClick={() => setShowWatchlistManager(true)}
              className="text-[10px] tracking-[0.18em] uppercase px-4 py-3 border-l border-t border-b border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
            >
              Watchlister{watchlists.length > 0 && <span className="ml-1.5 text-pg-accent">{watchlists.length}</span>}
            </button>
            <button
              onClick={() => setShowBudget(true)}
              className="text-[10px] tracking-[0.18em] uppercase px-4 py-3 border-l border-t border-b border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
            >
              Budsjett
            </button>
            <button
              onClick={() => setShowAdmin(prev => !prev)}
              className="text-[10px] tracking-[0.18em] uppercase px-4 py-3 border border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Admin-panel */}
        {showAdmin && (
          <div className="border-t border-pg-border bg-pg-bg px-4 py-4">
            <div className="max-w-screen-xl mx-auto flex items-center gap-0 flex-wrap mb-4">
              <button
                onClick={() => adminAction(() => api.refreshPrices(filters.set || null), filters.set ? `Oppdaterer priser (${filters.set})` : 'Oppdaterer alle priser')}
                className="text-[10px] tracking-[0.18em] uppercase px-4 py-2.5 border border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
              >
                Priser{filters.set ? ` (${filters.set})` : ''}
              </button>
              <button
                onClick={() => adminAction(api.refreshPsa, 'Scraper PSA Pop Report')}
                className="text-[10px] tracking-[0.18em] uppercase px-4 py-2.5 border-t border-b border-r border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
              >
                PSA Pop
              </button>
              <button
                onClick={() => adminAction(api.refreshFinn, 'Scraper Finn.no')}
                className="text-[10px] tracking-[0.18em] uppercase px-4 py-2.5 border-t border-b border-r border-pg-border text-gray-500 hover:text-white hover:bg-pg-card transition-colors"
              >
                Finn.no
              </button>
            </div>
            {/* Progress */}
            <div className="max-w-screen-xl mx-auto">
              <div className="flex items-center justify-between text-[10px] tracking-[0.12em] uppercase text-gray-600 mb-2">
                <span>{progress.running ? progress.label : (adminStatus || 'Klar')}</span>
                {progress.running && progress.total > 0 && (
                  <span>{progress.current} / {progress.total}</span>
                )}
              </div>
              <div className="w-full bg-pg-border h-px overflow-hidden">
                <div
                  className={`h-px transition-all duration-500 ${adminStatus.startsWith('Feil') ? 'bg-red-400' : 'bg-pg-accent'}`}
                  style={{
                    width: progress.running
                      ? (progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '4%')
                      : '100%',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Watchlist-filterlinje */}
      {watchlists.length > 0 && (
        <div className="border-b border-pg-border bg-pg-bg px-4 py-2">
          <div className="max-w-screen-xl mx-auto flex items-center gap-0 flex-wrap">
            <span className="text-[9px] tracking-[0.2em] uppercase text-gray-600 mr-3">Watch</span>
            <button
              onClick={() => handleFilterChange('watchlist', null)}
              className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${!filters.watchlist ? 'border-pg-accent text-pg-accent' : 'border-pg-border text-gray-500 hover:text-white'}`}
            >
              Alle
            </button>
            {watchlists.map(w => (
              <button
                key={w.id}
                onClick={() => handleFilterChange('watchlist', filters.watchlist?.id === w.id ? null : w)}
                className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border-t border-b border-r transition-colors ${filters.watchlist?.id === w.id ? 'border-pg-accent text-pg-accent' : 'border-pg-border text-gray-500 hover:text-white'}`}
              >
                {w.name} <span className="text-gray-600 ml-1">{w.cardIds.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hovedinnhold */}
      <main className="max-w-screen-xl mx-auto px-4 py-5">
        {loading && (
          <div className="text-center py-20 text-[10px] tracking-[0.3em] uppercase text-gray-600">Laster</div>
        )}

        {error && (
          <div className="border border-pg-border p-4 text-red-400 text-xs tracking-[0.1em] uppercase">
            Feil: {error}
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
            {/* Verktøylinje: antall, sortering, view-velger, paginering */}
            <div className="flex flex-wrap items-center gap-0 mb-4 border border-pg-border">
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-600 px-4 py-2.5 border-r border-pg-border mr-auto">
                {total.toLocaleString('nb-NO')} kort
              </span>

              {/* Sortering */}
              <select
                value={sort.key}
                onChange={e => setSort(s => ({ ...s, key: e.target.value }))}
                className="text-[10px] tracking-[0.12em] uppercase bg-pg-bg border-r border-pg-border px-3 py-2.5 text-gray-500 hover:text-white focus:outline-none focus:text-white cursor-pointer transition-colors"
              >
                <option value="roi">ROI</option>
                <option value="set_number">Nr.</option>
                <option value="name">Navn</option>
                <option value="raw_nok">Raw</option>
                <option value="psa10_nok">PSA10</option>
                <option value="multiplier">Multi</option>
                <option value="gem_rate">Gem</option>
                <option value="psa10_pop">Pop</option>
              </select>
              <button
                onClick={() => setSort(s => ({ ...s, dir: s.dir === 'desc' ? 'asc' : 'desc' }))}
                className="text-[10px] px-3 py-2.5 border-r border-pg-border text-gray-500 hover:text-white transition-colors"
              >
                {sort.dir === 'desc' ? '↓' : '↑'}
              </button>

              {/* View-velger */}
              {[['list','☰'],['grid','⊞'],['icon','⊟']].map(([v, icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2.5 text-sm border-r border-pg-border transition-colors ${view === v ? 'text-pg-accent' : 'text-gray-600 hover:text-white'}`}
                >
                  {icon}
                </button>
              ))}

              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2.5 border-r border-pg-border text-gray-500 hover:text-white disabled:opacity-25 disabled:cursor-default transition-colors"
                  >
                    ‹
                  </button>
                  <span className="text-[10px] tracking-[0.1em] uppercase text-gray-600 px-3 py-2.5 border-r border-pg-border">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2.5 text-gray-500 hover:text-white disabled:opacity-25 disabled:cursor-default transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {view === 'list' && (
              <CardList
                cards={filtered}
                sort={sort}
                onSortChange={setSort}
                onCardClick={c => setSelectedCardId(c.id)}
                watchlists={watchlists}
                onToggleWatchlist={toggleCardInWatchlist}
                onCreateWatchlist={createWatchlist}
              />
            )}
            {view === 'grid' && (
              <CardGrid
                cards={filtered}
                onCardClick={c => setSelectedCardId(c.id)}
                watchlists={watchlists}
                onToggleWatchlist={toggleCardInWatchlist}
                onCreateWatchlist={createWatchlist}
              />
            )}
            {view === 'icon' && (
              <CardIconView
                cards={filtered}
                onCardClick={c => setSelectedCardId(c.id)}
              />
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-0 mt-8 border border-pg-border w-fit mx-auto">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-r border-pg-border text-gray-500 hover:text-white disabled:opacity-25 disabled:cursor-default transition-colors"
                >
                  ← Forrige
                </button>
                <span className="text-[10px] tracking-[0.12em] uppercase text-gray-600 px-5 py-2.5 border-r border-pg-border">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 text-gray-500 hover:text-white disabled:opacity-25 disabled:cursor-default transition-colors"
                >
                  Neste →
                </button>
              </div>
            )}
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
