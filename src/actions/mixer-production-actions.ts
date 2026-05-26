"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { MixerProductionService } from "@/services/mixer-production-service"
import {
  createMixerSchema,
  updateMixerSchema
} from "@/validations/mixer-production/production-schema"

const MIXER_PATH = "/producao/mixer"

const mixerProductionService = new MixerProductionService()

function revalidateMixer() {
  revalidatePath(MIXER_PATH)
  revalidatePath("/producao")
}

export async function createMixerAction(input: unknown) {
  const parsed = createMixerSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await mixerProductionService.create(parsed.data)

  if (result.success) {
    revalidateMixer()
  }

  return result
}

export async function updateMixerAction(input: unknown) {
  const parsed = updateMixerSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await mixerProductionService.update(parsed.data)

  if (result.success) {
    revalidateMixer()
  }

  return result
}
