import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { poolsMock } from "./poolsMockDb";

import type { AlbumEvent } from "../types/albumEvent";
import type { MarketListing } from "../types/market";
import type { Sticker } from "../types/sticker";
import type { Wallet } from "../types/wallet";

const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

function pushEvent(
  poolCode: string,
  userId: string,
  type: AlbumEvent["type"],
  data?: AlbumEvent["data"]
) {
  mockDb.albumEvents.unshift({
    id: id("ev"),
    poolCode,
    userId,
    type,
    createdAt: nowIso(),
    data,
  });
}

function ensureWallet(userId: string): Wallet {
  let wallet = mockDb.wallets.find((item) => item.userId === userId);

  if (!wallet) {
    wallet = { userId, coins: 0, updatedAt: nowIso() };
    mockDb.wallets.unshift(wallet);
  }

  return wallet;
}

export async function createListing(
  poolCode: string,
  sellerId: string,
  stickerId: string,
  price: number,
  scope: "GLOBAL" | "GROUP" = "GLOBAL",
  groupId?: string
): Promise<boolean> {
  if (!USE_MOCK) {
    void sellerId;
    return http.post<boolean>(`/album/${poolCode}/market/listings`, {
      stickerId,
      price,
      scope,
      groupId,
    });
  }

  await sleep();

  if (price < 1) return false;
  if (scope === "GROUP" && !groupId) return false;

  const pool = poolsMock.find((item) => item.code === poolCode);
  if (!pool) return false;

  const seller = pool.members.find((member) => member.user.id === sellerId);
  if (!seller) return false;

  seller.user.repeated ??= [];
  seller.user.stickers ??= [];

  const idx = seller.user.repeated.findIndex((sticker: Sticker) => sticker.id === stickerId);
  if (idx === -1) return false;

  const sticker = seller.user.repeated.splice(idx, 1)[0];

  const listing: MarketListing = {
    id: id("ml"),
    poolCode,
    sellerId,
    sticker,
    price,
    status: "ACTIVE",
    createdAtISO: nowIso(),
    scope,
    groupId: scope === "GROUP" ? groupId : undefined,
  };

  mockDb.marketlistings.unshift(listing);
  pushEvent(poolCode, sellerId, "MARKET_LISTED", {
    stickerId: sticker.id,
    coins: price,
    note: listing.id,
  });

  return true;
}

export async function buyListing(
  poolCode: string,
  buyerId: string,
  listingId: string
): Promise<boolean> {
  if (!USE_MOCK) {
    void buyerId;
    return http.post<boolean>(`/album/${poolCode}/market/listings/${listingId}/buy`);
  }

  await sleep();

  const listing = mockDb.marketlistings.find((item) => item.id === listingId);
  if (!listing || listing.status !== "ACTIVE") return false;
  if (listing.poolCode !== poolCode) return false;
  if (listing.sellerId === buyerId) return false;

  const buyerWallet = ensureWallet(buyerId);
  const sellerWallet = ensureWallet(listing.sellerId);
  if (buyerWallet.coins < listing.price) return false;

  buyerWallet.coins -= listing.price;
  buyerWallet.updatedAt = nowIso();
  sellerWallet.coins += listing.price;
  sellerWallet.updatedAt = nowIso();

  pushEvent(poolCode, buyerId, "COINS_SPENT", { coins: listing.price, note: listingId });
  pushEvent(poolCode, listing.sellerId, "COINS_EARNED", { coins: listing.price, note: listingId });

  const pool = poolsMock.find((item) => item.code === poolCode);
  const buyer = pool?.members.find((member) => member.user.id === buyerId);
  if (!buyer) return false;

  buyer.user.stickers ??= [];
  buyer.user.repeated ??= [];

  const already = buyer.user.stickers.some((sticker) => sticker.id === listing.sticker.id);
  if (already) buyer.user.repeated.push(listing.sticker);
  else buyer.user.stickers.push(listing.sticker);

  listing.status = "SOLD";
  pushEvent(poolCode, buyerId, "MARKET_BOUGHT", {
    stickerId: listing.sticker.id,
    coins: listing.price,
    note: listingId,
  });

  return true;
}

export async function cancelListing(
  poolCode: string,
  sellerId: string,
  listingId: string
): Promise<boolean> {
  if (!USE_MOCK) {
    void sellerId;
    return http.post<boolean>(`/album/${poolCode}/market/listings/${listingId}/cancel`);
  }

  await sleep();

  const listing = mockDb.marketlistings.find((item) => item.id === listingId);
  if (!listing || listing.poolCode !== poolCode) return false;
  if (listing.sellerId !== sellerId || listing.status !== "ACTIVE") return false;

  const pool = poolsMock.find((item) => item.code === poolCode);
  const seller = pool?.members.find((member) => member.user.id === sellerId);
  if (!seller) return false;

  seller.user.repeated ??= [];
  seller.user.repeated.push(listing.sticker);
  listing.status = "CANCELLED";

  pushEvent(poolCode, sellerId, "MARKET_CANCELLED", {
    stickerId: listing.sticker.id,
    note: listingId,
  });

  return true;
}

export async function getMarketListings(poolCode: string): Promise<MarketListing[]> {
  if (!USE_MOCK) return http.get<MarketListing[]>(`/album/${poolCode}/market/listings`);

  await sleep();
  return mockDb.marketlistings.filter(
    (listing) => listing.poolCode === poolCode && listing.status === "ACTIVE"
  );
}
