// src/types/systemEvent.ts
export type SystemEventType =
  | "AUTH_LOGIN"
  | "AUTH_LOGOUT"
  | "USER_REGISTERED"
  | "PROFILE_UPDATED"
  | "MATCH_CREATED"
  | "MATCH_STATUS_CHANGED"
  | "MATCH_RESULT_PUBLISHED"
  | "TICKET_RESERVED"
  | "TICKET_CANCELLED"
  | "PAYMENT_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "SUPPORT_REQUEST_CREATED"
  | "SUPPORT_REQUEST_UPDATED";

export type SystemEvent = {
  id: string;
  type: SystemEventType;
  actorId?: string;
  actorName?: string;
  entityId?: string;
  entityType?: "USER" | "MATCH" | "PROFILE" | "AUTH" | "TICKET" | "PAYMENT" | "SUPPORT";
  message: string;
  createdAt: string;
  data?: Record<string, unknown>;
};
