import type { Sticker } from "./sticker";

export interface TradeOffer {
  id: string;
  fromUserId: string;
  toUserId: string;
  give: Sticker; 
  want: Sticker; 
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAtISO: string;
}