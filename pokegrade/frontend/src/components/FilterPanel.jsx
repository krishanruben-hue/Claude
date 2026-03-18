import React from 'react';

const filters = [
  { key: 'gem_rate', label: 'Gem rate ≥', unit: '%', type: 'min', transform: v => v / 100 },
  { key: 'multiplier', label: 'Multiplier ≥', unit: 'x', type: 'min', transform: v => v },
  { key: 'roi', label: 'ROI ≥', unit: '%', type: 'min', transform: v => v / 100 },
  { key: 'psa10_pop', label: 'PSA10 pop ≤', unit: '', type: 'max', transform: v => v },
  { key: 'raw_nok', label: 'Raw-pris ≤', unit: 'NOK', type: 'max', transform: v => v },
  { key: 'total_pop', label: 'Totalt graderte ≥', unit: '', type: 'min', transform: v => v },
  { key: 'finn_deviation', label: 'Finn-avvik ≤', unit: '%', type: 'max', transform: v => v / 100 },
];

export default function FilterPanel({ values, onChange, activeCount }) {
  function handleChange(key, raw) {
    const num = raw === '' ? '' : parseFloat(raw);
    onChange(key, raw === '' ? null : (isNaN(num) ? null : num));
  }

  function reset() {
    filters.forEach(f => onChange(f.key, null));
  }

  return (
    <div className="bg-pg-card border border-pg-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {filters.map(f => {
          const rawVal = values[f.key];
          const displayVal = rawVal != null ? (
            f.key === 'gem_rate' || f.key === 'roi' || f.key === 'finn_deviation'
              ? (rawVal * 100).toString()
              : rawVal.toString()
          ) : '';
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
                    // Store internally as actual value (not percentage)
                    const stored = (f.key === 'gem_rate' || f.key === 'roi' || f.key === 'finn_deviation')
                      ? num / 100
                      : num;
                    onChange(f.key, stored);
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
