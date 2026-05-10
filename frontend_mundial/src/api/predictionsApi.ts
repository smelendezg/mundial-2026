// src/api/predictionsApi.ts 

import { USE_MOCK } from "./config"; 

import { http } from "./http"; 

import { mockDb } from "./mockDb"; 

 

import type { Prediction } from "../types/prediction"; 

import type { Match } from "../types/match"; 

 

const sleep = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms)); 

const prid = () => `pr_${Date.now()}_${Math.random().toString(16).slice(2)}`; 

 

export const CLOSE_MINUTES_BEFORE = 10; 

 

function lockTimeMs(match: Match) { 

  const start = new Date(match.startTimeISO).getTime(); 

  return start - CLOSE_MINUTES_BEFORE * 60_000; 

} 

 

function isLocked(match: Match) { 

  // Cierra por tiempo y también si ya está LIVE/FINISHED 

  return ( 

    Date.now() >= lockTimeMs(match) || 

    match.status === "LIVE" || 

    match.status === "FINISHED" 

  ); 

} 

 

function clampScore(n: number) { 

  const v = Number.isFinite(n) ? n : 0; 

  return Math.max(0, Math.min(20, Math.floor(v))); 

} 

 

function sealForAudit(existing: Prediction | undefined) { 

  if (!existing) return; 

  if (!existing.locked) { 

    existing.locked = true; 

    existing.lockedAt = new Date().toISOString(); 

  } 

} 

 

export async function getPredictionsByPool(poolId: string): Promise<Prediction[]> { 

  if (!USE_MOCK) return http.get<Prediction[]>(`/pools/${poolId}/predictions`); 

  await sleep(); 

  return mockDb.predictions.filter((p) => p.poolId === poolId).slice(); 

} 

 

export async function getMyPredictions(poolId: string, userId: string): Promise<Prediction[]> { 

  if (!USE_MOCK) return http.get<Prediction[]>(`/pools/${poolId}/predictions/me`); 

  await sleep(); 

  return mockDb.predictions 

    .filter((p) => p.poolId === poolId && p.userId === userId) 

    .slice(); 

} 

 

/** 

 * Upsert con cierre: 

 * - si ya cerró -> NO deja crear/editar y si existía, lo sella (locked/lockedAt) 

 * - si está abierto -> crea o edita 

 */ 

export async function upsertPrediction( 

  poolId: string, 

  userId: string, 

  matchId: string, 

  homeScore: number, 

  awayScore: number 

): Promise<Prediction> { 

  if (!USE_MOCK) { 

    return http.post<Prediction>(`/pools/${poolId}/predictions`, { 

      matchId, 

      homeScore, 

      awayScore, 

    }); 

  } 

 

  await sleep(); 

 

  const match = mockDb.matches.find((m) => m.id === matchId); 

  if (!match) throw new Error("Match not found"); 

 

  const existing = mockDb.predictions.find( 

    (p) => p.poolId === poolId && p.userId === userId && p.matchId === matchId 

  ); 

 

  if (isLocked(match)) { 

    sealForAudit(existing); 

    throw new Error("Pronóstico cerrado (faltan <10 min o el partido ya inició/terminó)."); 

  } 

 

  const hs = clampScore(homeScore); 

  const as = clampScore(awayScore); 

 

  // crear 

  if (!existing) { 

    const created: Prediction = { 

      id: prid(), 

      poolId, 

      userId, 

      matchId, 

      homeScore: hs, 

      awayScore: as, 

      createdAt: new Date().toISOString(), 

      locked: false, 

    }; 

    mockDb.predictions.unshift(created); 

    return created; 

  } 

 

  // editar 

  if (existing.locked) throw new Error("Pronóstico bloqueado"); 

 

  existing.homeScore = hs; 

  existing.awayScore = as; 

  existing.updatedAt = new Date().toISOString(); 

  return existing; 

} 
