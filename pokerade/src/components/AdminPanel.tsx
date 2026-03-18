import { useState } from 'react';
import type { StoredCard } from '@/lib/types';
import { getCards, addCard, updateCard, deleteCard, resetToSeed } from '@/lib/db';
import { formatNok } from '@/lib/calculations';
import { Plus, Trash2, RotateCcw, Pencil, Check, X } from 'lucide-react';

interface Props {
  onDataChanged: () => void;
}

const EMPTY_FORM: Omit<StoredCard, 'id' | 'lastUpdated'> = {
  name: '',
  set: '',
  number: '',
  rawNok: 0,
  psa10Usd: 0,
  psa10Pop: 0,
  totalGraded: 0,
  gemRate: 0,
  finnAvgPrice: 0,
  finnListingsCount: 0,
};

function genId(name: string, set: string) {
  return `${name}-${set}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-muted-foreground font-mono">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-border"
      />
    </div>
  );
}

export function AdminPanel({ onDataChanged }: Props) {
  const [cards, setCards] = useState<StoredCard[]>(() => getCards());
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = useState(false);

  const reload = () => {
    setCards(getCards());
    onDataChanged();
  };

  const setField =
    (key: keyof typeof EMPTY_FORM) => (val: string) =>
      setForm(prev => ({ ...prev, [key]: key === 'name' || key === 'set' || key === 'number' ? val : Number(val) }));

  const handleAdd = () => {
    if (!form.name || !form.set) return;
    const card: StoredCard = {
      ...form,
      id: genId(form.name, form.set),
      lastUpdated: new Date().toISOString(),
    };
    addCard(card);
    setForm(EMPTY_FORM);
    setShowAddForm(false);
    reload();
  };

  const startEdit = (card: StoredCard) => {
    setEditId(card.id);
    setForm({
      name: card.name,
      set: card.set,
      number: card.number,
      rawNok: card.rawNok,
      psa10Usd: card.psa10Usd,
      psa10Pop: card.psa10Pop,
      totalGraded: card.totalGraded,
      gemRate: card.gemRate,
      finnAvgPrice: card.finnAvgPrice,
      finnListingsCount: card.finnListingsCount,
    });
  };

  const handleSaveEdit = (id: string) => {
    updateCard({ ...form, id, lastUpdated: new Date().toISOString() });
    setEditId(null);
    reload();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Slett dette kortet?')) return;
    deleteCard(id);
    reload();
  };

  const handleReset = () => {
    if (!confirm('Tilbakestill til standard dataseett?')) return;
    resetToSeed();
    reload();
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2.5 bg-muted border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Admin</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={() => { setShowAddForm(v => !v); setEditId(null); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Legg til
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="border-b border-border p-4 bg-secondary/40">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
            <FormField label="Navn" value={form.name} onChange={setField('name')} />
            <FormField label="Sett" value={form.set} onChange={setField('set')} />
            <FormField label="Nummer" value={form.number} onChange={setField('number')} />
            <FormField label="Rå kr" value={form.rawNok} onChange={setField('rawNok')} type="number" />
            <FormField label="PSA10 USD" value={form.psa10Usd} onChange={setField('psa10Usd')} type="number" />
            <FormField label="PSA10 Pop" value={form.psa10Pop} onChange={setField('psa10Pop')} type="number" />
            <FormField label="Totalt graded" value={form.totalGraded} onChange={setField('totalGraded')} type="number" />
            <FormField label="Gem Rate (0–1)" value={form.gemRate} onChange={setField('gemRate')} type="number" />
            <FormField label="Finn snitt kr" value={form.finnAvgPrice} onChange={setField('finnAvgPrice')} type="number" />
            <FormField label="Finn annonser" value={form.finnListingsCount} onChange={setField('finnListingsCount')} type="number" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded bg-foreground px-3 py-1.5 text-xs text-primary-foreground hover:opacity-80 transition-opacity"
            >
              <Check className="h-3 w-3" />
              Lagre
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Card list */}
      <div className="divide-y divide-border">
        {cards.map(card => (
          <div key={card.id}>
            {editId === card.id ? (
              <div className="p-4 bg-secondary/20">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
                  <FormField label="Navn" value={form.name} onChange={setField('name')} />
                  <FormField label="Sett" value={form.set} onChange={setField('set')} />
                  <FormField label="Nummer" value={form.number} onChange={setField('number')} />
                  <FormField label="Rå kr" value={form.rawNok} onChange={setField('rawNok')} type="number" />
                  <FormField label="PSA10 USD" value={form.psa10Usd} onChange={setField('psa10Usd')} type="number" />
                  <FormField label="PSA10 Pop" value={form.psa10Pop} onChange={setField('psa10Pop')} type="number" />
                  <FormField label="Totalt graded" value={form.totalGraded} onChange={setField('totalGraded')} type="number" />
                  <FormField label="Gem Rate (0–1)" value={form.gemRate} onChange={setField('gemRate')} type="number" />
                  <FormField label="Finn snitt kr" value={form.finnAvgPrice} onChange={setField('finnAvgPrice')} type="number" />
                  <FormField label="Finn annonser" value={form.finnListingsCount} onChange={setField('finnListingsCount')} type="number" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(card.id)}
                    className="flex items-center gap-1 rounded bg-foreground px-3 py-1.5 text-xs text-primary-foreground hover:opacity-80 transition-opacity"
                  >
                    <Check className="h-3 w-3" />
                    Lagre
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{card.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {card.set} · #{card.number} · {formatNok(card.rawNok)} rå · PSA10 ${card.psa10Usd.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(card)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-1 text-muted-foreground hover:text-negative transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
