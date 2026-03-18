import React, { useState } from 'react';

const numericFilters = [
  { key: 'gem_rate', label: 'Gem rate ≥', unit: '%', pct: true },
  { key: 'multiplier', label: 'Multiplier ≥', unit: 'x', pct: false },
  { key: 'roi', label: 'ROI ≥', unit: '%', pct: true },
  { key: 'psa10_pop', label: 'PSA10 pop ≤', unit: '', pct: false },
  { key: 'raw_nok', label: 'Raw-pris ≤', unit: 'NOK', pct: false },
  { key: 'total_pop', label: 'Totalt graderte ≥', unit: '', pct: false },
  { key: 'finn_deviation', label: 'Finn-avvik ≤', unit: '%', pct: true },
];

const ALL_SETS = 'Alle sett';

export default function FilterPanel({ values, onChange, activeCount, allSets }) {
  const [searchText, setSearchText] = useState(values.search || '');

  // Synkroniser hvis parent nullstiller (f.eks. reset)
  React.useEffect(() => {
    if (!values.search) setSearchText('');
  }, [values.search]);

  function reset() {
    numericFilters.forEach(f => onChange(f.key, null));
    onChange('search', null);
    onChange('set', null);
    onChange('rarity', null);
  }

  return (
    <div className="bg-pg-card border border-pg-border rounded-xl p-4 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-300">Filtre</span>
          {activeCount > 0 && (
            <span className="text-xs bg-pg-accent text-white px-2 py-0.5 rounded-full">{activeCount} aktiv</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-gray-400 hover:text-white transition-colors">
            Nullstill alle
          </button>
        )}
      </div>

      {/* Søk, sett og rarity */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            value={searchText}
            onChange={e => {
              setSearchText(e.target.value);
              onChange('search', e.target.value || null);
            }}
            placeholder="Søk på kortnavn..."
            className={`w-full bg-pg-bg border rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pg-accent transition-colors ${values.search ? 'border-pg-accent' : 'border-pg-border'}`}
          />
        </div>
        <select
          value={values.set || ''}
          onChange={e => onChange('set', e.target.value || null)}
          className={`bg-pg-bg border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pg-accent transition-colors ${values.set ? 'border-pg-accent' : 'border-pg-border'}`}
        >
          <option value="">Alle sett</option>
          {allSets.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={values.rarity || ''}
          onChange={e => onChange('rarity', e.target.value || null)}
          className={`bg-pg-bg border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pg-accent transition-colors ${values.rarity ? 'border-pg-accent' : 'border-pg-border'}`}
        >
          <option value="">Alle rarity</option>
          <option value="Special Illustration Rare">Special Illustration Rare</option>
          <option value="Illustration Rare">Illustration Rare</option>
          <option value="Hyper Rare">Hyper Rare</option>
          <option value="Special Art Rare">Special Art Rare</option>
          <option value="Rare Holo VMAX">Rare Holo VMAX</option>
          <option value="Rare Holo V">Rare Holo V</option>
          <option value="Rare Holo VSTAR">Rare Holo VSTAR</option>
          <option value="Rare Rainbow">Rare Rainbow</option>
          <option value="Rare Secret">Rare Secret</option>
          <option value="Rare Ultra">Rare Ultra</option>
          <option value="Rare Holo">Rare Holo</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Common">Common</option>
        </select>
      </div>

      {/* Numeriske filtre */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {numericFilters.map(f => {
          const rawVal = values[f.key];
          const displayVal = rawVal != null ? (f.pct ? (rawVal * 100).toString() : rawVal.toString()) : '';
          const isActive = rawVal != null;

          return (
            <div key={f.key} className="flex flex-col gap-1">
              <label className={`text-xs ${isActive ? 'text-pg-accent' : 'text-gray-400'}`}>
                {f.label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={displayVal}
                  onChange={e => {
                    const raw = e.target.value;
                    if (raw === '') { onChange(f.key, null); return; }
                    const num = parseFloat(raw);
                    if (isNaN(num)) return;
                    onChange(f.key, f.pct ? num / 100 : num);
                  }}
                  placeholder="–"
                  className={`w-full bg-pg-bg border rounded px-2 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pg-accent transition-colors ${isActive ? 'border-pg-accent' : 'border-pg-border'}`}
                />
                {f.unit && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                    {f.unit}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
