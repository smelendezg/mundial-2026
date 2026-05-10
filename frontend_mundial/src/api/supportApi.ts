import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import { createSystemEvent } from "./eventsApi";

import type { SupportCategory, SupportRequest, SupportStatus } from "../types/support";
import { validateTextLength } from "../utils/validation";

const sleep = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();

export async function getMySupportRequests(userId: string): Promise<SupportRequest[]> {
  if (!USE_MOCK) return http.get<SupportRequest[]>("/support/me");

  await sleep();

  return mockDb.supportRequests
    .filter((request) => request.userId === userId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getSupportRequests(): Promise<SupportRequest[]> {
  if (!USE_MOCK) return http.get<SupportRequest[]>("/support");

  await sleep();

  return mockDb.supportRequests
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createSupportRequest(
  userId: string,
  actorName: string,
  title: string,
  category: SupportCategory,
  description: string
): Promise<SupportRequest> {
  if (!USE_MOCK) {
    return http.post<SupportRequest>("/support", {
      title,
      category,
      description,
    });
  }

  await sleep();

  const cleanTitle = title.trim();
  const cleanDescription = description.trim();

  const titleError = validateTextLength(cleanTitle, "El asunto", 6, 90);
  if (titleError) throw new Error(titleError);
  const descriptionError = validateTextLength(cleanDescription, "La descripción", 20, 800);
  if (descriptionError) throw new Error(descriptionError);

  const request: SupportRequest = {
    id: `sr_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    userId,
    title: cleanTitle,
    category,
    description: cleanDescription,
    status: "OPEN",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  mockDb.supportRequests.unshift(request);

  await createSystemEvent({
    type: "SUPPORT_REQUEST_CREATED",
    actorId: userId,
    actorName,
    entityType: "SUPPORT",
    entityId: request.id,
    message: `Solicitud de soporte creada: ${cleanTitle}`,
    data: { category },
  });

  return request;
}

export async function updateSupportStatus(
  userId: string,
  actorName: string,
  requestId: string,
  status: SupportStatus
): Promise<SupportRequest> {
  if (!USE_MOCK) {
    return http.patch<SupportRequest>(`/support/${requestId}`, { status });
  }

  await sleep();

  const request = mockDb.supportRequests.find((item) => item.id === requestId);

  if (!request) throw new Error("La solicitud no existe.");
  if (!["OPEN", "IN_REVIEW", "CLOSED"].includes(status)) {
    throw new Error("El estado de soporte no es válido.");
  }

  request.status = status;
  request.updatedAt = nowIso();

  await createSystemEvent({
    type: "SUPPORT_REQUEST_UPDATED",
    actorId: userId,
    actorName,
    entityType: "SUPPORT",
    entityId: request.id,
    message: `Solicitud de soporte actualizada: ${request.title}`,
    data: { status },
  });

  return request;
}
