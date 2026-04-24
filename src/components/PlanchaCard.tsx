/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, UserPlus, Users, Calculator } from 'lucide-react';
import { Plancha, BlockConfig } from '../types';
import { DIRECTIVO_CARGOS, CONCILIADOR_CARGOS, DELEGADO_CARGOS, FISCAL_CARGOS } from '../lib/electoral';

interface PlanchaCardProps {
  plancha: Plancha;
  blocks: BlockConfig[];
  onUpdate: (plancha: Plancha) => void;
  onDelete: () => void;
}

export const PlanchaCard: React.FC<PlanchaCardProps> = ({ plancha, blocks, onUpdate, onDelete }) => {
  const updateCandidate = (blockId: string, index: number, val: string) => {
    const blockCandidates = [...(plancha.candidates[blockId] || [])];
    if (!blockCandidates[index]) {
      blockCandidates[index] = { name: '' };
    }
    blockCandidates[index] = { ...blockCandidates[index], name: val };
    
    onUpdate({
      ...plancha,
      candidates: {
        ...plancha.candidates,
        [blockId]: blockCandidates
      }
    });
  };

  const updateVotes = (blockId: string, val: string) => {
    onUpdate({
      ...plancha,
      votes: {
        ...plancha.votes,
        [blockId]: Math.max(0, parseInt(val) || 0)
      }
    });
  };

  const getCargoName = (block: BlockConfig, index: number) => {
    if (block.id === 'directivos') return DIRECTIVO_CARGOS[index] || `Dignatario ${index + 1}`;
    if (block.id === 'conciliadores') return CONCILIADOR_CARGOS[index] || `Conciliador ${index + 1}`;
    if (block.id === 'delegados') return DELEGADO_CARGOS[index] || `Delegado ${index + 1}`;
    if (block.id === 'fiscal') return FISCAL_CARGOS[index] || `Fiscal ${index + 1}`;
    
    // Si el bloque tiene sus propias etiquetas (como Comisiones)
    if (block.cargoLabels && block.cargoLabels[index]) {
      return block.cargoLabels[index];
    }
    
    return `Candidato ${index + 1}`;
  };

  return (
    <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-md p-3 animate-in fade-in duration-500 shadow-sm">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 border-b border-white pb-2 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto">
           <span className="bg-[#1e40af] text-white text-[9px] sm:text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shadow-sm flex-shrink-0">
             Plancha #{plancha.id.slice(-3)}
           </span>
           <input
             type="text"
             value={plancha.name}
             onChange={(e) => onUpdate({ ...plancha, name: e.target.value })}
             className="bg-transparent font-bold text-[13px] sm:text-[14px] text-[#111827] focus:outline-none border-b border-transparent focus:border-gov-blue flex-1 min-w-0"
           />
        </div>
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-gov-red transition-colors no-print p-1 self-end xs:self-auto"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {blocks.map(block => (
          <div key={block.id} className="space-y-4 bg-white/50 p-2 sm:p-2.5 rounded border border-slate-100">
            <div className="flex justify-between items-center bg-blue-600 text-white px-2 py-1.5 rounded-sm shadow-sm shadow-blue-100">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">{block.name}</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 customize-scrollbar">
              {Array.from({ length: block.seats }).map((_, idx) => (
                <div key={`${block.id}_${idx}`} className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">
                    {getCargoName(block, idx)}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={plancha.candidates[block.id]?.[idx]?.name || ''}
                      onChange={(e) => updateCandidate(block.id, idx, e.target.value)}
                      placeholder="Nombre del candidato"
                      className="input-field py-1 pr-6"
                    />
                    <UserPlus size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
