// src/api/ticketsApi.ts
import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { createSystemEvent } from "./eventsApi";

import type { Ticket } from "../types/ticket";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const nowIso = () => new Date().toISOString();
const addMinutesIso = (mins: number) =>
  new Date(Date.now() + mins * 60_000).toISOString();

function clampQty(quantity: number) {
  return Math.max(1, Math.min(10, Math.floor(quantity || 1)));
}

function expireIfNeeded(t: Ticket) {
  if (t.status !== "RESERVED") return;
  if (!t.expiresAt) return;

  if (new Date(t.expiresAt).getTime() <= Date.now()) {
    t.status = "EXPIRED";
  }
}

function normalizeTickets() {
  mockDb.tickets.forEach(expireIfNeeded);
}

/** GET: mis tickets (más nuevos primero) */
export async function getMyTickets(userId: string): Promise<Ticket[]> {
  if (!USE_MOCK) {
    return http.get<Ticket[]>(`/tickets/me`);
  }

  await sleep(200);

  normalizeTickets();

  return mockDb.tickets
    .filter((t) => t.userId === userId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** GET: ticket por id */
export async function getTicketById(
  userId: string,
  ticketId: string
): Promise<Ticket | null> {
  if (!USE_MOCK) {
    return http.get<Ticket>(`/tickets/${ticketId}`);
  }

  await sleep(150);

  normalizeTickets();

  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  return t ?? null;
}

/** POST: reservar ticket (RESERVED) */
export async function reserveTicket(
  userId: string,
  matchId: string,
  quantity: number
): Promise<Ticket> {
  if (!USE_MOCK) {
    return http.post<Ticket>(`/tickets/reserve`, { matchId, quantity });
  }

  await sleep(250);

  const match = mockDb.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");

  if (match.status === "FINISHED" || match.status === "LIVE") {
    throw new Error("No puedes reservar entradas para este partido.");
  }

  if (new Date(match.startTimeISO).getTime() <= Date.now()) {
    throw new Error("El partido ya comenzó.");
  }

  const q = clampQty(quantity);

  const ticket: Ticket = {
    id: `tk_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    userId,
    matchId,
    quantity: q,
    status: "RESERVED",
    createdAt: nowIso(),
    expiresAt: addMinutesIso(10),
  };

  mockDb.tickets.unshift(ticket);

  await createSystemEvent({
    type: "TICKET_RESERVED",
    actorId: userId,
    actorName: userId,
    entityType: "TICKET",
    entityId: ticket.id,
    message: `Ticket reservado para match ${matchId}`,
    data: {
      matchId,
      quantity: q,
      expiresAt: ticket.expiresAt,
    },
  });

  return ticket;
}

/** Alias legacy */
export const buyTicket = reserveTicket;

/** PATCH: cancelar (solo RESERVED o ya expirada) */
export async function cancelTicket(
  userId: string,
  ticketId: string
): Promise<boolean> {
  if (!USE_MOCK) {
    await http.patch<void>(`/tickets/${ticketId}/cancel`);
    return true;
  }

  await sleep(200);

  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return false;

  expireIfNeeded(t);

  if (t.status === "PAID") return false;
  if (t.status === "REFUNDED") return false;
  if (t.status === "TRANSFERRED") return false;
  if (t.status === "EXPIRED") return false;
  if (t.status === "CANCELLED") return true;

  t.status = "CANCELLED";

  await createSystemEvent({
    type: "TICKET_CANCELLED",
    actorId: userId,
    actorName: userId,
    entityType: "TICKET",
    entityId: t.id,
    message: `Ticket cancelado ${t.id}`,
    data: {
      matchId: t.matchId,
      quantity: t.quantity,
    },
  });

  return true;
}

/** Helper para Payments: marcar ticket pagado */
export async function markTicketAsPaid(
  userId: string,
  ticketId: string,
  paymentRef: string
): Promise<boolean> {
  if (!USE_MOCK) {
    await http.post<void>(`/tickets/${ticketId}/paid`, { paymentRef });
    return true;
  }

  await sleep(120);

  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return false;

  expireIfNeeded(t);

  if (t.status !== "RESERVED") return false;

  t.status = "PAID";
  t.paidAt = nowIso();
  t.paymentRef = paymentRef;
  t.expiresAt = undefined;

  return true;
}

/** Helper para Payments: reembolsar ticket */
export async function markTicketAsRefunded(
  userId: string,
  ticketId: string
): Promise<boolean> {
  if (!USE_MOCK) {
    await http.post<void>(`/tickets/${ticketId}/refund`);
    return true;
  }

  await sleep(120);

  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return false;

  if (t.status !== "PAID") return false;

  t.status = "REFUNDED";
  t.refundedAt = nowIso();

  return true;
}