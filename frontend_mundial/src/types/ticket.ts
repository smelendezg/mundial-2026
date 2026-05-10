// src/types/ticket.ts
export type TicketStatus =
  | "RESERVED"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED"
  | "TRANSFERRED";

export type Ticket = {
  id: string;
  userId: string;
  matchId: string;
  quantity: number;
  status: TicketStatus;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
  refundedAt?: string;
  paymentRef?: string;
};