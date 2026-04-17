import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { poolsMock } from "./poolsMockDb";

import type { AlbumEvent } from "../types/albumEvent";
import type { DailyStats } from "../types/dailyStats";
import type { Sticker } from "../types/sticker";
import type { TradeOffer } from "../types/trade";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const tradesMock: TradeOffer[] = [];
const MAX_TRADES_PER_DAY = 5;

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function ensureArrays(user: { stickers?: Sticker[]; repeated?: Sticker[] }) {
  user.stickers ??= [];
  user.repeated ??= [];
}

function ensureDaily(poolCode: string, userId: string): DailyStats {
  const dk = dayKey();
  let daily = mockDb.dailyStats.find(
    (item) => item.poolCode === poolCode && item.userId === userId && item.dayKey === dk
  );

  if (!daily) {
    daily = {
      poolCode,
      userId,
      dayKey: dk,
      packsOpened: 0,
      tradesDone: 0,
      updatedAt: nowIso(),
    };
    mockDb.dailyStats.push(daily);
  }

  return daily;
}

function registerEvent(event: Omit<AlbumEvent, "id" | "createdAt">) {
  mockDb.albumEvents.push({
    ...event,
    id: `ev_${Date.now()}`,
    createdAt: nowIso(),
  });
}

export async function getTrades(poolCode: string): Promise<TradeOffer[]> {
  if (!USE_MOCK) return http.get<TradeOffer[]>(`/album/${poolCode}/trades`);

  await sleep(150);
  return tradesMock.slice();
}

export async function createTradeOffer(
  poolCode: string,
  fromUserId: string,
  toUserId: string,
  give: Sticker,
  want: Sticker
): Promise<TradeOffer> {
  if (!USE_MOCK) {
    void fromUserId;
    return http.post<TradeOffer>(`/album/${poolCode}/trades`, {
      toUserId,
      giveStickerId: give.id,
      wantStickerId: want.id,
    });
  }

  await sleep(150);

  const offer: TradeOffer = {
    id: `tr_${Date.now()}`,
    fromUserId,
    toUserId,
    give,
    want,
    status: "PENDING",
    createdAtISO: nowIso(),
  };

  tradesMock.push(offer);
  registerEvent({
    userId: fromUserId,
    poolCode,
    type: "TRADE_CREATED",
    data: { tradeId: offer.id },
  });

  return offer;
}

export async function acceptTrade(poolCode: string, tradeId: string): Promise<boolean> {
  if (!USE_MOCK) return http.post<boolean>(`/album/${poolCode}/trades/${tradeId}/accept`);

  await sleep(150);

  const trade = tradesMock.find((item) => item.id === tradeId);
  if (!trade || trade.status !== "PENDING") return false;

  const pool = poolsMock.find((item) => item.code === poolCode);
  if (!pool) return false;

  const from = pool.members.find((member) => member.user.id === trade.fromUserId);
  const to = pool.members.find((member) => member.user.id === trade.toUserId);
  if (!from || !to) return false;

  const group = mockDb.friendGroups.find(
    (item) =>
      item.poolCode === poolCode &&
      item.memberIds.includes(trade.fromUserId) &&
      item.memberIds.includes(trade.toUserId)
  );
  if (!group) return false;

  const daily = ensureDaily(poolCode, trade.fromUserId);
  if (daily.tradesDone >= MAX_TRADES_PER_DAY) return false;

  ensureArrays(from.user);
  ensureArrays(to.user);

  const giveIdx = from.user.repeated!.findIndex((sticker) => sticker.id === trade.give.id);
  if (giveIdx === -1) return false;
  from.user.repeated!.splice(giveIdx, 1);

  const wantIdx = to.user.repeated!.findIndex((sticker) => sticker.id === trade.want.id);
  if (wantIdx !== -1) to.user.repeated!.splice(wantIdx, 1);

  const toAlready = to.user.stickers!.some((sticker) => sticker.id === trade.give.id);
  if (toAlready) to.user.repeated!.push(trade.give);
  else to.user.stickers!.push(trade.give);

  const fromAlready = from.user.stickers!.some((sticker) => sticker.id === trade.want.id);
  if (fromAlready) from.user.repeated!.push(trade.want);
  else from.user.stickers!.push(trade.want);

  trade.status = "ACCEPTED";
  daily.tradesDone++;
  daily.updatedAt = nowIso();

  registerEvent({
    userId: trade.fromUserId,
    poolCode,
    type: "TRADE_ACCEPTED",
    data: { tradeId },
  });

  return true;
}
