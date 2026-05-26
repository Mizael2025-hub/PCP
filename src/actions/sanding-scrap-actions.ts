"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { SandingScrapService } from "@/services/sanding-scrap-service"
import {
  createSandingScrapSchema,
  updateSandingScrapSchema
} from "@/validations/sanding-scrap/scrap-schema"

const SANDING_SCRAP_PATH = "/producao/sanding-scrap"

const sandingScrapService = new SandingScrapService()

function revalidateSandingScrap() {
  revalidatePath(SANDING_SCRAP_PATH)
  revalidatePath("/producao")
}

export async function createSandingScrapAction(input: unknown) {
  const parsed = createSandingScrapSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await sandingScrapService.create(parsed.data)

  if (result.success) {
    revalidateSandingScrap()
  }

  return result
}

export async function updateSandingScrapAction(input: unknown) {
  const parsed = updateSandingScrapSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await sandingScrapService.update(parsed.data)

  if (result.success) {
    revalidateSandingScrap()
  }

  return result
}
