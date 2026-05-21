export type TicketStatus =
  | "RESERVADA"
  | "PAGADA"
  | "CANCELADA"
  | "EXPIRADA"
  | "REEMBOLSADA"
  | "TRANSFERIDA";

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