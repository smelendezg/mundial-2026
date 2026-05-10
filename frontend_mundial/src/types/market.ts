// src/types/market.ts
import type { Sticker } from "./sticker";

export interface MarketListing {
  id: string;
  poolCode: string;
  sellerId: string;
  sticker: Sticker;
  price: number;
  status: "ACTIVE" | "SOLD" | "CANCELLED";
  createdAtISO: string;

  scope: "GLOBAL" | "GROUP";
  groupId?: string;
}
