"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { LeadBallProductionService } from "@/services/lead-ball-production-service"
import {
  createLeadBallSchema,
  updateLeadBallSchema
} from "@/validations/lead-ball-production/production-schema"

const LEAD_BALL_PATH = "/producao/lead-ball"

const leadBallProductionService = new LeadBallProductionService()

function revalidateLeadBall() {
  revalidatePath(LEAD_BALL_PATH)
  revalidatePath("/producao")
}

export async function createLeadBallAction(input: unknown) {
  const parsed = createLeadBallSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await leadBallProductionService.create(parsed.data)

  if (result.success) {
    revalidateLeadBall()
  }

  return result
}

export async function updateLeadBallAction(input: unknown) {
  const parsed = updateLeadBallSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await leadBallProductionService.update(parsed.data)

  if (result.success) {
    revalidateLeadBall()
  }

  return result
}
