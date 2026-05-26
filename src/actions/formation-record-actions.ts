"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { FormationRecordService } from "@/services/formation-record-service"
import {
  createFormationRecordSchema,
  updateFormationRecordSchema
} from "@/validations/formation-records/formation-schema"

const FORMATION_PATH = "/qualidade/formacao"

const formationRecordService = new FormationRecordService()

function revalidateFormation() {
  revalidatePath(FORMATION_PATH)
  revalidatePath("/qualidade")
}

export async function createFormationRecordAction(input: unknown) {
  const parsed = createFormationRecordSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await formationRecordService.create(parsed.data)

  if (result.success) {
    revalidateFormation()
  }

  return result
}

export async function updateFormationRecordAction(input: unknown) {
  const parsed = updateFormationRecordSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await formationRecordService.update(parsed.data)

  if (result.success) {
    revalidateFormation()
  }

  return result
}
