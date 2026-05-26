"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { PastingProductionService } from "@/services/pasting-production-service"
import {
  createPastingSchema,
  updatePastingSchema
} from "@/validations/pasting-production/production-schema"

const PASTING_PATH = "/producao/pasting"

const pastingProductionService = new PastingProductionService()

function revalidatePasting() {
  revalidatePath(PASTING_PATH)
  revalidatePath("/producao")
}

export async function createPastingAction(input: unknown) {
  const parsed = createPastingSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await pastingProductionService.create(parsed.data)

  if (result.success) {
    revalidatePasting()
  }

  return result
}

export async function updatePastingAction(input: unknown) {
  const parsed = updatePastingSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await pastingProductionService.update(parsed.data)

  if (result.success) {
    revalidatePasting()
  }

  return result
}
