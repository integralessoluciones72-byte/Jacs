/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Trash2, Layers, Home, ArrowLeft, X } from 'lucide-react';
import { ElectionData, BlockConfig } from '../types';

interface ElectionConfigProps {
  data: ElectionData;
  onChange: (data: ElectionData) => void;
  onBack?: () => void;
}

const CORE_BLOCK_IDS = ['directivos', 'conciliadores', 'delegados', 'fiscal', 'comisiones'];

export function ElectionConfig({ data, onChange, onBack }: ElectionConfigProps) {
  const updateBlock = (id: string, field: keyof BlockConfig, value: any) => {
    onChange({
      ...data,
      blocks: data.blocks.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const removeBlock = (id: string) => {
    if (CORE_BLOCK_IDS.includes(id)) {
      alert('Este bloque es obligatorio y no puede eliminarse.');
      return;
    }
    onChange({
      ...data,
      blocks: data.blocks.filter(b => b.id !== id)
    });
  };

  const addSubCommission = (blockId: string) => {
    const block = data.blocks.find(b => b.id === blockId);
    if (!block) return;
    const labels = [...(block.cargoLabels || []), 'Nueva Comisión'];
    
    onChange({
      ...data,
      blocks: data.blocks.map(b => b.id === blockId ? { 
        ...b, 
        cargoLabels: labels, 
        seats: labels.length 
      } : b)
    });
  };

  const removeSubCommission = (blockId: string, index: number) => {
    const block = data.blocks.find(b => b.id === blockId);
    if (!block || !block.cargoLabels) return;
    const labels = block.cargoLabels.filter((_, i) => i !== index);
    
    onChange({
      ...data,
      blocks: data.blocks.map(b => b.id === blockId ? { 
        ...b, 
        cargoLabels: labels, 
        seats: Math.max(1, labels.length) 
      } : b)
    });
  };

  const updateSubCommission = (blockId: string, index: number, value: string) => {
    const block = data.blocks.find(b => b.id === blockId);
    if (!block || !block.cargoLabels) return;
    const labels = [...block.cargoLabels];
    labels[index] = value;
    updateBlock(blockId, 'cargoLabels', labels);
  };

  const handleStatsChange = (blockId: string, field: 'blankVotes' | 'nullVotes' | 'unmarkedVotes', value: string) => {
    onChange({
      ...data,
      [field]: {
        ...data[field],
        [blockId]: Math.max(0, parseInt(value) || 0)
      }
    });
  };

  return (
    <div className="space-y-6 no-print animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
         <div className="flex items-center gap-3">
           {onBack && (
            <div className="flex gap-2 mr-2">
              <button 
                onClick={onBack}
                title="Atrás"
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 hover:text-gov-blue transition-colors bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-md"
              >
                 <ArrowLeft size={14} /> Atrás
              </button>
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 hover:text-gov-blue transition-colors bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-md"
              >
                 <Home size={14} /> Menú Principal
              </button>
               <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-gov-red transition-colors bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-md"
              >
                 <X size={14} /> Cancelar
              </button>
            </div>
          )}
           <h2 className="text-[14px] font-bold text-[#1e40af] flex items-center gap-2">
             <Layers size={16} /> Parámetros por Bloque
           </h2>
         </div>
      </div>

      {/* JAC Info Section */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
             <label className="text-[10px] uppercase font-bold text-slate-500">Nombre de la Acción Comunal</label>
             <input 
               type="text" 
               placeholder="Ej: JAC Barrio El Centro"
               value={data.oacName}
               onChange={(e) => onChange({ ...data, oacName: e.target.value })}
               className="input-field py-2 text-[13px] font-bold"
             />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] uppercase font-bold text-slate-500">Municipio</label>
             <input 
               type="text" 
               placeholder="Ej: Bogotá D.C."
               value={data.municipality}
               onChange={(e) => onChange({ ...data, municipality: e.target.value })}
               className="input-field py-2 text-[13px] font-bold"
             />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.blocks.map(block => (
          <div key={block.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm relative group">
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-tighter">Nombre del Bloque</label>
                <div className="text-[13px] font-bold text-slate-800 uppercase">{block.name}</div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-tighter">Cargos/Curules</label>
                {(block.id === 'delegados' || !CORE_BLOCK_IDS.includes(block.id)) ? (
                   <input 
                      type="number"
                      value={block.seats}
                      onChange={(e) => updateBlock(block.id, 'seats', Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-[14px] font-bold text-gov-blue w-12 text-right bg-white border border-slate-200 rounded px-1 outline-none focus:border-gov-blue"
                   />
                ) : (
                  <div className="text-[14px] font-bold text-gov-blue">{block.seats}</div>
                )}
              </div>
            </div>

            {/* Gestión de Sub-Comisiones si aplica */}
            {block.id === 'comisiones' && (
              <div className="space-y-2 bg-white/50 p-3 rounded border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase italic">Categorías / Comisiones</span>
                  <button 
                    onClick={() => addSubCommission(block.id)}
                    className="text-gov-blue hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"
                  >
                    <Plus size={12} /> Añadir
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {block.cargoLabels?.map((label, idx) => (
                    <div key={idx} className="flex gap-1 group/item">
                       <input 
                         type="text" 
                         value={label}
                         onChange={(e) => updateSubCommission(block.id, idx, e.target.value)}
                         className="flex-1 text-[11px] bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-gov-blue"
                       />
                       <button 
                         onClick={() => removeSubCommission(block.id, idx)}
                         className="p-1 text-slate-400 hover:text-gov-red transition-colors"
                         title="Eliminar Comisión"
                       >
                         <Trash2 size={12} />
                       </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
