import { useState, useEffect, useCallback } from 'react';
import type { StoredCard } from '@/lib/types';
import {
  getCards, addCard, updateCard, deleteCard, resetToSeed,
  triggerFinnScrape, triggerPriceScrape, getScrapeStatus,
} from '@/lib/api';
import { formatNok } from '@/lib/calculations';
import { Plus, Trash2, RotateCcw, Pencil, Check, X, RefreshCw, Search, DollarSign } from 'lucide-react';

interface Props {
  onDataChanged: () => void;
}

const EMPTY_FORM: Omit<StoredCard, 'id' | 'lastUpdated'> = {
  name: '', set: '', number: '',
  rawNok: 0, psa10Usd: 0, psa10Pop: 0,
  totalGraded: 0, gemRate: 0,
  finnAvgPrice: 0, finnListingsCount: 0,
};

function genId(name: string, set: string) {
  return `${name}-${set}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-muted-foreground font-mono">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        className="rounded border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-border"
      />
    </div>
  );
}

export function AdminPanel({ onDataChanged }: Props) {
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAdd, setShowAdd] = useState(false);
  const [scraping, setScraping] = useState({ finn: false, prices: false });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setCards(await getCards()); onDataChanged(); }
    finally { setLoading(false); }
  }, [onDataChanged]);

  useEffect(() => { void reload(); }, [reload]);

  // Poll status every 10 s while a scrape is running
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const { running } = await getScrapeStatus();
        setScraping(running);
        if (!running.finn && !running.prices) await reload();
      } catch { /* ignore */ }
    }, 10000);
    return () => clearInterval(t);
  }, [reload]);

  const sf = (k: keyof typeof EMPTY_FORM) => (v: string) =>
    setForm(p => ({ ...p, [k]: k === 'name' || k === 'set' || k === 'number' ? v : Number(v) }));

  const handleAdd = async () => {
    if (!form.name || !form.set) return;
    await addCard({ ...form, id: genId(form.name, form.set), lastUpdated: new Date().toISOString() });
    setForm(EMPTY_FORM); setShowAdd(false); await reload();
  };

  const handleSaveEdit = async (id: string) => {
    await updateCard({ ...form, id, lastUpdated: new Date().toISOString() });
    setEditId(null); await reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Slett dette kortet?')) return;
    await deleteCard(id); await reload();
  };

  const handleReset = async () => {
    if (!confirm('Tilbakestill til standard datasett?')) return;
    await resetToSeed(); await reload();
  };

  const handleFinn = async () => {
    setScraping(s => ({ ...s, finn: true })); setMsg(null);
    try { setMsg((await triggerFinnScrape()).message); }
    catch (e) { setMsg(e instanceof Error ? e.message : 'Feil'); setScraping(s => ({ ...s, finn: false })); }
  };

  const handlePrices = async () => {
    if (!confirm('Start eBay-prisscraping? Tar ~5–10 min for alle kort.')) return;
    setScraping(s => ({ ...s, prices: true })); setMsg(null);
    try { setMsg((await triggerPriceScrape()).message); }
    catch (e) { setMsg(e instanceof Error ? e.message : 'Feil'); setScraping(s => ({ ...s, prices: false })); }
  };

  const formFields = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
      <Field label="Navn" value={form.name} onChange={sf('name')} />
      <Field label="Sett" value={form.set} onChange={sf('set')} />
      <Field label="Nummer" value={form.number} onChange={sf('number')} />
      <Field label="Rå kr" value={form.rawNok} onChange={sf('rawNok')} type="number" />
      <Field label="PSA10 USD" value={form.psa10Usd} onChange={sf('psa10Usd')} type="number" />
      <Field label="PSA10 Pop" value={form.psa10Pop} onChange={sf('psa10Pop')} type="number" />
      <Field label="Totalt graded" value={form.totalGraded} onChange={sf('totalGraded')} type="number" />
      <Field label="Gem Rate (0–1)" value={form.gemRate} onChange={sf('gemRate')} type="number" />
      <Field label="Finn snitt kr" value={form.finnAvgPrice} onChange={sf('finnAvgPrice')} type="number" />
      <Field label="Finn annonser" value={form.finnListingsCount} onChange={sf('finnListingsCount')} type="number" />
    </div>
  );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-muted border-b border-border flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Admin</span>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => void handleFinn()} disabled={scraping.finn}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Hent Finn.no-annonser">
            <Search className={`h-3 w-3 ${scraping.finn ? 'animate-spin' : ''}`} />
            {scraping.finn ? 'Henter Finn...' : 'Oppdater Finn'}
          </button>
          <button onClick={() => void handlePrices()} disabled={scraping.prices}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Hent PSA10 USD fra eBay sold listings">
            <DollarSign className={`h-3 w-3 ${scraping.prices ? 'animate-spin' : ''}`} />
            {scraping.prices ? 'Henter priser...' : 'Oppdater priser'}
          </button>
          <button onClick={() => void reload()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" /> Last inn
          </button>
          <button onClick={() => void handleReset()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button onClick={() => { setShowAdd(v => !v); setEditId(null); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> Legg til
          </button>
        </div>
      </div>

      {msg && (
        <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary/40 border-b border-border font-mono">
          {msg}
        </div>
      )}

      {showAdd && (
        <div className="border-b border-border p-4 bg-secondary/40">
          {formFields}
          <div className="flex gap-2">
            <button onClick={() => void handleAdd()}
              className="flex items-center gap-1 rounded bg-foreground px-3 py-1.5 text-xs text-primary-foreground hover:opacity-80">
              <Check className="h-3 w-3" /> Lagre
            </button>
            <button onClick={() => setShowAdd(false)}
              className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> Avbryt
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="px-4 py-8 text-xs text-muted-foreground text-center font-mono">Laster...</div>
      ) : (
        <div className="divide-y divide-border">
          {cards.map(card => (
            <div key={card.id}>
              {editId === card.id ? (
                <div className="p-4 bg-secondary/20">
                  {formFields}
                  <div className="flex gap-2">
                    <button onClick={() => void handleSaveEdit(card.id)}
                      className="flex items-center gap-1 rounded bg-foreground px-3 py-1.5 text-xs text-primary-foreground hover:opacity-80">
                      <Check className="h-3 w-3" /> Lagre
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" /> Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{card.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {card.set} · #{card.number} · {formatNok(card.rawNok)} rå · PSA10 ${card.psa10Usd.toLocaleString()}
                      {card.finnListingsCount > 0 && ` · Finn: ${card.finnListingsCount} annonser`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { startEdit(card); }}
                      className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => void handleDelete(card.id)}
                      className="p-1 text-muted-foreground hover:text-negative"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function startEdit(card: StoredCard) {
    setEditId(card.id);
    setForm({
      name: card.name, set: card.set, number: card.number,
      rawNok: card.rawNok, psa10Usd: card.psa10Usd, psa10Pop: card.psa10Pop,
      totalGraded: card.totalGraded, gemRate: card.gemRate,
      finnAvgPrice: card.finnAvgPrice, finnListingsCount: card.finnListingsCount,
    });
  }
}
