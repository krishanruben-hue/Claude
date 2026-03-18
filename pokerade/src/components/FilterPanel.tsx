import type { FilterState } from '@/lib/types';
import { X } from 'lucide-react';

interface Props {
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  availableSets: string[];
}

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  unit,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder ?? '–'}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border"
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onFilterChange, availableSets }: Props) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFilterChange({ ...filters, [key]: value });

  const hasActive =
    filters.minGemRate !== null ||
    filters.minMultiplier !== null ||
    filters.minRoi !== null ||
    filters.maxPsa10Pop !== null ||
    filters.maxRawNok !== null ||
    filters.minTotalGraded !== null ||
    filters.maxFinnDeviation !== null ||
    filters.searchQuery !== '' ||
    filters.selectedSets.length > 0;

  const toggleSet = (s: string) => {
    const next = filters.selectedSets.includes(s)
      ? filters.selectedSets.filter(x => x !== s)
      : [...filters.selectedSets, s];
    set('selectedSets', next);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Filter</span>
        {hasActive && (
          <button
            onClick={() =>
              onFilterChange({
                minGemRate: null,
                minMultiplier: null,
                minRoi: null,
                maxPsa10Pop: null,
                maxRawNok: null,
                minTotalGraded: null,
                maxFinnDeviation: null,
                searchQuery: '',
                selectedSets: [],
              })
            }
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Nullstill
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Søk</label>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={e => set('searchQuery', e.target.value)}
          placeholder="Navn eller sett..."
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border"
        />
      </div>

      {/* Numeric filters grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <NumInput
          label="Min Gem%"
          value={filters.minGemRate}
          onChange={v => set('minGemRate', v)}
          placeholder="0"
          unit="%"
        />
        <NumInput
          label="Min Multi"
          value={filters.minMultiplier}
          onChange={v => set('minMultiplier', v)}
          placeholder="0"
          unit="x"
        />
        <NumInput
          label="Min ROI"
          value={filters.minRoi}
          onChange={v => set('minRoi', v)}
          placeholder="0"
          unit="%"
        />
        <NumInput
          label="Max Pop10"
          value={filters.maxPsa10Pop}
          onChange={v => set('maxPsa10Pop', v)}
          placeholder="∞"
        />
        <NumInput
          label="Max Rå kr"
          value={filters.maxRawNok}
          onChange={v => set('maxRawNok', v)}
          placeholder="∞"
        />
        <NumInput
          label="Min Graded"
          value={filters.minTotalGraded}
          onChange={v => set('minTotalGraded', v)}
          placeholder="0"
        />
      </div>

      {/* Sets */}
      {availableSets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSets.map(s => (
            <button
              key={s}
              onClick={() => toggleSet(s)}
              className={`rounded px-2 py-0.5 text-xs font-mono transition-colors border ${
                filters.selectedSets.includes(s)
                  ? 'bg-foreground text-primary-foreground border-foreground'
                  : 'bg-secondary text-secondary-foreground border-border hover:border-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
