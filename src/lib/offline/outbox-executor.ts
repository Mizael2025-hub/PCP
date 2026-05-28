"use client"

import {
  createAssemblyAction,
  updateAssemblyAction
} from "@/actions/assembly-production-actions"
import {
  createGridCastingAction,
  updateGridCastingAction
} from "@/actions/grid-casting-actions"
import {
  createGridCastingDowntimeAction,
  updateGridCastingDowntimeAction
} from "@/actions/grid-casting-downtime-actions"
import {
  createLabQualityControlAction,
  updateLabQualityControlAction
} from "@/actions/lab-quality-control-actions"
import {
  createLeadBallAction,
  updateLeadBallAction
} from "@/actions/lead-ball-production-actions"
import {
  createLeadConsumptionAction,
  updateLeadConsumptionAction
} from "@/actions/lead-consumption-actions"
import {
  createMixerAction,
  updateMixerAction
} from "@/actions/mixer-production-actions"
import {
  createOxideMillAction,
  updateOxideMillAction
} from "@/actions/oxide-mill-production-actions"
import {
  createPastingAction,
  updatePastingAction
} from "@/actions/pasting-production-actions"
import {
  createSandingScrapAction,
  updateSandingScrapAction
} from "@/actions/sanding-scrap-actions"
import {
  createFormationRecordAction,
  updateFormationRecordAction
} from "@/actions/formation-record-actions"
import type { ActionResponse } from "@/lib/utils/action-response"
import type { OutboxItem, OutboxOp } from "@/lib/offline/db"

function fail(message: string): ActionResponse<never> {
  return { success: false, message }
}

export async function executeOutboxItem(
  item: OutboxItem
): Promise<ActionResponse<unknown>> {
  const op: OutboxOp = item.op
  const payload = item.payload

  switch (op) {
    case "grid_casting_create":
      return await createGridCastingAction(payload)
    case "grid_casting_update":
      return await updateGridCastingAction(payload)
    case "grid_casting_downtime_create":
      return await createGridCastingDowntimeAction(payload)
    case "grid_casting_downtime_update":
      return await updateGridCastingDowntimeAction(payload)
    case "lead_ball_create":
      return await createLeadBallAction(payload)
    case "lead_ball_update":
      return await updateLeadBallAction(payload)
    case "oxide_mill_create":
      return await createOxideMillAction(payload)
    case "oxide_mill_update":
      return await updateOxideMillAction(payload)
    case "mixer_create":
      return await createMixerAction(payload)
    case "mixer_update":
      return await updateMixerAction(payload)
    case "lead_consumption_create":
      return await createLeadConsumptionAction(payload)
    case "lead_consumption_update":
      return await updateLeadConsumptionAction(payload)
    case "pasting_create":
      return await createPastingAction(payload)
    case "pasting_update":
      return await updatePastingAction(payload)
    case "assembly_create":
      return await createAssemblyAction(payload)
    case "assembly_update":
      return await updateAssemblyAction(payload)
    case "sanding_scrap_create":
      return await createSandingScrapAction(payload)
    case "sanding_scrap_update":
      return await updateSandingScrapAction(payload)
    case "lab_qc_create":
      return await createLabQualityControlAction(payload)
    case "lab_qc_update":
      return await updateLabQualityControlAction(payload)
    case "formation_create":
      return await createFormationRecordAction(payload)
    case "formation_update":
      return await updateFormationRecordAction(payload)
    default:
      return fail("Operação offline desconhecida.")
  }
}
