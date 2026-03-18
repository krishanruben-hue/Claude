import React, { useState, useRef, useEffect } from 'react';

// Liten popover som vises når man klikker bokmerke-ikonet på et kort
export default function WatchlistPopover({ cardId, watchlists, onToggle, onCreate }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const inAny = watchlists.some(w => w.cardIds.includes(cardId));

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = onCreate(newName);
    if (id) onToggle(id, cardId);
    setNewName('');
  }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(prev => !prev)}
        title="Legg til watchliste"
        className={`p-1 rounded transition-colors ${inAny ? 'text-pg-accent' : 'text-gray-600 hover:text-gray-300'}`}
      >
        {inAny ? '★' : '☆'}
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-30 w-52 bg-pg-card border border-pg-border rounded-xl shadow-xl p-3 space-y-2">
          <div className="text-xs font-semibold text-gray-400 mb-1">Watchlister</div>

          {watchlists.length === 0 && (
            <div className="text-xs text-gray-600">Ingen watchlister ennå</div>
          )}

          {watchlists.map(w => {
            const checked = w.cardIds.includes(cardId);
            return (
              <label key={w.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(w.id, cardId)}
                  className="accent-violet-500"
                />
                <span className={`text-sm truncate ${checked ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {w.name}
                </span>
                <span className="text-xs text-gray-600 ml-auto shrink-0">{w.cardIds.length}</span>
              </label>
            );
          })}

          <form onSubmit={handleCreate} className="flex gap-1 pt-1 border-t border-pg-border">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ny watchliste..."
              className="flex-1 bg-pg-bg border border-pg-border rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pg-accent"
            />
            <button
              type="submit"
              className="text-xs px-2 py-1 bg-pg-accent hover:bg-pg-accent-hover rounded text-white transition-colors"
            >
              +
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
