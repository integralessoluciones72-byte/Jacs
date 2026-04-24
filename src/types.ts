/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  name: string;
}

export interface BlockConfig {
  id: string;
  name: string;
  seats: number;
  cargoLabels?: string[]; // Optional specific names for each seat (e.g., "Salud", "Educación")
}

export interface Plancha {
  id: string;
  name: string;
  candidates: Record<string, Member[]>; // blockId -> lista de candidatos
  votes: Record<string, number>; // blockId -> votos de la plancha para ese bloque
}

export interface ElectionData {
  oacName: string;
  municipality: string;
  blocks: BlockConfig[];
  blankVotes: Record<string, number>; // blockId -> votos en blanco
  nullVotes: Record<string, number>; // blockId -> votos nulos
  unmarkedVotes: Record<string, number>; // blockId -> votos no marcados
}

export interface PlanchaStat {
  planchaId: string;
  planchaName: string;
  votes: number;
  seatsByQuotient: number;
  remainder: number;
  totalSeats: number;
}

export interface BlockResult {
  totalValidVotes: number;
  quotient: number;
  stats: PlanchaStat[];
}

export interface ElectoralResult {
  blockResults: Record<string, BlockResult>;
}
