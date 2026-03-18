import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from './api/client.js';
import CardList from './components/CardList.jsx';
import { CardGrid, CardIconView } from './components/CardGrid.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import CardDetail from './components/CardDetail.jsx';
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
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');
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

  async function adminAction(action, label, poll = false) {
    setAdminStatus(`${label}...`);
    let poller = null;
    if (poll) {
      poller = setInterval(async () => {
        try {
          const p = await api.getLinkProgress();
          setAdminStatus(`${label}... ${p.linked} / ${p.total} koblet`);
        } catch {}
      }, 3000);
    }
    try {
      const res = await action();
      if (poller) clearInterval(poller);
      const count = res.linked ?? res.refreshed ?? res.listings?.length ?? 0;
      const errCount = res.errors?.length ?? 0;
      const errMsg = errCount > 0 ? ` (${errCount} feil: ${res.errors[0]?.error})` : '';
      setAdminStatus(res.mock ? 'Mock-modus aktiv' : `Ferdig: ${count} oppdatert${errMsg}`);
      if (!res.mock) fetchCards(page, filters);
    } catch (err) {
      if (poller) clearInterval(poller);
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
              onClick={() => setDarkMode(d => !d)}
              className="text-sm px-3 py-1.5 rounded-lg border border-pg-border hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
              title={darkMode ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
            >
              {darkMode ? '☀' : '🌙'}
            </button>
            <button
              onClick={() => setShowWatchlistManager(true)}
              className="text-sm px-3 py-1.5 rounded-lg border border-pg-border hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
            >
              ★ Watchlister {watchlists.length > 0 && <span className="ml-1 text-pg-accent">{watchlists.length}</span>}
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
                onClick={() => adminAction(api.autoLinkCards, 'Kobler API-IDer', true)}
                className="text-sm px-3 py-1.5 bg-pg-card border border-pg-border rounded-lg hover:border-pg-accent text-gray-300 hover:text-white transition-colors"
              >
                Koble API-IDer
              </button>
              <button
                onClick={() => adminAction(() => api.refreshPrices(filters.set || null), filters.set ? `Oppdaterer priser for ${filters.set}` : 'Oppdaterer priser')}
                className="text-sm px-3 py-1.5 bg-pg-card border border-pg-border rounded-lg hover:border-pg-accent text-gray-300 hover:text-white transition-colors"
              >
                {filters.set ? `Oppdater priser (${filters.set})` : 'Oppdater priser'}
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
            {/* Verktøylinje: antall, sortering, view-velger, paginering */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-500">
              <span className="mr-auto">{total.toLocaleString('nb-NO')} kort totalt</span>

              {/* Sortering */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 hidden sm:block">Sorter:</span>
                <select
                  value={sort.key}
                  onChange={e => setSort(s => ({ ...s, key: e.target.value }))}
                  className="text-xs bg-pg-card border border-pg-border rounded px-2 py-1 text-gray-300 hover:border-gray-500 focus:outline-none focus:border-pg-accent cursor-pointer"
                >
                  <option value="roi">ROI (PSA10)</option>
                  <option value="set_number">Nr. i sett</option>
                  <option value="name">Kortnavn</option>
                  <option value="raw_nok">Raw-pris</option>
                  <option value="psa10_nok">PSA10-pris</option>
                  <option value="multiplier">Multiplier</option>
                  <option value="gem_rate">Gem rate</option>
                  <option value="psa10_pop">PSA10 pop</option>
                </select>
                <button
                  onClick={() => setSort(s => ({ ...s, dir: s.dir === 'desc' ? 'asc' : 'desc' }))}
                  className="text-xs px-2 py-1 bg-pg-card border border-pg-border rounded hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
                  title={sort.dir === 'desc' ? 'Synkende' : 'Stigende'}
                >
                  {sort.dir === 'desc' ? '↓' : '↑'}
                </button>
              </div>

              {/* View-velger */}
              <div className="flex items-center gap-0 border border-pg-border rounded-lg overflow-hidden">
                {[['list','☰'],['grid','⊞'],['icon','⊟']].map(([v, icon]) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    title={v === 'list' ? 'Listevisning' : v === 'grid' ? 'Gridvisning' : 'Ikonvisning'}
                    className={`px-3 py-1 text-sm transition-colors ${view === v ? 'bg-pg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-pg-card'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 rounded border border-pg-border hover:border-gray-500 disabled:opacity-30 disabled:cursor-default"
                  >
                    ‹
                  </button>
                  <span>Side {page} av {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 py-1 rounded border border-pg-border hover:border-gray-500 disabled:opacity-30 disabled:cursor-default"
                  >
                    ›
                  </button>
                </div>
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
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded border border-pg-border hover:border-gray-500 disabled:opacity-30 disabled:cursor-default"
                >
                  ‹ Forrige
                </button>
                <span>Side {page} av {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded border border-pg-border hover:border-gray-500 disabled:opacity-30 disabled:cursor-default"
                >
                  Neste ›
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
