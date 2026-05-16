import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";

import type { Prediction } from "../types/prediction";
import type { Match } from "../types/match";

const sleep = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms));
const prid = () => `pr_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const CLOSE_MINUTES_BEFORE = 10;


interface PronosticoDTO {
  id: number;
  resultadoPronosticado: string;
  golesLocalPronosticados: number;
  golesVisitantePronosticados: number;
  puntosObtenidos: number;
  usuarioId: number;
  apuestaId: number;
  partidoId: number;
}

interface PronosticoRequestBackend {
  usuarioId: number;
  apuestaId: number;
  partidoId: number;
  resultadoPronosticado: string;
  golesLocalPronosticados: number;
  golesVisitantePronosticados: number;
}


function mapPronostico(p: PronosticoDTO): Prediction {
  return {
    id: String(p.id),
    poolId: String(p.apuestaId),
    userId: String(p.usuarioId),
    matchId: String(p.partidoId),
    homeScore: p.golesLocalPronosticados,
    awayScore: p.golesVisitantePronosticados,
    points: p.puntosObtenidos,
    createdAt: new Date().toISOString(),
    locked: false,
  };
}

function buildResultado(homeScore: number, awayScore: number): string {
  if (homeScore > awayScore) return "LOCAL";
  if (awayScore > homeScore) return "VISITANTE";
  return "EMPATE";
}

function lockTimeMs(match: Match) {
  const start = new Date(match.startTimeISO).getTime();
  return start - CLOSE_MINUTES_BEFORE * 60_000;
}

function isLocked(match: Match) {
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
  if (!USE_MOCK) {
    const data = await http.get<PronosticoDTO[]>(`/api/apuestas/participantes/${poolId}`);
    return data.map(mapPronostico);
  }
  await sleep();
  return mockDb.predictions.filter((p) => p.poolId === poolId).slice();
}

export async function getMyPredictions(poolId: string, userId: string): Promise<Prediction[]> {
  if (!USE_MOCK) {
    const data = await http.get<PronosticoDTO[]>(
      `/api/apuestas/mis-pronosticos/${poolId}/${userId}`
    );
    return data.map(mapPronostico);
  }
  await sleep();
  return mockDb.predictions
    .filter((p) => p.poolId === poolId && p.userId === userId)
    .slice();
}

export async function upsertPrediction(
  poolId: string,
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<Prediction> {
  if (!USE_MOCK) {
    const body: PronosticoRequestBackend = {
      usuarioId: Number(userId),
      apuestaId: Number(poolId),
      partidoId: Number(matchId),
      resultadoPronosticado: buildResultado(homeScore, awayScore),
      golesLocalPronosticados: homeScore,
      golesVisitantePronosticados: awayScore,
    };
    const data = await http.post<PronosticoDTO>(`/api/apuestas/pronostico`, body);
    return mapPronostico(data);
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

  if (existing.locked) throw new Error("Pronóstico bloqueado");
  existing.homeScore = hs;
  existing.awayScore = as;
  existing.updatedAt = new Date().toISOString();
  return existing;
}

export async function editarPronostico(
  pronosticoId: string,
  homeScore: number,
  awayScore: number
): Promise<Prediction> {
  if (!USE_MOCK) {
    const body: Partial<PronosticoRequestBackend> = {
      resultadoPronosticado: buildResultado(homeScore, awayScore),
      golesLocalPronosticados: homeScore,
      golesVisitantePronosticados: awayScore,
    };
    const data = await http.put<PronosticoDTO>(
      `/api/apuestas/pronostico/${pronosticoId}`,
      body
    );
    return mapPronostico(data);
  }

  await sleep();
  const existing = mockDb.predictions.find((p) => p.id === pronosticoId);
  if (!existing) throw new Error("Pronóstico no encontrado");
  if (existing.locked) throw new Error("Pronóstico bloqueado");
  existing.homeScore = clampScore(homeScore);
  existing.awayScore = clampScore(awayScore);
  existing.updatedAt = new Date().toISOString();
  return existing;
}

export async function eliminarPronostico(pronosticoId: string): Promise<void> {
  if (!USE_MOCK) {
    await http.delete<void>(`/api/apuestas/pronostico/${pronosticoId}`);
    return;
  }

  await sleep();
  const idx = mockDb.predictions.findIndex((p) => p.id === pronosticoId);
  if (idx !== -1) mockDb.predictions.splice(idx, 1);
}