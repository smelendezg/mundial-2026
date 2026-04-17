// src/api/eventsApi.ts

import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import type { SystemEvent } from "../types/systemEvent";

const sleep = (ms = 150) => new Promise((r) => setTimeout(r, ms));

const eid = () => `ev_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export async function createSystemEvent(
  payload: Omit<SystemEvent, "id" | "createdAt">
): Promise<SystemEvent> {
  if (!USE_MOCK) {
    return http.post<SystemEvent>("/events", payload);
  }

  await sleep();

  const ev: SystemEvent = {
    id: eid(),
    createdAt: new Date().toISOString(),
    ...payload,
  };

  mockDb.systemEvents.unshift(ev);

  return ev;
}

export async function getSystemEvents(): Promise<SystemEvent[]> {
  if (!USE_MOCK) {
    return http.get<SystemEvent[]>("/events");
  }

  await sleep();

  return [...mockDb.systemEvents];
}