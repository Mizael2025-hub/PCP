"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { GridCastingDowntimeService } from "@/services/grid-casting-downtime-service"
import {
  createGridCastingDowntimeSchema,
  updateGridCastingDowntimeSchema
} from "@/validations/grid-casting/downtime-schema"

const GRID_CASTING_PATH = "/producao/grid-casting"

const gridCastingDowntimeService = new GridCastingDowntimeService()

function revalidateGridCasting() {
  revalidatePath(GRID_CASTING_PATH)
  revalidatePath("/producao")
}

export async function createGridCastingDowntimeAction(input: unknown) {
  const parsed = createGridCastingDowntimeSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await gridCastingDowntimeService.create(parsed.data)

  if (result.success) {
    revalidateGridCasting()
  }

  return result
}

export async function updateGridCastingDowntimeAction(input: unknown) {
  const parsed = updateGridCastingDowntimeSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await gridCastingDowntimeService.update(parsed.data)

  if (result.success) {
    revalidateGridCasting()
  }

  return result
}
