// src/api/matchesApi.ts 

import { USE_MOCK } from "./config"; 

import { http } from "./http"; 

import { mockDb } from "./mockDb"; 

import type { Match } from "../types/match"; 

 

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms)); 

 

export async function getMatches(): Promise<Match[]> { 

  if (!USE_MOCK) { 

    return http.get<Match[]>("/matches"); 

  } 

 

  await sleep(200); 

  return [...mockDb.matches]; 

} 

 

 

 