import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";

import type { Profile } from "../types/profile";

const sleep = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();

type ProfileFallback = {
  name?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
};

type BackendProfile = {
  id: number;
  correoUsuario: string;
  nombre: string;
  apellido: string;
  rol: string;
};

type BackendPreferencia = {
  id: number;
  nombre: string;
};

function ensureProfile(userId: string, fallback: ProfileFallback = {}): Profile {
  let p = mockDb.profiles.find((x) => x.userId === userId);
  if (!p) {
    p = {
      userId,
      name: fallback.name ?? "Usuario",
      lastName: fallback.lastName ?? "",
      email: fallback.email ?? "",
      avatarUrl: fallback.avatarUrl,
      favoriteTeams: [],
      favoriteCities: [],
      notificationsEnabled: true,
      updatedAt: nowIso(),
    };
    mockDb.profiles.unshift(p);
  }
  return p;
}

export async function getMyProfile(
  userId: string,
  fallback?: ProfileFallback
): Promise<Profile> {
  if (!USE_MOCK) {
    const [res, selecciones, ciudades] = await Promise.all([
      http.get<BackendProfile>("/api/usuarios/perfil"),
      http.get<BackendPreferencia[]>("/api/usuarios/seleccionesFavoritas"),
      http.get<BackendPreferencia[]>("/api/usuarios/ciudadesFav"),
    ]);

    return {
      userId: String(res.id),
      name: res.nombre,
      lastName: res.apellido,
      email: res.correoUsuario,
      favoriteTeams: selecciones.map((s) => s.nombre),
      favoriteCities: ciudades.map((c) => c.nombre),
      notificationsEnabled: true,
      updatedAt: nowIso(),
    };
  }

  await sleep();
  return ensureProfile(userId, fallback);
}

export async function updateMyProfile(
  userId: string,
  patch: Partial<Omit<Profile, "userId" | "updatedAt">> & {
    contrasenaActual?: string;
    contrasenaNueva?: string;
    correoNuevo?: string;
  },
  fallback?: ProfileFallback
): Promise<Profile> {
  if (!USE_MOCK) {
    const payload: Record<string, string> = {};
    if (patch.name) payload.nombre = patch.name;
    if (patch.lastName) payload.apellido = patch.lastName;
    if (patch.correoNuevo) payload.correoNuevo = patch.correoNuevo;
    if (patch.contrasenaActual) payload.contrasenaActual = patch.contrasenaActual;
    if (patch.contrasenaNueva) payload.contrasenaNueva = patch.contrasenaNueva;

    await http.put("/api/usuarios/perfil", payload);
    return getMyProfile(userId, fallback);
  }

  await sleep();
  const p = ensureProfile(userId, fallback);
  Object.assign(p, patch);
  p.updatedAt = nowIso();
  return p;
}