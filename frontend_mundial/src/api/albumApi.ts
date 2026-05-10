import { poolsMock } from "./poolsMockDb"; 

import { USE_MOCK } from "./config"; 

import { http } from "./http"; 

import { mockDb } from "./mockDb"; 

 

import type { Sticker } from "../types/sticker"; 

import type { AlbumEvent } from "../types/albumEvent"; 

import type { DailyStats } from "../types/dailyStats"; 

import type { Wallet } from "../types/wallet"; 

 

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)); 

const eid = () => `ev_${Date.now()}_${Math.random().toString(16).slice(2)}`; 

const nowIso = () => new Date().toISOString(); 

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10); 

 

const PACK_SIZE = 5; 

const MAX_PACKS_PER_DAY = 3; 

const COINS_PER_CONVERSION = 1; 

 

export const catalog: Sticker[] = [ 

  { id: "s1", name: "Messi", team: "Argentina", rarity: "legend" }, 

  { id: "s2", name: "Mbappé", team: "France", rarity: "rare" }, 

  { id: "s3", name: "James", team: "Colombia", rarity: "rare" }, 

  { id: "s4", name: "Vinícius", team: "Brasil", rarity: "rare" }, 

  { id: "s5", name: "Kane", team: "England", rarity: "common" }, 

  { id: "s6", name: "Son", team: "Korea", rarity: "common" }, 

  { id: "s7", name: "Valverde", team: "Uruguay", rarity: "common" }, 

]; 

 

function pickRandomSticker(): Sticker { 

  return catalog[Math.floor(Math.random() * catalog.length)]; 

} 

 

function ensureArrays(u: { stickers?: Sticker[]; repeated?: Sticker[] }) { 

  u.stickers ??= []; 

  u.repeated ??= []; 

} 

 

function ensureWallet(userId: string): Wallet { 

  let w = mockDb.wallets.find((x) => x.userId === userId); 

  if (!w) { 

    w = { userId, coins: 0, updatedAt: nowIso() }; 

    mockDb.wallets.unshift(w); 

  } 

  return w; 

} 

 

function ensureDaily(poolCode: string, userId: string): DailyStats { 

  const dk = dayKey(); 

  let s = mockDb.dailyStats.find( 

    (x) => x.poolCode === poolCode && x.userId === userId && x.dayKey === dk 

  ); 

 

  if (!s) { 

    s = { 

      poolCode, 

      userId, 

      dayKey: dk, 

      packsOpened: 0, 

      tradesDone: 0, 

      updatedAt: nowIso(), 

    }; 

    mockDb.dailyStats.unshift(s); 

  } 

 

  return s; 

} 

 

function pushEvent( 

  poolCode: string, 

  userId: string, 

  type: AlbumEvent["type"], 

  data?: AlbumEvent["data"] 

) { 

  const ev: AlbumEvent = { 

    id: eid(), 

    poolCode, 

    userId, 

    type, 

    createdAt: nowIso(), 

  }; 

 

  if (data) ev.data = data; 

 

  mockDb.albumEvents.unshift(ev); 

} 

 

function ensureMember(poolCode: string, userId: string, userName: string) { 

  const pool = poolsMock.find((p) => p.code === poolCode); 

  if (!pool) throw new Error("Pool no encontrada"); 

 

  let member = pool.members.find((m) => m.user.id === userId); 

 

  if (!member) { 

    member = { 

      user: { id: userId, name: userName, stickers: [], repeated: [] }, 

      points: 0, 

    }; 

    pool.members.push(member); 

  } else { 

    member.user.name = userName; 

  } 

 

  ensureArrays(member.user); 

  ensureWallet(userId); 

  ensureDaily(poolCode, userId); 

 

  return { pool, member }; 

} 

 

export type UserAlbum = { 

  stickers: Sticker[]; 

  repeated: Sticker[]; 

  coins: number; 

  packsLeft: number; 

}; 

 

export async function getUserAlbum( 

  poolCode: string, 

  userId: string, 

  userName: string 

): Promise<UserAlbum> { 

  if (!USE_MOCK) return http.get<UserAlbum>(`/album/${poolCode}/me`); 

 

  await sleep(120); 

 

  const { member } = ensureMember(poolCode, userId, userName); 

  const w = ensureWallet(userId); 

  const d = ensureDaily(poolCode, userId); 

 

  return { 

    stickers: member.user.stickers!, 

    repeated: member.user.repeated!, 

    coins: w.coins, 

    packsLeft: Math.max(0, MAX_PACKS_PER_DAY - d.packsOpened), 

  }; 

} 

 

export async function openPack( 

  poolCode: string, 

  userId: string, 

  userName: string 

): Promise<Sticker[]> { 

  if (!USE_MOCK) return http.post<Sticker[]>(`/album/${poolCode}/packs/open`, {}); 

 

  await sleep(200); 

 

  const { member } = ensureMember(poolCode, userId, userName); 

  const d = ensureDaily(poolCode, userId); 

 

  const left = Math.max(0, MAX_PACKS_PER_DAY - d.packsOpened); 

  if (left <= 0) throw new Error("Límite diario de sobres alcanzado."); 

 

  const pack: Sticker[] = Array.from({ length: PACK_SIZE }, () => pickRandomSticker()); 

  pushEvent(poolCode, userId, "PACK_OPENED", { pack }); 

 

  for (const st of pack) { 

    const already = member.user.stickers!.some((x) => x.id === st.id); 

 

    if (!already) { 

      member.user.stickers!.push(st); 

      pushEvent(poolCode, userId, "STICKER_NEW", { sticker: st }); 

    } else { 

      member.user.repeated!.push(st); 

      pushEvent(poolCode, userId, "STICKER_DUPLICATE", { sticker: st }); 

    } 

  } 

 

  d.packsOpened += 1; 

  d.updatedAt = nowIso(); 

 

  return pack; 

} 

 

export async function convertDuplicateToCoins( 

  poolCode: string, 

  userId: string, 

  userName: string, 

  stickerId: string 

): Promise<boolean> { 

  if (!USE_MOCK) return http.post<boolean>(`/album/${poolCode}/convert`, { stickerId }); 

 

  await sleep(120); 

 

  const { member } = ensureMember(poolCode, userId, userName); 

  const w = ensureWallet(userId); 

 

  const idx = member.user.repeated!.findIndex((s) => s.id === stickerId); 

  if (idx === -1) return false; 

 

  member.user.repeated!.splice(idx, 1); 

 

  w.coins += COINS_PER_CONVERSION; 

  w.updatedAt = nowIso(); 

 

  pushEvent(poolCode, userId, "COINS_EARNED", { 

    coins: COINS_PER_CONVERSION, 

    stickerId, 

    note: "CONVERT_DUPLICATE", 

  }); 

 

  return true; 

} 

 

export async function getAlbumHistory( 

  poolCode: string, 

  userId: string 

): Promise<AlbumEvent[]> { 

  if (!USE_MOCK) return http.get<AlbumEvent[]>(`/album/${poolCode}/events`); 

 

  await sleep(120); 

 

  return mockDb.albumEvents 

    .filter((e) => e.poolCode === poolCode && e.userId === userId) 

    .slice(0, 50); 

} 
