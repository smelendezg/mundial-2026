// src/api/paymentsApi.ts
import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { createSystemEvent } from "./eventsApi";
import { markTicketAsPaid, markTicketAsRefunded } from "./ticketsApi";

import type { PaymentMethod, PaymentMethodType } from "../types/payment";
import type {
  PaymentProvider,
  PaymentTx,
  PaymentTxStatus,
} from "../types/paymentTx";
import type { Wallet } from "../types/wallet";

const sleep = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const pmid = () => `pm_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const txid = () => `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const providerRef = () => `prov_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const nowIso = () => new Date().toISOString();

function ensureWallet(userId: string): Wallet {
  let w = mockDb.wallets.find((x) => x.userId === userId);

  if (!w) {
    w = { userId, coins: 0, updatedAt: nowIso() };
    mockDb.wallets.unshift(w);
  }

  return w;
}

function findPaymentMethod(
  userId: string,
  paymentMethodId: string
): PaymentMethod | null {
  return (
    mockDb.payments.find(
      (p) => p.id === paymentMethodId && p.userId === userId
    ) ?? null
  );
}

/**
 * Simulación:
 * - label/details contiene "FAIL" => FAILED
 * - label/details contiene "PENDING" => sigue PENDING
 * - si no => SUCCEEDED
 */
function simulateStatus(
  pm: PaymentMethod
): { status: PaymentTxStatus; failReason?: string } {
  const hay = `${pm.label ?? ""} ${pm.details ?? ""}`.toUpperCase();

  if (hay.includes("PENDING")) {
    return { status: "PENDING" };
  }

  if (hay.includes("FAIL")) {
    return { status: "FAILED", failReason: "SIMULATED_FAIL" };
  }

  return { status: "SUCCEEDED" };
}

export async function getMyPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  if (!USE_MOCK) {
    return http.get<PaymentMethod[]>(
      `/payments?userId=${encodeURIComponent(userId)}`
    );
  }

  await sleep();

  return mockDb.payments
    .filter((p) => p.userId === userId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addPaymentMethod(
  userId: string,
  type: PaymentMethodType,
  label: string,
  details?: string
): Promise<PaymentMethod> {
  if (!USE_MOCK) {
    return http.post<PaymentMethod>("/payments", {
      userId,
      type,
      label,
      details,
    });
  }

  await sleep();

  const l = label.trim();
  if (!l) throw new Error("label required");

  const isFirst =
    mockDb.payments.filter((p) => p.userId === userId).length === 0;

  const item: PaymentMethod = {
    id: pmid(),
    userId,
    type,
    label: l,
    details: details?.trim() || undefined,
    isDefault: isFirst,
    createdAt: nowIso(),
  };

  mockDb.payments.unshift(item);
  return item;
}

export async function setDefaultPaymentMethod(
  userId: string,
  paymentId: string
): Promise<boolean> {
  if (!USE_MOCK) {
    await http.patch<void>(`/payments/${paymentId}/default`, { userId });
    return true;
  }

  await sleep();

  const mine = mockDb.payments.filter((p) => p.userId === userId);
  const target = mine.find((p) => p.id === paymentId);

  if (!target) return false;

  for (const p of mine) p.isDefault = false;
  target.isDefault = true;

  return true;
}

export async function getMyPaymentTxs(
  userId: string
): Promise<PaymentTx[]> {
  if (!USE_MOCK) {
    return http.get<PaymentTx[]>(
      `/payments/txs?userId=${encodeURIComponent(userId)}`
    );
  }

  await sleep();

  return mockDb.paymentsTx
    .filter((t) => t.userId === userId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createTicketPayment(
  userId: string,
  ticketId: string,
  paymentMethodId: string,
  amount: number,
  provider: PaymentProvider = "MOCK_STRIPE"
): Promise<PaymentTx> {
  if (!USE_MOCK) {
    return http.post<PaymentTx>("/payments/txs/ticket", {
      userId,
      ticketId,
      paymentMethodId,
      amount,
      provider,
    });
  }

  await sleep();

  const pm = findPaymentMethod(userId, paymentMethodId);
  if (!pm) throw new Error("Método de pago inválido");

  const ticket = mockDb.tickets.find(
    (t) => t.id === ticketId && t.userId === userId
  );
  if (!ticket) throw new Error("Ticket no existe");

  if (ticket.status !== "RESERVED") {
    throw new Error("El ticket no está disponible para pago");
  }

  const tx: PaymentTx = {
    id: txid(),
    userId,
    kind: "TICKET",
    ticketId,
    paymentMethodId,
    amount,
    currency: "COP",
    status: "PENDING",
    createdAt: nowIso(),
    provider,
    providerRef: providerRef(),
  };

  mockDb.paymentsTx.unshift(tx);

  await createSystemEvent({
    type: "PAYMENT_CREATED",
    actorId: userId,
    actorName: userId,
    entityType: "PAYMENT",
    entityId: tx.id,
    message: `Transacción creada para ticket ${ticketId}`,
    data: {
      ticketId,
      amount,
      provider,
      paymentMethodId,
    },
  });

  return tx;
}

export async function createCoinsPayment(
  userId: string,
  coins: number,
  paymentMethodId: string,
  amount: number,
  provider: PaymentProvider = "MOCK_STRIPE"
): Promise<PaymentTx> {
  if (!USE_MOCK) {
    return http.post<PaymentTx>("/payments/txs/coins", {
      userId,
      coins,
      paymentMethodId,
      amount,
      provider,
    });
  }

  await sleep();

  const pm = findPaymentMethod(userId, paymentMethodId);
  if (!pm) throw new Error("Método de pago inválido");

  if (!Number.isFinite(coins) || coins <= 0) {
    throw new Error("Coins inválidas");
  }

  const tx: PaymentTx = {
    id: txid(),
    userId,
    kind: "COINS",
    coins,
    paymentMethodId,
    amount,
    currency: "COP",
    status: "PENDING",
    createdAt: nowIso(),
    provider,
    providerRef: providerRef(),
  };

  mockDb.paymentsTx.unshift(tx);

  await createSystemEvent({
    type: "PAYMENT_CREATED",
    actorId: userId,
    actorName: userId,
    entityType: "PAYMENT",
    entityId: tx.id,
    message: `Transacción creada para compra de monedas`,
    data: {
      coins,
      amount,
      provider,
      paymentMethodId,
    },
  });

  return tx;
}

export async function confirmPaymentTx(
  userId: string,
  txIdValue: string
): Promise<PaymentTx> {
  if (!USE_MOCK) {
    return http.post<PaymentTx>(`/payments/txs/${txIdValue}/confirm`, {
      userId,
    });
  }

  await sleep();

  const tx = mockDb.paymentsTx.find(
    (t) => t.id === txIdValue && t.userId === userId
  );
  if (!tx) throw new Error("Tx no existe");

  if (tx.status !== "PENDING") return tx;

  const pm = findPaymentMethod(userId, tx.paymentMethodId);
  if (!pm) throw new Error("Método de pago no encontrado");

  const sim = simulateStatus(pm);

  if (sim.status === "PENDING") {
    return tx;
  }

  if (sim.status === "FAILED") {
    tx.status = "FAILED";
    tx.failReason = sim.failReason ?? "FAILED";
    tx.confirmedAt = nowIso();

    await createSystemEvent({
      type: "PAYMENT_FAILED",
      actorId: userId,
      actorName: userId,
      entityType: "PAYMENT",
      entityId: tx.id,
      message: `Pago fallido ${tx.id}`,
      data: {
        failReason: tx.failReason,
        provider: tx.provider,
      },
    });

    return tx;
  }

  tx.status = "SUCCEEDED";
  tx.confirmedAt = nowIso();

  if (tx.kind === "COINS") {
    const w = ensureWallet(userId);
    w.coins += tx.coins ?? 0;
    w.updatedAt = nowIso();
  }

  if (tx.kind === "TICKET" && tx.ticketId) {
    const ok = await markTicketAsPaid(userId, tx.ticketId, tx.providerRef);
    if (!ok) {
      tx.status = "FAILED";
      tx.failReason = "TICKET_PAYMENT_APPLY_FAILED";

      await createSystemEvent({
        type: "PAYMENT_FAILED",
        actorId: userId,
        actorName: userId,
        entityType: "PAYMENT",
        entityId: tx.id,
        message: `No se pudo aplicar el pago al ticket`,
        data: {
          ticketId: tx.ticketId,
          providerRef: tx.providerRef,
        },
      });

      return tx;
    }
  }

  await createSystemEvent({
    type: "PAYMENT_CONFIRMED",
    actorId: userId,
    actorName: userId,
    entityType: "PAYMENT",
    entityId: tx.id,
    message: `Pago confirmado ${tx.id}`,
    data: {
      kind: tx.kind,
      ticketId: tx.ticketId,
      coins: tx.coins,
      amount: tx.amount,
      provider: tx.provider,
      providerRef: tx.providerRef,
    },
  });

  return tx;
}

export async function refundPaymentTx(
  userId: string,
  txIdValue: string
): Promise<PaymentTx> {
  if (!USE_MOCK) {
    return http.post<PaymentTx>(`/payments/txs/${txIdValue}/refund`, {
      userId,
    });
  }

  await sleep();

  const tx = mockDb.paymentsTx.find(
    (t) => t.id === txIdValue && t.userId === userId
  );
  if (!tx) throw new Error("Tx no existe");

  if (tx.status !== "SUCCEEDED") {
    throw new Error("Solo puedes reembolsar pagos exitosos");
  }

  tx.status = "REFUNDED";
  tx.refundAt = nowIso();

  if (tx.kind === "COINS") {
    const w = ensureWallet(userId);
    w.coins = Math.max(0, w.coins - (tx.coins ?? 0));
    w.updatedAt = nowIso();
  }

  if (tx.kind === "TICKET" && tx.ticketId) {
    await markTicketAsRefunded(userId, tx.ticketId);
  }

  await createSystemEvent({
    type: "PAYMENT_REFUNDED",
    actorId: userId,
    actorName: userId,
    entityType: "PAYMENT",
    entityId: tx.id,
    message: `Pago reembolsado ${tx.id}`,
    data: {
      kind: tx.kind,
      ticketId: tx.ticketId,
      coins: tx.coins,
      amount: tx.amount,
    },
  });

  return tx;
}

export const confirmPayment = confirmPaymentTx;
export const refundPayment = refundPaymentTx;
