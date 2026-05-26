"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { LeadAlloyService } from "@/services/lead-alloy-service"
import {
  createLeadAlloySchema,
  updateLeadAlloySchema
} from "@/validations/lead-alloys/lead-alloy-schema"

const LEAD_ALLOYS_PATH = "/configuracoes/ligas"

const leadAlloyService = new LeadAlloyService()

function revalidateLeadAlloys() {
  revalidatePath(LEAD_ALLOYS_PATH)
  revalidatePath("/configuracoes")
}

export async function createLeadAlloyAction(input: unknown) {
  const parsed = createLeadAlloySchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await leadAlloyService.create(parsed.data)

  if (result.success) {
    revalidateLeadAlloys()
  }

  return result
}

export async function updateLeadAlloyAction(input: unknown) {
  const parsed = updateLeadAlloySchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await leadAlloyService.update(parsed.data)

  if (result.success) {
    revalidateLeadAlloys()
  }

  return result
}

export async function deleteLeadAlloyAction(id: string) {
  if (!id || typeof id !== "string") {
    return actionFail("ID inválido.")
  }

  const result = await leadAlloyService.remove(id)

  if (result.success) {
    revalidateLeadAlloys()
  }

  return result
}
