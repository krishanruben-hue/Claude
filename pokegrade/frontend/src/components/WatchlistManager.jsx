import React, { useState } from 'react';

export default function WatchlistManager({ watchlists, onCreate, onDelete, onRename, onClose }) {
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName);
    setNewName('');
  }

  function handleRename(e) {
    e.preventDefault();
    if (!editing?.name.trim()) return;
    onRename(editing.id, editing.name);
    setEditing(null);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-pg-card border border-pg-border rounded-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-pg-border">
          <h2 className="text-lg font-semibold text-white">Administrer watchlister</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-3">
          {watchlists.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Ingen watchlister ennå. Opprett din første nedenfor.
            </div>
          )}

          {watchlists.map(w => (
            <div key={w.id} className="flex items-center gap-2 p-3 bg-pg-bg rounded-lg border border-pg-border">
              {editing?.id === w.id ? (
                <form onSubmit={handleRename} className="flex-1 flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="flex-1 bg-pg-card border border-pg-accent rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                  <button type="submit" className="text-xs px-2 py-1 bg-pg-accent rounded text-white">Lagre</button>
                  <button type="button" onClick={() => setEditing(null)} className="text-xs px-2 py-1 border border-pg-border rounded text-gray-400">Avbryt</button>
                </form>
              ) : (
                <>
                  <span className="text-pg-accent mr-1">★</span>
                  <span className="flex-1 text-sm text-white">{w.name}</span>
                  <span className="text-xs text-gray-500">{w.cardIds.length} kort</span>
                  <button
                    onClick={() => setEditing({ id: w.id, name: w.name })}
                    className="text-xs text-gray-500 hover:text-white transition-colors px-1"
                    title="Gi nytt navn"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => { if (confirm(`Slett "${w.name}"?`)) onDelete(w.id); }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors px-1"
                    title="Slett"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          ))}

          <form onSubmit={handleCreate} className="flex gap-2 pt-2 border-t border-pg-border">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Navn på ny watchliste..."
              className="flex-1 bg-pg-bg border border-pg-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pg-accent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-pg-accent hover:bg-pg-accent-hover rounded-lg text-sm text-white transition-colors"
            >
              Opprett
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
