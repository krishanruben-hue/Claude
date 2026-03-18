import React from 'react';

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
  function reset() {
    numericFilters.forEach(f => onChange(f.key, null));
    onChange('search', null);
    onChange('set', null);
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

      {/* Søk og sett-filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            value={values.search || ''}
            onChange={e => onChange('search', e.target.value || null)}
            placeholder="Søk på kortnavn eller sett..."
            className={`w-full bg-pg-bg border rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pg-accent transition-colors ${values.search ? 'border-pg-accent' : 'border-pg-border'}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onChange('set', null)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${!values.set ? 'border-pg-accent bg-pg-accent/20 text-white' : 'border-pg-border text-gray-400 hover:border-gray-500 hover:text-white'}`}
          >
            Alle sett
          </button>
          {allSets.map(s => (
            <button
              key={s}
              onClick={() => onChange('set', values.set === s ? null : s)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${values.set === s ? 'border-pg-accent bg-pg-accent/20 text-white' : 'border-pg-border text-gray-400 hover:border-gray-500 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
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
