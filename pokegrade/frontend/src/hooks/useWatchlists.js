import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pokegrade_watchlists';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(lists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

function newId() {
  return `wl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useWatchlists() {
  const [watchlists, setWatchlists] = useState(load);

  useEffect(() => { save(watchlists); }, [watchlists]);

  function createWatchlist(name) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const wl = { id: newId(), name: trimmed, cardIds: [] };
    setWatchlists(prev => [...prev, wl]);
    return wl.id;
  }

  function deleteWatchlist(id) {
    setWatchlists(prev => prev.filter(w => w.id !== id));
  }

  function renameWatchlist(id, name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setWatchlists(prev => prev.map(w => w.id === id ? { ...w, name: trimmed } : w));
  }

  function toggleCardInWatchlist(watchlistId, cardId) {
    setWatchlists(prev => prev.map(w => {
      if (w.id !== watchlistId) return w;
      const has = w.cardIds.includes(cardId);
      return { ...w, cardIds: has ? w.cardIds.filter(id => id !== cardId) : [...w.cardIds, cardId] };
    }));
  }

  function getWatchlistsForCard(cardId) {
    return watchlists.filter(w => w.cardIds.includes(cardId));
  }

  function isCardInWatchlist(watchlistId, cardId) {
    return watchlists.find(w => w.id === watchlistId)?.cardIds.includes(cardId) ?? false;
  }

  return {
    watchlists,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    toggleCardInWatchlist,
    getWatchlistsForCard,
    isCardInWatchlist,
  };
}
