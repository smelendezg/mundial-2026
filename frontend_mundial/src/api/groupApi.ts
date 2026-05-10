import { USE_MOCK } from "./config"; 

import { http } from "./http"; 

import { mockDb } from "./mockDb"; 

import type { FriendGroup } from "../types/friendGroup"; 

 

const sleep = (ms = 150) => new Promise((r) => setTimeout(r, ms)); 

const gid = () => `g_${Date.now()}_${Math.random().toString(16).slice(2)}`; 

 

function code8() { 

  return Math.random().toString(36).slice(2, 10).toUpperCase(); 

} 

 

export async function getMyGroup(poolCode: string, userId: string): Promise<FriendGroup[]> { 

  if (!USE_MOCK) return http.get<FriendGroup[]>(`/groups?poolCode=${encodeURIComponent(poolCode)}`); 

 

  await sleep(); 

 

  return mockDb.friendGroups 

    .filter((g: FriendGroup) => g.poolCode === poolCode && g.memberIds.includes(userId)) 

    .slice(); 

} 

 

export async function createGroup(poolCode: string, ownerId: string, name: string): Promise<FriendGroup> { 

  if (!USE_MOCK) return http.post<FriendGroup>("/groups", { poolCode, ownerId, name }); 

 

  await sleep(); 

  const trimmed = name.trim(); 

  if (!trimmed) throw new Error("Nombre de grupo obligatorio"); 

 

  const g: FriendGroup = { 

    id: gid(), 

    poolCode, 

    name: trimmed, 

    code: code8(), 

    ownerId, 

    memberIds: [ownerId], 

    createdAt: new Date().toISOString(), 

  }; 

 

  mockDb.friendGroups.unshift(g); 

  return g; 

} 

 

export async function joinGroup( 

  poolCode: string, 

  userId: string, 

  groupCode: string 

): Promise<FriendGroup | null> { 

  if (!USE_MOCK) return http.post<FriendGroup>(`/groups/join`, { poolCode, userId, code: groupCode }); 

 

  await sleep(); 

  const code = groupCode.trim().toUpperCase(); 

 

  const g = 

    mockDb.friendGroups.find((x: FriendGroup) => x.poolCode === poolCode && x.code === code) ?? null; 

 

  if (!g) return null; 

 

  if (!g.memberIds.includes(userId)) g.memberIds.push(userId); 

  return g; 

} 

export async function leaveGroup( 

  poolCode: string, 

  userId: string, 

  groupId: string 

): Promise<boolean> { 

  if (!USE_MOCK) { 

    return http.post<boolean>(`/groups/leave`, { poolCode, userId, groupId }); 

  } 

 

  await sleep(); 

 

  const idx = mockDb.friendGroups.findIndex( 

    (x: FriendGroup) => x.poolCode === poolCode && x.id === groupId 

  ); 

  if (idx === -1) return false; 

 

  const g = mockDb.friendGroups[idx]; 

 

  if (!g.memberIds.includes(userId)) return false; 

 

  g.memberIds = g.memberIds.filter((id: string) => id !== userId); 

 

  if (g.memberIds.length === 0) { 

    mockDb.friendGroups.splice(idx, 1); 

    return true; 

  } 

 

  if (g.ownerId === userId) { 

    g.ownerId = g.memberIds[0]; 

  } 

 

  return true; 

} 
