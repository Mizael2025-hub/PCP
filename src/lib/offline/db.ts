"use client"

import Dexie, { type Table } from "dexie"

export type OutboxOp =
  | "grid_casting_create"
  | "grid_casting_update"
  | "grid_casting_downtime_create"
  | "grid_casting_downtime_update"
  | "lead_ball_create"
  | "lead_ball_update"
  | "oxide_mill_create"
  | "oxide_mill_update"
  | "mixer_create"
  | "mixer_update"
  | "lead_consumption_create"
  | "lead_consumption_update"
  | "pasting_create"
  | "pasting_update"
  | "assembly_create"
  | "assembly_update"
  | "sanding_scrap_create"
  | "sanding_scrap_update"
  | "lab_qc_create"
  | "lab_qc_update"
  | "formation_create"
  | "formation_update"

export type OutboxItem = {
  id: string
  op: OutboxOp
  payload: unknown
  created_at: string
  attempts: number
  last_error: string | null
  sent_at?: string
}

class OfflineDb extends Dexie {
  outbox!: Table<OutboxItem, string>

  constructor() {
    super("pcp_offline_db")

    this.version(1).stores({
      outbox: "id, op, created_at, sent_at"
    })
  }
}

export const offlineDb = new OfflineDb()
