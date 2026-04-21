import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { poolsMock } from "./poolsMockDb";
import { createSystemEvent } from "./eventsApi";

import type { Match, MatchStatus, Team } from "../types/match";
import { recalcPoolPoints } from "./poolsApi";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const mid = () => `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;

function clampScore(n: number) {
  const x = Number.isFinite(n) ? Math.floor(n) : 0;
  return Math.max(0, Math.min(20, x));
}

function sealPredictionsForMatch(matchId: string) {
  const now = new Date().toISOString();
  for (const pr of mockDb.predictions) {
    if (pr.matchId !== matchId) continue;
    if (!pr.locked) {
      pr.locked = true;
      pr.lockedAt = now;
    }
  }
}

async function recalcAllPools() {
  for (const p of poolsMock) {
    await recalcPoolPoints(p.id);
  }
}

export type UsuarioSistema = {
  id: number;
  correoUsuario: string;
  nombre: string;
  apellido: string;
  rol: string;
};

export type RegistrarUsuarioPayload = {
  correoUsuario: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  rol: string;
};

export async function adminGetUsuarios(): Promise<UsuarioSistema[]> {
  if (!USE_MOCK) {
    return http.get<UsuarioSistema[]>("/api/usuarios/listar");
  }
  await sleep(150);
  return [];
}

export async function adminRegistrarUsuario(payload: RegistrarUsuarioPayload): Promise<UsuarioSistema> {
  if (!USE_MOCK) {
    return http.post<UsuarioSistema>("/api/usuarios/registrar", payload);
  }
  await sleep(200);
  return { id: Date.now(), ...payload };
}

export async function adminEliminarUsuario(id: number): Promise<void> {
  if (!USE_MOCK) {
    await http.delete(`/api/usuarios/${id}`);
    return;
  }
  await sleep(150);
}

export async function adminGetMatches(): Promise<Match[]> {
  if (!USE_MOCK) {
    return http.get<Match[]>("/admin/matches");
  }
  await sleep(150);
  return [...mockDb.matches];
}

export async function adminCreateMatch(payload: {
  home: Team;
  away: Team;
  city: string;
  stadium: string;
  startTimeISO: string;
  status?: MatchStatus;
  assignToAllPools?: boolean;
}): Promise<Match> {
  if (!USE_MOCK) {
    const created = await http.post<Match>("/admin/matches", payload);
    await createSystemEvent({
      type: "MATCH_STATUS_CHANGED",
      actorId: "admin",
      actorName: "Admin",
      entityType: "MATCH",
      entityId: created.id,
      message: `Partido creado: ${created.home.name} vs ${created.away.name}`,
      data: { city: created.city, stadium: created.stadium, startTimeISO: created.startTimeISO, status: created.status },
    });
    return created;
  }

  await sleep(200);
  const match: Match = {
    id: mid(),
    home: payload.home,
    away: payload.away,
    city: payload.city,
    stadium: payload.stadium,
    startTimeISO: payload.startTimeISO,
    status: payload.status ?? "SCHEDULED",
  };
  mockDb.matches.push(match);
  const assign = payload.assignToAllPools ?? true;
  if (assign) {
    for (const p of poolsMock) {
      if (!p.matchIds.includes(match.id)) p.matchIds.push(match.id);
    }
  }
  await createSystemEvent({
    type: "MATCH_STATUS_CHANGED",
    actorId: "admin",
    actorName: "Admin",
    entityType: "MATCH",
    entityId: match.id,
    message: `Partido creado: ${match.home.name} vs ${match.away.name}`,
    data: { city: match.city, stadium: match.stadium, startTimeISO: match.startTimeISO, status: match.status, assignToAllPools: assign },
  });
  return match;
}

export async function adminSetMatchStatus(matchId: string, status: MatchStatus): Promise<Match> {
  if (!USE_MOCK) {
    const match = await http.patch<Match>(`/admin/matches/${matchId}/status`, { status });
    await createSystemEvent({
      type: "MATCH_CREATED",
      actorId: "admin",
      actorName: "Admin",
      entityType: "MATCH",
      entityId: match.id,
      message: `Estado actualizado: ${match.home.name} vs ${match.away.name} → ${status}`,
      data: { status },
    });
    return match;
  }

  await sleep(150);
  const match = mockDb.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  match.status = status;
  if (status === "LIVE" || status === "FINISHED") sealPredictionsForMatch(matchId);
  if (status === "FINISHED" && match.score) await recalcAllPools();
  await createSystemEvent({
    type: "MATCH_CREATED",
    actorId: "admin",
    actorName: "Admin",
    entityType: "MATCH",
    entityId: match.id,
    message: `Estado actualizado: ${match.home.name} vs ${match.away.name} → ${status}`,
    data: { status },
  });
  return match;
}

export async function adminPublishResult(matchId: string, home: number, away: number): Promise<Match> {
  if (!USE_MOCK) {
    const match = await http.post<Match>(`/admin/matches/${matchId}/result`, { homeScore: home, awayScore: away });
    await createSystemEvent({
      type: "MATCH_RESULT_PUBLISHED",
      actorId: "admin",
      actorName: "Admin",
      entityType: "MATCH",
      entityId: match.id,
      message: `Resultado publicado: ${match.home.name} ${match.score?.home ?? 0} - ${match.score?.away ?? 0} ${match.away.name}`,
      data: { home: match.score?.home ?? 0, away: match.score?.away ?? 0 },
    });
    return match;
  }

  await sleep(200);
  const match = mockDb.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  const h = clampScore(home);
  const a = clampScore(away);
  match.score = { home: h, away: a };
  match.status = "FINISHED";
  sealPredictionsForMatch(matchId);
  await recalcAllPools();
  await createSystemEvent({
    type: "MATCH_RESULT_PUBLISHED",
    actorId: "admin",
    actorName: "Admin",
    entityType: "MATCH",
    entityId: match.id,
    message: `Resultado publicado: ${match.home.name} ${h} - ${a} ${match.away.name}`,
    data: { home: h, away: a },
  });
  return match;
}