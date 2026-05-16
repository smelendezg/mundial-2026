import { USE_MOCK } from "./config";
import { http } from "./http";
import { poolsMock } from "./poolsMockDb";
import { mockDb } from "./mockDb";
import type { Pool } from "../types/pool";

interface ApuestaDTO {
  id: number;
  nombre: string;
  estado: string;
  codigoInvitacion: string;
  fechaCierre?: string;
  creadoPor: number;
}

interface ParticipacionDTO {
  id: number;
  usuarioId: number;
  apuestaId: number;
  puntos: number;
  posicionRanking?: number;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function mapApuesta(a: ApuestaDTO, members: ParticipacionDTO[]): Pool {
  return {
    id: a.id,
    name: a.nombre,
    code: a.codigoInvitacion,
    estado: a.estado,
    fechaCierre: a.fechaCierre,
    creadoPor: a.creadoPor,
    members: members.map((m) => ({
      usuarioId: m.usuarioId,
      nombre: "",
      puntos: m.puntos,
      posicionRanking: m.posicionRanking,
    })),
  };
}

export async function recalcPoolPoints(_poolId: string): Promise<void> {
  await sleep(20);
}

export async function getPools(usuarioId: number): Promise<Pool[]> {
  if (!USE_MOCK) {
    const apuestas = await http.get<ApuestaDTO[]>(
      `/api/apuestas/usuario/${usuarioId}`
    );
    const pools: Pool[] = await Promise.all(
      apuestas.map(async (a) => {
        const members = await http.get<ParticipacionDTO[]>(
          `/api/apuestas/participantes/${a.id}`
        );
        return mapApuesta(a, members);
      })
    );
    return pools;
  }

  await sleep(150);
  for (const p of poolsMock) await recalcPoolPoints(String(p.id));
  return poolsMock as any;
}

export async function obtenerApuesta(apuestaId: number): Promise<Pool> {
  if (!USE_MOCK) {
    const apuesta = await http.get<ApuestaDTO>(`/api/apuestas/${apuestaId}`);
    const members = await http.get<ParticipacionDTO[]>(
      `/api/apuestas/participantes/${apuestaId}`
    );
    return mapApuesta(apuesta, members);
  }
  await sleep(150);
  return (poolsMock.find((p) => String((p as any).id) === String(apuestaId)) ?? poolsMock[0]) as any;
}

export async function obtenerRanking(apuestaId: number): Promise<ParticipacionDTO[]> {
  if (!USE_MOCK) {
    return http.get<ParticipacionDTO[]>(`/api/apuestas/ranking/${apuestaId}`);
  }
  await sleep(150);
  return [];
}

export async function createPool(
  name: string,
  usuarioId: number,
  fechaCierre: string
): Promise<Pool> {
  if (!USE_MOCK) {
    const apuesta = await http.post<ApuestaDTO>("/api/apuestas/crear", {
      nombre: name.trim(),
      usuarioId,
      fechaCierre,
    });
    return mapApuesta(apuesta, []);
  }

  await sleep(150);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("El nombre de la polla es obligatorio");
  const newPool: any = {
    id: "p" + Date.now(),
    name: trimmed,
    code: Math.random().toString(36).slice(2, 10).toUpperCase(),
    matchIds: mockDb.matches.map((m) => m.id),
    members: [],
    estado: "ABIERTA",
    creadoPor: usuarioId,
  };
  poolsMock.push(newPool);
  return newPool;
}

export async function joinPool(
  code: string,
  usuarioId: number
): Promise<Pool | null> {
  if (!USE_MOCK) {
    try {
      const apuesta = await http.post<ApuestaDTO>(
        `/api/apuestas/unirse/${usuarioId}`,
        code.trim()
      );
      const members = await http.get<ParticipacionDTO[]>(
        `/api/apuestas/participantes/${apuesta.id}`
      );
      return mapApuesta(apuesta, members);
    } catch {
      return null;
    }
  }

  await sleep(150);
  const pool = poolsMock.find(
    (p) => (p as any).code === code.trim().toUpperCase()
  );
  if (!pool) return null;
  await recalcPoolPoints(String(pool.id));
  return pool as any;
}