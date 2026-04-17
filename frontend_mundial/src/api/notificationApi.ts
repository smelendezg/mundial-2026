// src/api/notificationApi.ts 

 

import { USE_MOCK } from "./config"; 

import { http } from "./http"; 

import { mockDb } from "./mockDb"; 

import type { NotificationItem } from "../types/notification"; 

 

const sleep = (ms = 200) => new Promise((r) => setTimeout(r, ms)); 

const nid = () => `n_${Date.now()}_${Math.random().toString(16).slice(2)}`; 

 

// GET 

export async function getNotifications(): Promise<NotificationItem[]> { 

  if (!USE_MOCK) { 

    return http.get<NotificationItem[]>("/notifications"); 

  } 

 

  await sleep(); 

  return mockDb.notifications 

    .slice() 

    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); 

} 

 

// POST 

export async function createNotification( 

  title: string, 

  body: string 

): Promise<NotificationItem> { 

  if (!USE_MOCK) { 

    return http.post<NotificationItem>("/notifications", { title, body }); 

  } 

 

  await sleep(); 

  const t = title.trim(); 

  const b = body.trim(); 

  if (!t || !b) throw new Error("title/body required"); 

 

  const item: NotificationItem = { 

    id: nid(), 

    title: t, 

    body: b, 

    read: false, 

    createdAt: new Date().toISOString(), 

  }; 

 

  mockDb.notifications.unshift(item); 

  return item; 

} 

 

// PATCH 

export async function markNotificationRead(id: string): Promise<boolean> { 

  if (!USE_MOCK) { 

    await http.patch<void>(`/notifications/${id}/read`); 

    return true; 

  } 

 

  await sleep(); 

  const n = mockDb.notifications.find((x) => x.id === id); 

  if (!n) return false; 

  n.read = true; 

  return true; 

} 

 

// DELETE 

export async function deleteNotification(id: string): Promise<boolean> { 

  if (!USE_MOCK) { 

    await http.delete<void>(`/notifications/${id}`); 

    return true; 

  } 

 

  await sleep(); 

  const idx = mockDb.notifications.findIndex((x) => x.id === id); 

  if (idx === -1) return false; 

  mockDb.notifications.splice(idx, 1); 

  return true; 

} 

 

// DELETE ALL (si luego lo quieres usar) 

export async function clearAll(): Promise<void> { 

  if (!USE_MOCK) { 

    await http.delete<void>("/notifications"); 

    return; 

  } 

 

  await sleep(); 

  mockDb.notifications.length = 0; 

} 