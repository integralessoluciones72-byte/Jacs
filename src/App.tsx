/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Plus, Calculator, Users as UsersIcon, LayoutPanelLeft, FileText, RotateCcw, BarChart3 } from 'lucide-react';
import { Header } from './components/Header';
import { PlanchaCard } from './components/PlanchaCard';
import { ElectionConfig } from './components/ElectionConfig';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ElectionVotesEntry } from './components/ElectionVotesEntry';
import { Plancha, ElectionData } from './types';
import { INITIAL_BLOCKS, calculateElectionResults } from './lib/electoral';

const STORAGE_KEY = 'asigna_curul_data';

const getInitialPlancha = (blocks: any[]): Omit<Plancha, 'id'> => ({
  name: '',
  candidates: blocks.reduce((acc, b) => ({ ...acc, [b.id]: Array.from({ length: b.seats }).map(() => ({ name: '' })) }), {}),
  votes: blocks.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {})
});

export default function App() {
  const [electionData, setElectionData] = useState<ElectionData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_config');
    return saved ? JSON.parse(saved) : {
      oacName: '',
      municipality: '',
      blocks: INITIAL_BLOCKS,
      blankVotes: {},
      nullVotes: {},
      unmarkedVotes: {}
    };
  });

  const [planchas, setPlanchas] = useState<Plancha[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_planchas');
    return saved ? JSON.parse(saved) : [
      { ...getInitialPlancha(electionData.blocks), id: 'plancha_1', name: 'Plancha 1' }
    ];
  });

  const [view, setView] = useState<'edit' | 'config' | 'results' | 'votes'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_view');
    return (saved as any) || 'config';
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_config', JSON.stringify(electionData));
    localStorage.setItem(STORAGE_KEY + '_planchas', JSON.stringify(planchas));
    localStorage.setItem(STORAGE_KEY + '_view', view);
  }, [electionData, planchas, view]);

  const resetData = () => {
    if (confirm('¿Está seguro de borrar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleElectionDataChange = (newData: ElectionData) => {
    setElectionData(newData);
    
    // Sync candidates slots in all planchas if seats changed
    setPlanchas(currentPlanchas => currentPlanchas.map(plancha => {
      const updatedCandidates = { ...plancha.candidates };
      let hasChanges = false;

      newData.blocks.forEach(block => {
        const currentCandidates = updatedCandidates[block.id] || [];
        if (currentCandidates.length !== block.seats) {
          hasChanges = true;
          if (currentCandidates.length < block.seats) {
            // Add slots
            const diff = block.seats - currentCandidates.length;
            updatedCandidates[block.id] = [...currentCandidates, ...Array.from({ length: diff }).map(() => ({ name: '' }))];
          } else {
            // Remove slots
            updatedCandidates[block.id] = currentCandidates.slice(0, block.seats);
          }
        }
      });

      return hasChanges ? { ...plancha, candidates: updatedCandidates } : plancha;
    }));
  };

  const addPlancha = () => {
    const nextId = `plancha_${Date.now()}`;
    setPlanchas([...planchas, { ...getInitialPlancha(electionData.blocks), id: nextId, name: `Plancha ${planchas.length + 1}` }]);
  };

  const updatePlancha = (updated: Plancha) => {
    setPlanchas(planchas.map(p => (p.id === updated.id ? updated : p)));
  };

  const deletePlancha = (id: string) => {
    if (planchas.length > 1) {
      setPlanchas(planchas.filter(p => p.id !== id));
    }
  };

  const results = calculateElectionResults(planchas, electionData);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] overflow-x-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-[220px_1fr_300px] gap-4 p-2 sm:p-4 overflow-hidden lg:h-[calc(100vh-48px)]">
        {/* Sidebar Navigation */}
        <aside className="bg-white rounded-lg border border-[#e5e7eb] p-3 flex flex-row lg:flex-col gap-2 no-print overflow-x-auto lg:overflow-y-auto lg:h-full sticky top-0 z-20 lg:static">
          <span className="section-title hidden lg:block">Menú Principal</span>
          <button
            onClick={() => setView('config')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all font-medium text-[12px] sm:text-[13px] text-left whitespace-nowrap lg:w-full ${
              view === 'config' ? 'bg-[#eff6ff] text-[#1e40af]' : 'text-[#4b5563] hover:bg-slate-50'
            }`}
          >
            <LayoutPanelLeft size={16} />
            Organización Comunitaria
          </button>
          <button
            onClick={() => setView('edit')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all font-medium text-[12px] sm:text-[13px] text-left whitespace-nowrap lg:w-full ${
              view === 'edit' ? 'bg-[#eff6ff] text-[#1e40af]' : 'text-[#4b5563] hover:bg-slate-50'
            }`}
          >
            <UsersIcon size={16} />
            Inscribir Planchas
          </button>
          <button
            onClick={() => setView('votes')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all font-medium text-[12px] sm:text-[13px] text-left whitespace-nowrap lg:w-full ${
              view === 'votes' ? 'bg-[#eff6ff] text-[#1e40af]' : 'text-[#4b5563] hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={16} />
            Resultados Electorales
          </button>
          <button
            onClick={() => setView('results')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all font-medium text-[12px] sm:text-[13px] text-left whitespace-nowrap lg:w-full ${
              view === 'results' ? 'bg-[#eff6ff] text-[#1e40af]' : 'text-[#4b5563] hover:bg-slate-50'
            }`}
          >
            <Calculator size={16} />
            Escrutinio General
          </button>
          
          <button
            onClick={resetData}
            className="flex lg:hidden items-center gap-2.5 px-3 py-2 rounded-md transition-all font-medium text-[12px] sm:text-[13px] text-left whitespace-nowrap text-red-600 hover:bg-red-50"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>

          <div className="hidden lg:flex mt-4 pt-4 border-t border-slate-100 flex-col gap-1">
             <button 
                onClick={resetData}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-md transition-all font-medium text-[13px] text-left w-full text-gov-red hover:bg-red-50"
             >
                <RotateCcw size={16} />
                Reiniciar Aplicación
             </button>
          </div>

          <div className="hidden lg:flex mt-auto pt-4 flex-col gap-1">
             <span className="section-title">Estado del Proceso</span>
             <div className="p-2.5 bg-[#fef3c7] rounded-md text-[11px] text-[#92400e] leading-relaxed border border-[#fde68a]">
               <b>OPERACIÓN:</b> <br /> 
               {view === 'edit' ? 'Candidaturas y Planchas.' : view === 'config' ? 'Parámetros Elección.' : view === 'votes' ? 'Registro de Resultados.' : 'Generación de Acta.'}
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="bg-white rounded-lg border border-[#e5e7eb] p-3 sm:p-4 flex flex-col gap-4 overflow-y-auto lg:h-full scroll-smooth">
          {view === 'edit' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h2 className="text-[16px] font-bold text-blue-900">Suscripción de Planchas</h2>
                  <p className="text-[#6b7280] text-[12px]">Registre los nombres y candidatos de cada plancha participante.</p>
                </div>
                <button
                  onClick={addPlancha}
                  className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Plus size={14} />
                  Añadir Plancha
                </button>
              </div>

              <div className="space-y-6">
                {planchas.map((plancha) => (
                  <PlanchaCard
                    key={plancha.id}
                    plancha={plancha}
                    blocks={electionData.blocks}
                    onUpdate={updatePlancha}
                    onDelete={() => deletePlancha(plancha.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {view === 'config' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-[16px] font-bold text-blue-900">Configuración Orgánica de la OAC</h2>
                <p className="text-[#6b7280] text-[12px]">Defina los bloques y el número de cargos a proveer.</p>
              </div>
              <ElectionConfig 
                data={electionData} 
                onChange={handleElectionDataChange} 
              />
            </div>
          )}

          {view === 'votes' && (
            <ElectionVotesEntry 
              data={electionData}
              planchas={planchas}
              results={results}
              onDataChange={handleElectionDataChange}
              onPlanchaUpdate={updatePlancha}
            />
          )}

          {view === 'results' && (
             <ResultsDisplay 
               planchas={planchas} 
               electionData={electionData} 
             />
          )}
        </section>

        {/* Summary Side Panel */}
        <aside className="bg-white rounded-lg border border-[#e5e7eb] p-4 flex flex-col gap-4 no-print overflow-y-auto lg:h-full">
          <div className="flex items-center justify-between">
            <span className="section-title">En Tiempo Real</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Activo</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {electionData.blocks.map(block => {
              const res = results.blockResults[block.id];
              return (
                <div key={block.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-2.5 space-y-1.5">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-500 uppercase truncate pr-2">{block.name}</span>
                     <span className="text-[9px] font-mono bg-gov-blue/10 text-gov-blue px-1.5 py-0.5 rounded">
                       C: {res?.quotient.toFixed(1)}
                     </span>
                   </div>
                   <div className="space-y-1">
                      {res?.stats.filter(s => s.totalSeats > 0).map(s => (
                        <div key={s.planchaId} className="flex justify-between items-center text-[11px]">
                           <span className="truncate flex-1 text-slate-600">{s.planchaName}</span>
                           <span className="font-bold text-gov-blue">{s.totalSeats} curules</span>
                        </div>
                      ))}
                      {res?.stats.every(s => s.totalSeats === 0) && (
                        <div className="text-[10px] italic text-slate-400">Esperando votos...</div>
                      )}
                   </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-2">
             <button onClick={() => setView('results')} className="btn-secondary w-full flex items-center justify-center gap-2 text-[12px]">
                <Calculator size={14} /> Ver Informe Completo
             </button>
             <button 
                onClick={() => {
                  setView('results');
                  setTimeout(() => window.print(), 100);
                }}
                className="btn-primary w-full bg-[#059669] hover:bg-[#047857] flex items-center justify-center gap-2 text-[12px]"
              >
                <Plus size={14} /> Imprimir Acta Final
             </button>
             <div className="text-[10px] text-[#9ca3af] text-center mt-2 leading-tight">
               Escrutinio basado en Cociente Electoral <br /> v2.2.0 - 2024
             </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
