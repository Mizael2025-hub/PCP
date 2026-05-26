"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { AssemblyProductionService } from "@/services/assembly-production-service"
import {
  createAssemblySchema,
  updateAssemblySchema
} from "@/validations/assembly-production/production-schema"

const ASSEMBLY_PATH = "/producao/assembly"

const assemblyProductionService = new AssemblyProductionService()

function revalidateAssembly() {
  revalidatePath(ASSEMBLY_PATH)
  revalidatePath("/producao")
}

export async function createAssemblyAction(input: unknown) {
  const parsed = createAssemblySchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await assemblyProductionService.create(parsed.data)

  if (result.success) {
    revalidateAssembly()
  }

  return result
}

export async function updateAssemblyAction(input: unknown) {
  const parsed = updateAssemblySchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await assemblyProductionService.update(parsed.data)

  if (result.success) {
    revalidateAssembly()
  }

  return result
}
