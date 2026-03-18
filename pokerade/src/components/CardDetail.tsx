import type { CardMetrics } from '@/lib/types';
import { formatNok, formatPct, formatUsd } from '@/lib/calculations';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  cardMetrics: CardMetrics;
  onBack: () => void;
}

function StatRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide shrink-0">{label}</span>
      <div className="text-right">
        <div className="text-sm font-mono font-medium">{value}</div>
        {sub && <div className="text-xs text-muted-foreground font-mono">{sub}</div>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2 bg-muted border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{title}</span>
      </div>
      <div className="px-4 divide-y-0">{children}</div>
    </div>
  );
}

export function CardDetail({ cardMetrics: m, onBack }: Props) {
  const isPositiveRoi = m.roi >= 0;
  const gradingFee = 400;
  const invested = m.rawNok + gradingFee;
  const expectedReturn = m.psa10Nok * m.gemRate;
  const expectedProfit = expectedReturn - invested;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground leading-tight">{m.card.name}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {m.card.set} · #{m.card.number}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {isPositiveRoi ? (
            <TrendingUp className="h-4 w-4 text-positive" />
          ) : (
            <TrendingDown className="h-4 w-4 text-negative" />
          )}
          <span
            className={`text-lg font-mono font-bold ${isPositiveRoi ? 'text-positive' : 'text-negative'}`}
          >
            {isPositiveRoi ? '+' : ''}{formatPct(m.roi)}
          </span>
        </div>
      </div>

      {/* Grid of sections */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Prisinformasjon">
          <StatRow label="Rå pris" value={formatNok(m.rawNok)} />
          <StatRow
            label="PSA 10 pris"
            value={formatNok(m.psa10Nok)}
            sub={formatUsd(m.psa10Usd)}
          />
          <StatRow label="Multiplier" value={`${m.multiplier.toFixed(2)}x`} />
          {m.finnAvgPrice > 0 && (
            <StatRow
              label="Finn snitt"
              value={formatNok(m.finnAvgPrice)}
              sub={`${m.finnDeviation >= 0 ? '+' : ''}${m.finnDeviation.toFixed(1)}% vs rå`}
            />
          )}
          {m.finnListingsCount > 0 && (
            <StatRow label="Finn annonser" value={`${m.finnListingsCount} stk`} />
          )}
        </Section>

        <Section title="Graderingsdata">
          <StatRow
            label="Gem Rate"
            value={formatPct(m.gemRate * 100)}
            sub={`${m.psa10Pop} av ${m.totalGraded} totalt`}
          />
          <StatRow label="PSA 10 Pop" value={m.psa10Pop.toLocaleString('nb-NO')} />
          <StatRow label="Totalt graded" value={m.totalGraded.toLocaleString('nb-NO')} />
        </Section>

        <Section title="ROI-kalkulator">
          <StatRow label="Rå kort" value={formatNok(m.rawNok)} />
          <StatRow label="Graderingsavgift" value={formatNok(gradingFee)} />
          <StatRow label="Totalt investert" value={formatNok(invested)} />
          <StatRow
            label="Forventet verdi"
            value={formatNok(expectedReturn)}
            sub={`PSA 10 × ${formatPct(m.gemRate * 100)} gem rate`}
          />
          <StatRow
            label="Forventet gevinst"
            value={
              <span className={expectedProfit >= 0 ? 'text-positive' : 'text-negative'}>
                {expectedProfit >= 0 ? '+' : ''}{formatNok(expectedProfit)}
              </span>
            }
          />
          <StatRow
            label="ROI"
            value={
              <span className={isPositiveRoi ? 'text-positive' : 'text-negative'}>
                {isPositiveRoi ? '+' : ''}{formatPct(m.roi)}
              </span>
            }
          />
        </Section>

        <Section title="Tolkningshjelp">
          <div className="py-3 space-y-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Gem Rate</strong> er andelen kort som graderes PSA
              10. Basert på {m.totalGraded.toLocaleString('nb-NO')} graderte eksemplarer.
            </p>
            <p>
              <strong className="text-foreground">ROI</strong> er forventet avkastning dersom du kjøper
              råkortet, grader det, og selger PSA 10. Beregnet som:{' '}
              <span className="font-mono">(PSA10 × Gem%) - (Rå + Avgift)</span> delt på{' '}
              <span className="font-mono">Rå + Avgift</span>.
            </p>
            <p>
              <strong className="text-foreground">Multiplier</strong> viser PSA 10-prisen i forhold
              til råprisen. {m.multiplier.toFixed(1)}x betyr PSA 10 er{' '}
              {m.multiplier.toFixed(1)} ganger råprisen.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
