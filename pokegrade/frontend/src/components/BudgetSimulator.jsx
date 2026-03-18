import React, { useState } from 'react';
import { fmtNok, fmtPct, roiColor } from '../utils/format.js';

export default function BudgetSimulator({ cards, onClose }) {
  const [budgetNok, setBudgetNok] = useState('');
  const [selected, setSelected] = useState({});

  const budget = parseFloat(budgetNok) || 0;

  function toggleCard(id) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const activeCards = cards.filter(c => selected[c.id] && c.raw_nok);
  const totalCost = activeCards.reduce((sum, c) => sum + c.raw_nok, 0);
  const remaining = budget - totalCost;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-pg-card border border-pg-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-pg-border">
          <h2 className="text-lg font-semibold text-white">Budsjettfordeling</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 border-b border-pg-border">
          <label className="text-sm text-gray-400 block mb-2">Budsjett (NOK)</label>
          <input
            type="number"
            value={budgetNok}
            onChange={e => setBudgetNok(e.target.value)}
            placeholder="F.eks. 50000"
            className="w-full bg-pg-bg border border-pg-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pg-accent text-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="text-sm text-gray-400 mb-3">Velg kort du vurderer aa kjope:</div>
          <div className="space-y-2">
            {cards.filter(c => c.raw_nok).map(card => {
              const isSelected = !!selected[card.id];
              const roiCls = roiColor(card.roi);
              return (
                <div
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-pg-accent bg-pg-accent/10' : 'border-pg-border hover:border-gray-500'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-pg-accent border-pg-accent' : 'border-gray-500'}`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div>
                      <div className="text-sm text-white">{card.name}</div>
                      <div className="text-xs text-gray-500">{card.set_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{fmtNok(card.raw_nok)}</div>
                    <div className={`text-xs ${roiCls}`}>ROI {fmtPct(card.roi)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {activeCards.length > 0 && (
          <div className="p-5 border-t border-pg-border bg-pg-bg rounded-b-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">Valgt</div>
                <div className="text-lg font-semibold text-white">{fmtNok(totalCost)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Gjenstaar</div>
                <div className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fmtNok(remaining)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Antall kort</div>
                <div className="text-lg font-semibold text-white">{activeCards.length}</div>
              </div>
            </div>
            {remaining < 0 && (
              <div className="mt-3 text-center text-xs text-red-400">
                Overskrider budsjett med {fmtNok(Math.abs(remaining))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
