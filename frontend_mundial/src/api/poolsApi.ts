

import { poolsMock } from "./poolsMockDb"; 

import { mockDb } from "./mockDb"; 
import { USE_MOCK } from "./config";
import { http } from "./http";

 

import type { Pool, User } from "../types/pool"; 

import type { Prediction } from "../types/prediction"; 

import type { Match } from "../types/match"; 

 

import { scorePrediction } from "./scoring"; 

 

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)); 

 

export async function recalcPoolPoints(poolId: string): Promise<void> { 

  await sleep(20); 

 

  const pool = poolsMock.find((p) => p.id === poolId); 

  if (!pool) return; 

 

  const matches: Match[] = mockDb.matches.filter((m) => pool.matchIds.includes(m.id)); 

  const preds: Prediction[] = mockDb.predictions.filter((p) => p.poolId === poolId); 

 

  const pointsByUser = new Map<string, number>(); 

 

  for (const pr of preds) { 

    const match = matches.find((m) => m.id === pr.matchId); 

    if (!match) continue; 

 

    if (match.status !== "FINISHED" || !match.score) continue; 

 

    const pts = scorePrediction(pr, match); 

    pointsByUser.set(pr.userId, (pointsByUser.get(pr.userId) ?? 0) + pts); 

  } 

 

  pool.members = pool.members.map((mem) => ({ 

    ...mem, 

    points: pointsByUser.get(mem.user.id) ?? 0, 

  })); 

} 

 

export async function getPools(): Promise<Pool[]> { 
  if (!USE_MOCK) return http.get<Pool[]>("/pools");


  await sleep(150); 

 

  for (const p of poolsMock) { 

    await recalcPoolPoints(p.id); 

  } 

 

  return poolsMock; 

} 

 

export async function createPool(name: string, user: User): Promise<Pool> { 
  if (!USE_MOCK) {
    void user;
    return http.post<Pool>("/pools", { name: name.trim() });
  }


  await sleep(150); 

 

  const trimmed = name.trim(); 

  if (!trimmed) throw new Error("El nombre de la polla es obligatorio"); 

 

  const newPool: Pool = { 

    id: "p" + Date.now(), 

    name: trimmed, 

    code: Math.random().toString(36).slice(2, 10).toUpperCase(), 

    matchIds: mockDb.matches.map((m) => m.id), 

    members: [ 

      { 

        user: { 

          id: user.id, 

          name: user.name, 

          stickers: user.stickers ?? [], 

          repeated: user.repeated ?? [], 

        }, 

        points: 0, 

      }, 

    ], 

  }; 

 

  poolsMock.push(newPool); 

  return newPool; 

} 

 

export async function joinPool(code: string, user: User): Promise<Pool | null> { 
  if (!USE_MOCK) {
    void user;
    return http.post<Pool>("/pools/join", { code: code.trim().toUpperCase() });
  }


  await sleep(150); 

 

  const pool = poolsMock.find((p) => p.code === code.trim().toUpperCase()); 

  if (!pool) return null; 

 

  const alreadyMember = pool.members.some((m) => m.user.id === user.id); 

 

  if (!alreadyMember) { 

    pool.members.push({ 

      user: { 

        id: user.id, 

        name: user.name, 

        stickers: user.stickers ?? [], 

        repeated: user.repeated ?? [], 

      }, 

      points: 0, 

    }); 

  } 

 

  await recalcPoolPoints(pool.id); 

  return pool; 

} 
