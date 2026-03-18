import { useState, useMemo, useCallback } from 'react';
import type { FilterState } from '@/lib/types';
import { applyFilters } from '@/lib/calculations';
import { useCardData } from '@/hooks/useCardData';
import { FilterPanel } from '@/components/FilterPanel';
import { CardTable } from '@/components/CardTable';
import { CardDetail } from '@/components/CardDetail';
import { BudgetSimulator } from '@/components/BudgetSimulator';
import { AdminPanel } from '@/components/AdminPanel';
import { RefreshCw, Settings } from 'lucide-react';

const EMPTY_FILTERS: FilterState = {
  minGemRate: null,
  minMultiplier: null,
  minRoi: null,
  maxPsa10Pop: null,
  maxRawNok: null,
  minTotalGraded: null,
  maxFinnDeviation: null,
  searchQuery: '',
  selectedSets: [],
};

const Index = () => {
  const { allMetrics, availableSets, fxRate, loading, error, isEmpty, refresh } = useCardData();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('roi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAdmin, setShowAdmin] = useState(false);

  const filteredAndSorted = useMemo(() => {
    const filtered = applyFilters(allMetrics, filters);
    return filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case 'name':
          return sortDir === 'asc'
            ? a.card.name.localeCompare(b.card.name)
            : b.card.name.localeCompare(a.card.name);
        case 'rawNok': aVal = a.rawNok; bVal = b.rawNok; break;
        case 'psa10Nok': aVal = a.psa10Nok; bVal = b.psa10Nok; break;
        case 'multiplier': aVal = a.multiplier; bVal = b.multiplier; break;
        case 'gemRate': aVal = a.gemRate; bVal = b.gemRate; break;
        case 'roi': aVal = a.roi; bVal = b.roi; break;
        case 'psa10Pop': aVal = a.psa10Pop; bVal = b.psa10Pop; break;
        case 'finnListingsCount': aVal = a.finnListingsCount; bVal = b.finnListingsCount; break;
        default: aVal = a.roi; bVal = b.roi;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [allMetrics, filters, sortField, sortDir]);

  const handleSort = useCallback(
    (field: string) => {
      if (field === sortField) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField],
  );

  const selectedMetrics = selectedCardId
    ? allMetrics.find(m => m.card.id === selectedCardId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-foreground tracking-tight">PokeGrade</h1>
            {isEmpty && !loading && (
              <span className="text-xs font-mono text-muted-foreground bg-secondary rounded px-2 py-0.5">
                TOM DB
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono tabular-nums">
            <span>USD/NOK: {fxRate.toFixed(2)}</span>
            <span>{allMetrics.length} kort</span>
            <button
              onClick={() => void refresh()}
              className="p-1 hover:text-foreground transition-colors"
              title="Oppdater data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAdmin(v => !v)}
              className={`p-1 hover:text-foreground transition-colors ${showAdmin ? 'text-foreground' : ''}`}
              title="Admin"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            Feil ved lasting av data: {error}
          </div>
        )}

        {showAdmin && <AdminPanel onDataChanged={() => void refresh()} />}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Laster data…</div>
        ) : selectedMetrics ? (
          <CardDetail cardMetrics={selectedMetrics} onBack={() => setSelectedCardId(null)} />
        ) : isEmpty ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-muted-foreground text-sm">Ingen kort i databasen ennå.</p>
            <p className="text-muted-foreground text-xs">
              Åpne admin-panelet (⚙) for å legge til kort.
            </p>
          </div>
        ) : (
          <>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              availableSets={availableSets}
            />
            <CardTable
              cards={filteredAndSorted}
              onCardClick={setSelectedCardId}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <BudgetSimulator cards={filteredAndSorted} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
