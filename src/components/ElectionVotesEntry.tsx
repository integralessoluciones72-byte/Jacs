/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart3, Calculator, CheckCircle2, Layers } from 'lucide-react';
import { ElectionData, Plancha, ElectoralResult } from '../types';

interface Props {
  data: ElectionData;
  planchas: Plancha[];
  results: ElectoralResult;
  onDataChange: (newData: ElectionData) => void;
  onPlanchaUpdate: (updated: Plancha) => void;
}

export function ElectionVotesEntry({ data, planchas, results, onDataChange, onPlanchaUpdate }: Props) {
  const updateVoteField = (blockId: string, field: 'blankVotes' | 'nullVotes' | 'unmarkedVotes', value: number) => {
    onDataChange({
      ...data,
      [field]: { ...data[field], [blockId]: value }
    });
  };

  const handlePlanchaVoteChange = (plancha: Plancha, blockId: string, value: number) => {
    onPlanchaUpdate({
      ...plancha,
      votes: { ...plancha.votes, [blockId]: value }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="bg-gov-blue/10 p-2 rounded-lg text-gov-blue">
          <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-blue-900">Resultados Electorales</h2>
          <p className="text-[#6b7280] text-[12px]">Ingrese el conteo de votos final por cada bloque y plancha.</p>
        </div>
      </div>

      <div className="space-y-8">
        {data.blocks.map((block) => {
          const res = results.blockResults[block.id];
          return (
            <div key={block.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-blue-600 text-white px-4 py-2.5 flex justify-between items-center shadow-sm shadow-blue-200">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-gov-gold" />
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">{block.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-tight">
                  <span className="text-slate-400">Total Votos Válidos:</span>
                  <span className="text-gov-gold text-sm">{res?.totalValidVotes || 0}</span>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/30">
                {/* Plancha Votes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-1">
                    <Calculator size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Votos por Plancha</span>
                  </div>
                  <div className="space-y-2">
                    {planchas.map(plancha => (
                      <div key={plancha.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                        <span className="text-[12px] font-medium text-slate-700">{plancha.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={plancha.votes[block.id] || 0}
                            onChange={(e) => handlePlanchaVoteChange(plancha, block.id, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-mono text-sm focus:ring-1 focus:ring-gov-blue outline-none"
                          />
                          <span className="text-[10px] text-slate-400 font-bold w-12">votos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Control Votes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-1">
                    <CheckCircle2 size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Votos de Control</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-700">Voto en Blanco</span>
                        <span className="text-[10px] text-slate-400 uppercase">Suma al cuociente</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={data.blankVotes[block.id] || 0}
                        onChange={(e) => updateVoteField(block.id, 'blankVotes', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-mono text-sm focus:ring-1 focus:ring-gov-blue outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-700">Votos Nulos</span>
                        <span className="text-[10px] text-slate-400 uppercase">Sin valor electoral</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={data.nullVotes[block.id] || 0}
                        onChange={(e) => updateVoteField(block.id, 'nullVotes', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-mono text-sm focus:ring-1 focus:ring-gov-blue outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-700">No Marcados</span>
                        <span className="text-[10px] text-slate-400 uppercase">Sin valor electoral</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={data.unmarkedVotes[block.id] || 0}
                        onChange={(e) => updateVoteField(block.id, 'unmarkedVotes', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-mono text-sm focus:ring-1 focus:ring-gov-blue outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
