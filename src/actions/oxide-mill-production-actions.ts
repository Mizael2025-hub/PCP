"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { OxideMillProductionService } from "@/services/oxide-mill-production-service"
import {
  createOxideMillSchema,
  updateOxideMillSchema
} from "@/validations/oxide-mill-production/production-schema"

const OXIDE_MILL_PATH = "/producao/oxide-mill"

const oxideMillProductionService = new OxideMillProductionService()

function revalidateOxideMill() {
  revalidatePath(OXIDE_MILL_PATH)
  revalidatePath("/producao")
}

export async function createOxideMillAction(input: unknown) {
  const parsed = createOxideMillSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await oxideMillProductionService.create(parsed.data)

  if (result.success) {
    revalidateOxideMill()
  }

  return result
}

export async function updateOxideMillAction(input: unknown) {
  const parsed = updateOxideMillSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await oxideMillProductionService.update(parsed.data)

  if (result.success) {
    revalidateOxideMill()
  }

  return result
}
