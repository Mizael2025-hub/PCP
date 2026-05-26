"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { LeadConsumptionService } from "@/services/lead-consumption-service"
import {
  createLeadConsumptionSchema,
  updateLeadConsumptionSchema
} from "@/validations/lead-consumption/consumption-schema"

const LEAD_CONSUMPTION_PATH = "/producao/lead-consumption"

const leadConsumptionService = new LeadConsumptionService()

function revalidateLeadConsumption() {
  revalidatePath(LEAD_CONSUMPTION_PATH)
  revalidatePath("/producao")
}

export async function createLeadConsumptionAction(input: unknown) {
  const parsed = createLeadConsumptionSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await leadConsumptionService.create(parsed.data)

  if (result.success) {
    revalidateLeadConsumption()
  }

  return result
}

export async function updateLeadConsumptionAction(input: unknown) {
  const parsed = updateLeadConsumptionSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await leadConsumptionService.update(parsed.data)

  if (result.success) {
    revalidateLeadConsumption()
  }

  return result
}
