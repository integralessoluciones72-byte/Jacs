/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plancha, ElectionData, ElectoralResult, PlanchaStat, BlockResult } from '../types';

export function calculateElectionResults(planchas: Plancha[], data: ElectionData): ElectoralResult {
  const blockResults: Record<string, BlockResult> = {};

  data.blocks.forEach(block => {
    const blankVotes = data.blankVotes[block.id] || 0;
    const planchaVotes = planchas.reduce((sum, p) => sum + (p.votes[block.id] || 0), 0);
    const totalValidVotes = planchaVotes + blankVotes;
    const seats = block.seats;

    if (seats <= 0) {
      blockResults[block.id] = {
        totalValidVotes,
        quotient: 0,
        stats: planchas.map(p => ({
          planchaId: p.id,
          planchaName: p.name,
          votes: p.votes[block.id] || 0,
          seatsByQuotient: 0,
          remainder: 0,
          totalSeats: 0
        }))
      };
      return;
    }

    const quotient = seats > 0 ? totalValidVotes / seats : 0;

    // Initial assignment by quotient
    let stats: PlanchaStat[] = planchas.map(p => {
      const votes = p.votes[block.id] || 0;
      const seatsByQuotient = quotient > 0 ? Math.floor(votes / quotient) : 0;
      const remainder = quotient > 0 ? votes % quotient : votes;
      return {
        planchaId: p.id,
        planchaName: p.name,
        votes,
        seatsByQuotient,
        remainder,
        totalSeats: seatsByQuotient
      };
    });

    // Assign remaining seats by largest remainder
    let assignedCount = stats.reduce((sum, s) => sum + s.seatsByQuotient, 0);
    let remainingSeats = seats - assignedCount;

    if (remainingSeats > 0) {
      // Sort by remainder descending
      const sortedIndices = [...Array(stats.length).keys()].sort((a, b) => stats[b].remainder - stats[a].remainder);
      
      for (let i = 0; i < Math.min(remainingSeats, stats.length); i++) {
          stats[sortedIndices[i]].totalSeats += 1;
      }
    }

    blockResults[block.id] = {
      totalValidVotes,
      quotient,
      stats
    };
  });

  return { blockResults };
}

export const INITIAL_BLOCKS = [
  { id: 'directivos', name: 'Bloque Directivo', seats: 4 },
  { id: 'conciliadores', name: 'Bloque Conciliadores', seats: 3 },
  { id: 'delegados', name: 'Bloque Delegados', seats: 3 },
  { id: 'fiscal', name: 'Bloque Fiscal', seats: 1 },
  { 
    id: 'comisiones', 
    name: 'Bloque Comisiones de Trabajo', 
    seats: 7, 
    cargoLabels: ['Empresarial', 'Educación', 'Salud', 'Obras', 'Cultura Recreación y Deportes', 'Juventud', 'Mujer'] 
  }
];

export const DIRECTIVO_CARGOS = ['Presidente (a)', 'Vicepresidente (a)', 'Tesorero (a)', 'Secretario (a)'];
export const CONCILIADOR_CARGOS = ['Conciliador (a) 1', 'Conciliador (a) 2', 'Conciliador (a) 3'];
export const DELEGADO_CARGOS = ['Delegado (a) 1', 'Delegado (a) 2', 'Delegado (a) 3'];
export const FISCAL_CARGOS = ['Fiscal'];
