export type SupportStatus = "OPEN" | "IN_REVIEW" | "CLOSED";
export type SupportCategory = "TICKET" | "NOTIFICATION" | "PAYMENT" | "TRANSFER" | "OTHER";

export type SupportRequest = {
  id: string;
  userId: string;
  title: string;
  category: SupportCategory;
  description: string;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
};
