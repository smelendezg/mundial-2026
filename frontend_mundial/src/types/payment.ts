export type PaymentMethodType = "CARD" | "PSE" | "CASH" | "TRANSFER";

export type PaymentMethod = {
  id: string;
  userId: string;
  type: PaymentMethodType;
  label: string;       // Ej: "Visa ** 1234" / "PSE Bancolombia"
  details?: string;    // opcional
  isDefault: boolean;
  createdAt: string;   // ISO
};