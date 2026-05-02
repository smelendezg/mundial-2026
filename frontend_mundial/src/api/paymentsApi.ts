// src/api/paymentsApi.ts
import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { createSystemEvent } from "./eventsApi";
import { markTicketAsPaid, markTicketAsRefunded } from "./ticketsApi";
import {
  validateIntegerRange,
  validateMoneyAmount,
  validatePaymentReference,
  validateRequired,
  validateTextLength,
} from "../utils/validation";

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

function validateMethodInput(type: PaymentMethodType, label: string, details?: string) {
  const labelError = validateTextLength(label, "El nombre del método", 4, 40);
  if (labelError) throw new Error(labelError);

  const referenceError = validatePaymentReference(details ?? "", "La referencia");
  if (referenceError) throw new Error(referenceError);

  if (type === "CARD" && !/\d{4}/.test(details ?? "")) {
    throw new Error("La referencia de tarjeta debe incluir al menos 4 números.");
  }
}

function validatePaymentDraft(amount: number, paymentMethodId: string, maxAmount = 20000000) {
  const methodError = validateRequired(paymentMethodId, "El método de pago");
  if (methodError) throw new Error(methodError);

  const amountError = validateMoneyAmount(amount, "El monto", 1000, maxAmount);
  if (amountError) throw new Error(amountError);
}

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
  validateMethodInput(type, label, details);

  if (!USE_MOCK) {
    return http.post<PaymentMethod>("/payments", {
      userId,
      type,
      label: label.trim(),
      details: details?.trim(),
    });
  }

  await sleep();

  const l = label.trim();

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
  const ticketError = validateRequired(ticketId, "La reserva");
  if (ticketError) throw new Error(ticketError);
  validatePaymentDraft(amount, paymentMethodId, 5000000);

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
  validatePaymentDraft(amount, paymentMethodId, 5000000);
  const coinsError = validateIntegerRange(coins, "Las monedas", 1, 50000);
  if (coinsError) throw new Error(coinsError);

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

export async function createMerchPayment(
  userId: string,
  itemSku: string,
  itemName: string,
  itemSize: string,
  quantity: number,
  paymentMethodId: string,
  amount: number,
  provider: PaymentProvider = "MOCK_STRIPE"
): Promise<PaymentTx> {
  validatePaymentDraft(amount, paymentMethodId);
  const skuError = validateRequired(itemSku, "El SKU");
  if (skuError) throw new Error(skuError);
  const nameError = validateTextLength(itemName, "El nombre del producto", 4, 90);
  if (nameError) throw new Error(nameError);
  const sizeError = validateTextLength(itemSize, "La talla o presentación", 2, 40);
  if (sizeError) throw new Error(sizeError);
  const quantityError = validateIntegerRange(quantity, "La cantidad", 1, 10);
  if (quantityError) throw new Error(quantityError);

  if (!USE_MOCK) {
    return http.post<PaymentTx>("/payments/txs/merch", {
      userId,
      itemSku,
      itemName,
      itemSize,
      quantity,
      paymentMethodId,
      amount,
      provider,
    });
  }

  await sleep();

  const pm = findPaymentMethod(userId, paymentMethodId);
  if (!pm) throw new Error("Método de pago inválido");
  const tx: PaymentTx = {
    id: txid(),
    userId,
    kind: "MERCH",
    itemSku: itemSku.trim(),
    itemName: itemName.trim(),
    itemSize: itemSize.trim(),
    quantity,
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
    message: `Transacción creada para producto ${tx.itemName}`,
    data: {
      itemSku: tx.itemSku,
      itemName: tx.itemName,
      itemSize: tx.itemSize,
      quantity: tx.quantity,
      amount,
      provider,
      paymentMethodId,
    },
  });

  return tx;
}

export async function createPackPayment(
  userId: string,
  itemSku: string,
  itemName: string,
  packs: number,
  quantity: number,
  paymentMethodId: string,
  amount: number,
  provider: PaymentProvider = "MOCK_STRIPE"
): Promise<PaymentTx> {
  validatePaymentDraft(amount, paymentMethodId, 5000000);
  const skuError = validateRequired(itemSku, "El SKU");
  if (skuError) throw new Error(skuError);
  const nameError = validateTextLength(itemName, "El nombre del producto", 4, 90);
  if (nameError) throw new Error(nameError);
  const packsError = validateIntegerRange(packs, "La cantidad de sobres", 1, 100);
  if (packsError) throw new Error(packsError);
  const quantityError = validateIntegerRange(quantity, "La cantidad", 1, 10);
  if (quantityError) throw new Error(quantityError);

  if (!USE_MOCK) {
    return http.post<PaymentTx>("/payments/txs/packs", {
      userId,
      itemSku,
      itemName,
      packs,
      quantity,
      paymentMethodId,
      amount,
      provider,
    });
  }

  await sleep();

  const pm = findPaymentMethod(userId, paymentMethodId);
  if (!pm) throw new Error("Método de pago inválido");
  const tx: PaymentTx = {
    id: txid(),
    userId,
    kind: "PACKS",
    itemSku: itemSku.trim(),
    itemName: itemName.trim(),
    quantity,
    packs,
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
    message: `Transacción creada para sobres ${tx.itemName}`,
    data: {
      itemSku: tx.itemSku,
      itemName: tx.itemName,
      packs: tx.packs,
      quantity: tx.quantity,
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
      itemSku: tx.itemSku,
      itemName: tx.itemName,
      itemSize: tx.itemSize,
      quantity: tx.quantity,
      packs: tx.packs,
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
      itemSku: tx.itemSku,
      itemName: tx.itemName,
      itemSize: tx.itemSize,
      quantity: tx.quantity,
      packs: tx.packs,
      amount: tx.amount,
    },
  });

  return tx;
}

export const confirmPayment = confirmPaymentTx;
export const refundPayment = refundPaymentTx;
