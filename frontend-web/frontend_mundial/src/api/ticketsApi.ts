import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { createSystemEvent } from "./eventsApi";


import type { Ticket, TicketStatus } from "../types/ticket";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();
const addMinutesIso = (mins: number) => new Date(Date.now() + mins * 60_000).toISOString();

function clampQty(quantity: number) {
  return Math.max(1, Math.min(4, Math.floor(quantity || 1)));
}

function expireIfNeeded(t: Ticket) {
  if (t.status !== "RESERVADA") return;
  if (!t.expiresAt) return;
  if (new Date(t.expiresAt).getTime() <= Date.now()) {
    t.status = "EXPIRADA";
  }
}

function normalizeTickets() {
  mockDb.tickets.forEach(expireIfNeeded);
}

export async function getMyTickets(userId: string): Promise<Ticket[]> {
  if (!USE_MOCK) {
    const data = await http.get<any[]>(`/api/entradas/usuario`); // ← el backend lo saca del JWT
    return data.map((e) => {
      let estado = e.estado as TicketStatus;
      if (estado === "RESERVADA" && e.ttlReserva && new Date(e.ttlReserva).getTime() <= Date.now()) {
        estado = "EXPIRADA";
      }
      return {
        id: String(e.id),
        userId: String(e.usuarioId),
        matchId: String(e.partidoId),
        quantity: e.cantidad,
        status: estado,
        createdAt: e.fechaCompra ?? new Date().toISOString(),
        expiresAt: e.ttlReserva ?? undefined,
        paidAt: e.fechaPago ?? undefined,
        refundedAt: e.fechaReembolso ?? undefined,
        paymentRef: e.paymentRef ?? undefined,
      };
    });
  }
  await sleep(200);
  normalizeTickets();
  return mockDb.tickets
    .filter((t) => t.userId === userId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getTicketById(userId: string, ticketId: string): Promise<Ticket | null> {
  if (!USE_MOCK) {
    return http.get<Ticket>(`/api/entradas/${ticketId}`);
  }
  await sleep(150);
  normalizeTickets();
  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  return t ?? null;
}

export async function reserveTicket(userId: string, matchId: string, quantity: number): Promise<Ticket> {
  if (!USE_MOCK) {
    // ← sin userId en la URL; el backend lo obtiene del @AuthenticationPrincipal
    const data = await http.post<any>(`/api/entradas/reservar`, { partidoId: matchId, cantidad: quantity });
    return {
      id: String(data.id),
      userId: String(data.usuarioId),
      matchId: String(data.partidoId),
      quantity: data.cantidad,
      status: data.estado as TicketStatus,
      createdAt: data.fechaCompra ?? new Date().toISOString(),
      expiresAt: data.ttlReserva ?? undefined,
      paidAt: data.fechaPago ?? undefined,
      refundedAt: data.fechaReembolso ?? undefined,
      paymentRef: data.paymentRef ?? undefined,
    };
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
    status: "RESERVADA",
    createdAt: nowIso(),
    expiresAt: addMinutesIso(15),
  };
  mockDb.tickets.unshift(ticket);
  await createSystemEvent({
    type: "TICKET_RESERVED",
    actorId: userId,
    actorName: userId,
    entityType: "TICKET",
    entityId: ticket.id,
    message: `Ticket reservado para match ${matchId}`,
    data: { matchId, quantity: q, expiresAt: ticket.expiresAt },
  });
  return ticket;
}

export const buyTicket = reserveTicket;

export async function cancelTicket(userId: string, ticketId: string): Promise<boolean> {
  if (!USE_MOCK) {
    // ← solo el entradaId en la URL; el backend valida el usuario con el JWT
    await http.patch<void>(`/api/entradas/cancelar/${ticketId}`);
    return true;
  }
  await sleep(200);
  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return false;
  expireIfNeeded(t);
  if (t.status === "PAGADA") return false;
  if (t.status === "REEMBOLSADA") return false;
  if (t.status === "TRANSFERIDA") return false;
  if (t.status === "EXPIRADA") return false;
  if (t.status === "CANCELADA") return true;
  t.status = "CANCELADA";
  await createSystemEvent({
    type: "TICKET_CANCELLED",
    actorId: userId,
    actorName: userId,
    entityType: "TICKET",
    entityId: t.id,
    message: `Ticket cancelado ${t.id}`,
    data: { matchId: t.matchId, quantity: t.quantity },
  });
  return true;
}

export async function markTicketAsPaid(userId: string, ticketId: string, paymentRef: string): Promise<boolean> {
  if (!USE_MOCK) {
    await http.patch<void>(`/api/entradas/pagar/${ticketId}?paymentRef=${paymentRef}`);
    return true;
  }
  await sleep(120);
  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return false;
  expireIfNeeded(t);
  if (t.status !== "RESERVADA") return false;
  t.status = "PAGADA";
  t.paidAt = nowIso();
  t.paymentRef = paymentRef;
  t.expiresAt = undefined;
  return true;
}

export async function markTicketAsRefunded(userId: string, ticketId: string): Promise<boolean> {
  if (!USE_MOCK) {
    // ← solo el entradaId en la URL; el backend valida el usuario con el JWT
    await http.patch<void>(`/api/entradas/reembolsar/${ticketId}`);
    return true;
  }
  await sleep(120);
  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return false;
  if (t.status !== "PAGADA") return false;
  t.status = "REEMBOLSADA";
  t.refundedAt = nowIso();
  return true;
}

export async function transferTicket(userId: string, ticketId: string, correoDestino: string): Promise<Ticket> {
  if (!USE_MOCK) {
    // ← solo el entradaId en la URL; el backend valida el usuario con el JWT
    return http.patch<Ticket>(`/api/entradas/transferir/${ticketId}`, { correoDestino });
  }
  await sleep(200);
  const t = mockDb.tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) throw new Error("Ticket no encontrado");
  if (t.status !== "PAGADA") throw new Error("Solo se pueden transferir entradas pagadas");
  t.status = "TRANSFERIDA";
  return t;
}

export type PartidoCapacidad = {
  id: string;
  local: string;
  visitante: string;
  estadio: string;
  ciudad: string;
  capacidadDisponible: number;
};

export async function getPartidosConCapacidad(): Promise<PartidoCapacidad[]> {
  if (!USE_MOCK) {
    return http.get<PartidoCapacidad[]>(`/api/entradas/partidos`);
  }
  return [];
}