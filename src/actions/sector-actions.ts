"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { SectorService } from "@/services/sector-service"
import {
  createSectorSchema,
  updateSectorSchema
} from "@/validations/sectors/sector-schema"

const SECTORS_PATH = "/configuracoes/setores"

const sectorService = new SectorService()

function revalidateSectors() {
  revalidatePath(SECTORS_PATH)
  revalidatePath("/configuracoes")
}

export async function createSectorAction(input: unknown) {
  const parsed = createSectorSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await sectorService.create(parsed.data)

  if (result.success) {
    revalidateSectors()
  }

  return result
}

export async function updateSectorAction(input: unknown) {
  const parsed = updateSectorSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await sectorService.update(parsed.data)

  if (result.success) {
    revalidateSectors()
  }

  return result
}

export async function deleteSectorAction(id: string) {
  if (!id || typeof id !== "string") {
    return actionFail("ID inválido.")
  }

  const result = await sectorService.remove(id)

  if (result.success) {
    revalidateSectors()
  }

  return result
}
