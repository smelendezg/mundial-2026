// src/api/profileApi.ts
import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { createSystemEvent } from "./eventsApi";

import type { Profile } from "../types/profile";

const sleep = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();

type ProfileFallback = {
  name?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
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
  if (!USE_MOCK) return http.get<Profile>("/profile/me");

  await sleep();
  return ensureProfile(userId, fallback);
}

export async function updateMyProfile(
  userId: string,
  patch: Partial<Omit<Profile, "userId" | "updatedAt">>,
  fallback?: ProfileFallback
): Promise<Profile> {
  if (!USE_MOCK) {
    const updated = await http.patch<Profile>("/profile/me", patch);

    await createSystemEvent({
      type: "PROFILE_UPDATED",
      actorId: userId,
      actorName: updated.name,
      entityType: "PROFILE",
      entityId: userId,
      message: `Perfil actualizado: ${updated.name}`,
      data: {
        favoriteTeams: updated.favoriteTeams,
        favoriteCities: updated.favoriteCities,
        notificationsEnabled: updated.notificationsEnabled,
      },
    });

    return updated;
  }

  await sleep();

  const p = ensureProfile(userId, fallback);
  Object.assign(p, patch);
  p.updatedAt = nowIso();

  await createSystemEvent({
    type: "PROFILE_UPDATED",
    actorId: userId,
    actorName: p.name,
    entityType: "PROFILE",
    entityId: userId,
    message: `Perfil actualizado: ${p.name}`,
    data: {
      favoriteTeams: p.favoriteTeams,
      favoriteCities: p.favoriteCities,
      notificationsEnabled: p.notificationsEnabled,
    },
  });

  return p;
}
