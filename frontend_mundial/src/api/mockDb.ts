// src/api/mockDb.ts
import type { AlbumEvent } from "../types/albumEvent";
import type { DailyStats } from "../types/dailyStats";
import type { FriendGroup } from "../types/friendGroup";
import type { Match } from "../types/match";
import type { MarketListing } from "../types/market";
import type { NotificationItem } from "../types/notification";
import type { PaymentMethod } from "../types/payment";
import type { PaymentTx } from "../types/paymentTx";
import type { Prediction } from "../types/prediction";
import type { Profile } from "../types/profile";
import type { SupportRequest } from "../types/support";
import type { SystemEvent } from "../types/systemEvent";
import type { Ticket } from "../types/ticket";
import type { Wallet } from "../types/wallet";

export const matchesMock: Match[] = [
  {
    id: "m1",
    home: { id: "t_arg", name: "Argentina", code: "ARG" },
    away: { id: "t_bra", name: "Brasil", code: "BRA" },
    stadium: "Azteca",
    city: "Ciudad de México",
    startTimeISO: "2026-06-10T20:00:00Z",
    status: "SCHEDULED",
  },
  {
    id: "m2",
    home: { id: "t_esp", name: "España", code: "ESP" },
    away: { id: "t_fra", name: "Francia", code: "FRA" },
    stadium: "MetLife Stadium",
    city: "New York",
    startTimeISO: "2026-06-11T18:00:00Z",
    status: "SCHEDULED",
  },
  {
    id: "m3",
    home: { id: "t_col", name: "Colombia", code: "COL" },
    away: { id: "t_mex", name: "México", code: "MEX" },
    stadium: "SoFi Stadium",
    city: "Los Angeles",
    startTimeISO: "2026-06-12T19:00:00Z",
    status: "SCHEDULED",
  },
  {
    id: "m4",
    home: { id: "t_ger", name: "Alemania", code: "GER" },
    away: { id: "t_ita", name: "Italia", code: "ITA" },
    stadium: "AT&T Stadium",
    city: "Dallas",
    startTimeISO: "2026-06-13T21:00:00Z",
    status: "SCHEDULED",
  },
];

export const paymentsMock: PaymentMethod[] = [
  {
    id: "pm_u1_card",
    userId: "u1",
    type: "CARD",
    label: "Visa Demo Sara",
    details: "4111 **** 1111",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pm_u2_card",
    userId: "u2",
    type: "CARD",
    label: "Mastercard Demo Juan",
    details: "5555 **** 4444",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pm_admin_card",
    userId: "u_admin",
    type: "CARD",
    label: "Admin Demo",
    details: "4000 **** 0002",
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

export const mockDb = {
  matches: [...matchesMock],

  tickets: [] as Ticket[],
  notifications: [] as NotificationItem[],
  payments: [...paymentsMock],
  profiles: [] as Profile[],
  predictions: [] as Prediction[],

  wallets: [] as Wallet[],
  albumEvents: [] as AlbumEvent[],
  dailyStats: [] as DailyStats[],
  friendGroups: [] as FriendGroup[],
  marketlistings: [] as MarketListing[],
  paymentsTx: [] as PaymentTx[],
  systemEvents: [] as SystemEvent[],
  supportRequests: [] as SupportRequest[],
};
