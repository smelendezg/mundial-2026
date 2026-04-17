// src/api/poolsScoring.ts 

 

import { poolsMock } from "./poolsMockDb"; 

import { mockDb } from "./mockDb"; 

import type { Prediction } from "../types/prediction"; 

import type { Match } from "../types/match"; 

import { scorePrediction } from "./scoring"; 

 

/** 

 * Recalcula puntos y resultado por predicción 

 * y persiste en: 

 * - prediction.points 

 * - prediction.result 

 * - pool.members[].points 

 */ 

export async function recalcPoolPoints(poolId: string): Promise<void> { 

  const pool = poolsMock.find((p) => p.id === poolId); 

  if (!pool) return; 

 

  const matches: Match[] = mockDb.matches.filter((m) => 

    pool.matchIds.includes(m.id) 

  ); 

 

  const preds: Prediction[] = mockDb.predictions.filter( 

    (p) => p.poolId === poolId 

  ); 

 

  const pointsByUser = new Map<string, number>(); 

 

  for (const pr of preds) { 

    const match = matches.find((m) => m.id === pr.matchId); 

    if (!match) continue; 

 

    // Solo si terminó y hay score 

    if (match.status !== "FINISHED" || !match.score) { 

      pr.result = "PENDING"; 

      pr.points = 0; 

      continue; 

    } 

 

    const pts = scorePrediction(pr, match); 

    pr.points = pts; 

 

    // 🎯 RESULT CORRECTO SEGÚN TU TIPO 

    if (pts === 3) { 

      // exact score 

      pr.result = "WIN"; 

    } else if (pts === 1) { 

      // acertó ganador/empate pero no marcador exacto 

      pr.result = outcome(match.score.home, match.score.away); 

    } else { 

      pr.result = "LOSS"; 

    } 

 

    pointsByUser.set(pr.userId, (pointsByUser.get(pr.userId) ?? 0) + pts); 

  } 

 

  // Persistir ranking en miembros 

  pool.members = pool.members.map((mem) => ({ 

    ...mem, 

    points: pointsByUser.get(mem.user.id) ?? 0, 

  })); 

} 

 

function outcome(h: number, a: number): "WIN" | "DRAW" | "LOSS" { 

  if (h > a) return "WIN"; 

  if (h < a) return "LOSS"; 

  return "DRAW"; 

} 