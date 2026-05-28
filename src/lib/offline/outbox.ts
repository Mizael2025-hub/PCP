"use client"

import { offlineDb, type OutboxItem, type OutboxOp } from "@/lib/offline/db"

function nowIso(): string {
  return new Date().toISOString()
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `outbox_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export async function enqueueOutbox(op: OutboxOp, payload: unknown) {
  const item: OutboxItem = {
    id: genId(),
    op,
    payload,
    created_at: nowIso(),
    attempts: 0,
    last_error: null,
    sent_at: undefined
  }

  await offlineDb.outbox.add(item)
  return item
}

export async function listPendingOutbox(limit = 20): Promise<OutboxItem[]> {
  const items = await offlineDb.outbox
    .filter((item) => !item.sent_at)
    .sortBy("created_at")

  return items.slice(0, limit)
}

export async function markOutboxSent(id: string) {
  await offlineDb.outbox.update(id, { sent_at: nowIso(), last_error: null })
}

export async function markOutboxFailed(id: string, errorMessage: string) {
  const existing = await offlineDb.outbox.get(id)
  const attempts = (existing?.attempts ?? 0) + 1

  await offlineDb.outbox.update(id, {
    attempts,
    last_error: errorMessage
  })
}

export async function countPendingOutbox(): Promise<number> {
  return offlineDb.outbox.filter((item) => !item.sent_at).count()
}
