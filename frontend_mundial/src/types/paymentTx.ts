// src/types/paymentTx.ts

export type PaymentTxStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED";

export type PaymentProvider =
  | "MOCK_STRIPE"
  | "MOCK_WIREMOCK";

export type PaymentTxKind =
  | "TICKET"
  | "COINS";

export type PaymentTx = {
  id: string;
  userId: string;

  kind: PaymentTxKind;

  ticketId?: string;
  coins?: number;

  paymentMethodId: string;

  amount: number;
  currency: "COP";

  status: PaymentTxStatus;

  createdAt: string;
  confirmedAt?: string;
  refundAt?: string;

  provider: PaymentProvider;
  providerRef: string;

  failReason?: string;
};