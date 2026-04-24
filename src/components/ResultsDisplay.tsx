/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Printer, Calculator, FileText, CheckCircle2, Users, Layers, ArrowLeft, Home, Download } from 'lucide-react';
import { Plancha, ElectionData } from '../types';
import { calculateElectionResults, DIRECTIVO_CARGOS, CONCILIADOR_CARGOS, DELEGADO_CARGOS, FISCAL_CARGOS } from '../lib/electoral';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultsDisplayProps {
  planchas: Plancha[];
  electionData: ElectionData;
  onBack?: () => void;
}

export function ResultsDisplay({ planchas, electionData, onBack }: ResultsDisplayProps) {
  const results = calculateElectionResults(planchas, electionData);

  const getCargoName = (block: any, index: number) => {
    const blockId = block.id;
    if (blockId === 'directivos') return DIRECTIVO_CARGOS[index] || `Dignatario ${index + 1}`;
    if (blockId === 'conciliadores') return CONCILIADOR_CARGOS[index] || `Conciliador (a) ${index + 1}`;
    if (blockId === 'delegados') return DELEGADO_CARGOS[index] || `Delegado (a) ${index + 1}`;
    if (blockId === 'fiscal') return FISCAL_CARGOS[index] || `Fiscal ${index + 1}`;
    
    if (block.cargoLabels && block.cargoLabels[index]) {
      return block.cargoLabels[index];
    }
    
    return `Candidato ${index + 1}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(16);
    doc.text('ACTA DE ESCRUTINIO Y ASIGNACIÓN DE CURULES', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(electionData.oacName || 'ORGANISMO DE ACCIÓN COMUNAL', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(electionData.municipality || 'MUNICIPIO', pageWidth / 2, 34, { align: 'center' });
    doc.line(pageWidth / 2 - 10, 38, pageWidth / 2 + 10, 38);

    let currentY = 45;

    electionData.blocks.forEach((block, bIdx) => {
      const res = results.blockResults[block.id];
      if (!res) return;

      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFillColor(37, 99, 235); // Blue 600
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`BLOQUE ${bIdx + 1}: ${block.name.toUpperCase()}`, 18, currentY + 5);
      doc.setTextColor(0, 0, 0);
      currentY += 12;

      // Stats Table
      autoTable(doc, {
        startY: currentY,
        head: [['Concepto', 'Valor']],
        body: [
          ['Cuociente Electoral', res.quotient.toFixed(2)],
          ['Votos Válidos', res.totalValidVotes.toString()],
          ['Votos en Blanco', (electionData.blankVotes[block.id] || 0).toString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 8 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: pageWidth / 2 + 5 }
      });

      // Planchas Table
      autoTable(doc, {
        startY: currentY,
        head: [['Plancha', 'Votos', 'Curules']],
        body: res.stats.map(s => [s.planchaName, s.votes.toString(), s.totalSeats.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 8 },
        styles: { fontSize: 9 },
        margin: { left: pageWidth / 2 + 5, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // Assignment Logic
      const allAssigned: { planchaId: string, seatIdxInPlancha: number }[] = [];
      res.stats.forEach(s => {
        for(let i=0; i < s.seatsByQuotient; i++) {
          allAssigned.push({ planchaId: s.planchaId, seatIdxInPlancha: i });
        }
      });
      const sortedStats = [...res.stats].sort((a,b) => b.remainder - a.remainder);
      let assignedCount = res.stats.reduce((a,b) => a + b.seatsByQuotient, 0);
      let remaining = block.seats - assignedCount;
      for(let i=0; i < Math.min(remaining, sortedStats.length); i++) {
        const s = sortedStats[i];
        if (s) allAssigned.push({ planchaId: s.planchaId, seatIdxInPlancha: s.seatsByQuotient });
      }

      const assignedBody = Array.from({ length: block.seats }).map((_, seatIdx) => {
        const assignment = allAssigned[seatIdx];
        const assignedPlancha = assignment ? planchas.find(p => p.id === assignment.planchaId) : null;
        const candidate = (assignedPlancha && assignment) ? assignedPlancha.candidates[block.id]?.[assignment.seatIdxInPlancha] : null;
        return [getCargoName(block, seatIdx), candidate?.name || '---', assignedPlancha?.name || '---'];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Cargo', 'Candidato', 'Origen']],
        body: assignedBody,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 9 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    });

    // Signature Area
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY > pageHeight - 60) doc.addPage();
    currentY = pageHeight - 50;
    
    doc.setFontSize(7);
    
    // Row 1: Tribunal (3)
    doc.line(20, currentY, 65, currentY);
    doc.line(80, currentY, 125, currentY);
    doc.line(140, currentY, 185, currentY);
    doc.text('MIEMBRO TRIBUNAL', 42.5, currentY + 4, { align: 'center' });
    doc.text('DE GARANTÍAS', 42.5, currentY + 7, { align: 'center' });
    doc.text('MIEMBRO TRIBUNAL', 102.5, currentY + 4, { align: 'center' });
    doc.text('DE GARANTÍAS', 102.5, currentY + 7, { align: 'center' });
    doc.text('MIEMBRO TRIBUNAL', 162.5, currentY + 4, { align: 'center' });
    doc.text('DE GARANTÍAS', 162.5, currentY + 7, { align: 'center' });

    // Row 2: Officers (2)
    currentY += 20;
    doc.line(50, currentY, 95, currentY);
    doc.line(115, currentY, 160, currentY);
    doc.text('PRESIDENTE(A)', 72.5, currentY + 4, { align: 'center' });
    doc.text('SECRETARIO(A)', 137.5, currentY + 4, { align: 'center' });

    doc.save(`Acta_Escrutinio_${electionData.oacName.replace(/\s+/g, '_')}.pdf`);
    
    // Auto-send copy to email
    const pdfBase64 = doc.output('datauristring');
    try {
      fetch('/api/send-acta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64, oacName: electionData.oacName })
      });
    } catch (err) {
      console.error("Error enviando copia automática:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap justify-between items-center gap-4 no-print bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          {onBack && (
            <div className="flex gap-2">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 hover:text-gov-blue transition-colors bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-md"
              >
                 <ArrowLeft size={14} /> Atrás
              </button>
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 hover:text-gov-blue transition-colors bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-md"
              >
                 <Home size={14} /> Inicio
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-md border border-slate-200 text-[12px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={16} />
            Imprimir Pantalla
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-gov-blue text-white px-4 py-2 rounded-md text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            <Download size={16} />
            Descargar Acta PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-4 sm:p-8 md:p-12 shadow-sm rounded-lg print:border-none print:p-0 print:shadow-none overflow-x-auto">
        <div className="text-center mb-6 sm:mb-10 space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-blue-900 px-2">Acta de Escrutinio y Asignación de Curules</h1>
          <p className="text-[12px] sm:text-sm font-bold text-blue-700 uppercase tracking-widest px-2">{electionData.oacName || 'Nombre de la JAC no definido'}</p>
          <p className="text-[9px] sm:text-[10px] font-bold text-gov-blue uppercase tracking-[0.2em]">{electionData.municipality || 'Municipio no definido'}</p>
          <div className="h-0.5 w-16 bg-gov-gold mx-auto mt-4"></div>
        </div>

        {electionData.blocks.map((block, bIdx) => {
          const res = results.blockResults[block.id];
          if (!res) return null;

          const totalVotesBlock = res.totalValidVotes + (electionData.nullVotes[block.id] || 0) + (electionData.unmarkedVotes[block.id] || 0);

          return (
            <div key={block.id} className="mb-12 sm:mb-16 last:mb-0 break-inside-avoid">
              <div className="flex items-center gap-3 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-sm mb-4 sm:mb-6 shadow-sm shadow-blue-200">
                <Layers size={16} className="text-gov-gold" />
                <h3 className="font-bold uppercase text-[10px] sm:text-[12px] tracking-widest">
                  Bloque {bIdx + 1}: {block.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
                 <div className="space-y-4">
                    <h4 className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 border-b pb-1">Estadísticas del Bloque</h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                       <div className="bg-slate-50 p-1.5 sm:p-2 rounded border border-slate-100 flex flex-col items-center">
                          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Cuociente</span>
                          <span className="font-mono font-bold text-[12px] sm:text-sm">{res.quotient.toFixed(2)}</span>
                       </div>
                       <div className="bg-slate-50 p-1.5 sm:p-2 rounded border border-slate-100 flex flex-col items-center">
                          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Votos</span>
                          <span className="font-mono font-bold text-[12px] sm:text-sm">{res.totalValidVotes}</span>
                       </div>
                       <div className="bg-slate-50 p-1.5 sm:p-2 rounded border border-slate-100 flex flex-col items-center">
                          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Cargos</span>
                          <span className="font-mono font-bold text-[12px] sm:text-sm">{block.seats}</span>
                       </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] sm:text-[12px]">
                         <thead className="bg-[#f8fafc] border-b">
                            <tr>
                               <th className="py-2 text-left">Plancha</th>
                               <th className="py-2 text-right">Votos</th>
                               <th className="py-2 text-right">Curules</th>
                            </tr>
                         </thead>
                         <tbody>
                            {res.stats.map(s => (
                               <tr key={s.planchaId} className="border-b last:border-0 border-slate-50">
                                  <td className="py-2 font-medium">{s.planchaName}</td>
                                  <td className="py-2 text-right font-mono">{s.votes}</td>
                                  <td className="py-2 text-right font-bold text-[#1e40af]">{s.totalSeats}</td>
                               </tr>
                            ))}
                            <tr className="bg-slate-50/50">
                               <td className="py-2 text-slate-500 italic">Voto Blanco</td>
                               <td className="py-2 text-right font-mono">{electionData.blankVotes[block.id] || 0}</td>
                               <td></td>
                            </tr>
                         </tbody>
                      </table>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 border-b pb-1">Cargos Asignados</h4>
                    <div className="space-y-1.5 lg:max-h-[500px] lg:overflow-y-auto lg:pr-2 customize-scrollbar">
                       {(() => {
                          const allAssigned: { planchaId: string, seatIdxInPlancha: number }[] = [];
                          
                          res.stats.forEach(s => {
                            for(let i=0; i < s.seatsByQuotient; i++) {
                                allAssigned.push({ planchaId: s.planchaId, seatIdxInPlancha: i });
                            }
                          });
                          
                          let assignedByQuotient = res.stats.reduce((a,b) => a + b.seatsByQuotient, 0);
                          let remainingToAssign = block.seats - assignedByQuotient;
                          if (remainingToAssign > 0) {
                             const sortedStats = [...res.stats].sort((a,b) => b.remainder - a.remainder);
                             for(let i=0; i < Math.min(remainingToAssign, sortedStats.length); i++) {
                                const s = sortedStats[i];
                                if (s) {
                                   allAssigned.push({ planchaId: s.planchaId, seatIdxInPlancha: s.seatsByQuotient });
                                }
                             }
                          }

                          return Array.from({ length: block.seats }).map((_, seatIdx) => {
                            const assignment = allAssigned[seatIdx];
                            const assignedPlancha = assignment ? planchas.find(p => p.id === assignment.planchaId) : null;
                            const candidate = (assignedPlancha && assignment) ? assignedPlancha.candidates[block.id]?.[assignment.seatIdxInPlancha] : null;

                            return (
                               <div key={seatIdx} className="flex border border-slate-100 rounded bg-white overflow-hidden text-[10px] sm:text-[11px] print:text-[9px]">
                                  <div className="w-24 sm:w-32 bg-slate-100 px-2 py-1.5 font-bold border-r border-slate-200 flex-shrink-0">
                                     {getCargoName(block, seatIdx)}
                                  </div>
                                  <div className="flex-1 px-2 sm:px-3 py-1.5 font-bold text-slate-800 break-words">
                                     {candidate?.name || <span className="text-slate-300 font-normal italic">Sin Proveer</span>}
                                  </div>
                                  <div className="w-20 sm:w-24 px-1.5 sm:px-2 py-1.5 bg-gov-blue/5 text-gov-blue font-bold text-[8px] sm:text-[9px] uppercase border-l italic flex-shrink-0">
                                     {assignedPlancha?.name || 'Vacante'}
                                  </div>
                               </div>
                            );
                          });
                       })()}
                    </div>
                 </div>
              </div>
            </div>
          );
        })}

        <div className="mt-12 sm:mt-20 space-y-16 print:mt-10">
            {/* Top Row: Tribunal (3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center no-break">
                <div className="flex flex-col items-center">
                    <div className="border-t border-slate-900 w-44 pt-2"></div>
                    <p className="text-[10px] font-bold uppercase leading-tight">Miembro <br/> Tribunal de Garantías</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t border-slate-900 w-44 pt-2"></div>
                    <p className="text-[10px] font-bold uppercase leading-tight">Miembro <br/> Tribunal de Garantías</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t border-slate-900 w-44 pt-2"></div>
                    <p className="text-[10px] font-bold uppercase leading-tight">Miembro <br/> Tribunal de Garantías</p>
                </div>
            </div>

            {/* Bottom Row: Officers (2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-center no-break max-w-2xl mx-auto">
                <div className="flex flex-col items-center">
                    <div className="border-t border-slate-900 w-48 pt-2"></div>
                    <p className="text-[10px] font-bold uppercase leading-tight">Presidente(a)</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t border-slate-900 w-48 pt-2"></div>
                    <p className="text-[10px] font-bold uppercase leading-tight">Secretario(a)</p>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center text-[9px] text-slate-400 font-mono italic">
            Documento firmado electrónicamente bajo los lineamientos de la Ley 2166. ID: {Date.now().toString(36).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

