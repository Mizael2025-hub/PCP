"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { GridCastingService } from "@/services/grid-casting-service"
import {
  createGridCastingSchema,
  updateGridCastingSchema
} from "@/validations/grid-casting/production-schema"

const GRID_CASTING_PATH = "/producao/grid-casting"

const gridCastingService = new GridCastingService()

function revalidateGridCasting() {
  revalidatePath(GRID_CASTING_PATH)
  revalidatePath("/producao")
}

export async function createGridCastingAction(input: unknown) {
  const parsed = createGridCastingSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await gridCastingService.create(parsed.data)

  if (result.success) {
    revalidateGridCasting()
  }

  return result
}

export async function updateGridCastingAction(input: unknown) {
  const parsed = updateGridCastingSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await gridCastingService.update(parsed.data)

  if (result.success) {
    revalidateGridCasting()
  }

  return result
}
