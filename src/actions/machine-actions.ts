"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { MachineService } from "@/services/machine-service"
import {
  createMachineSchema,
  updateMachineSchema
} from "@/validations/machines/machine-schema"

const MACHINES_PATH = "/configuracoes/maquinas"

const machineService = new MachineService()

function revalidateMachines() {
  revalidatePath(MACHINES_PATH)
  revalidatePath("/configuracoes")
}

export async function createMachineAction(input: unknown) {
  const parsed = createMachineSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await machineService.create(parsed.data)

  if (result.success) {
    revalidateMachines()
  }

  return result
}

export async function updateMachineAction(input: unknown) {
  const parsed = updateMachineSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await machineService.update(parsed.data)

  if (result.success) {
    revalidateMachines()
  }

  return result
}

export async function deleteMachineAction(id: string) {
  if (!id || typeof id !== "string") {
    return actionFail("ID inválido.")
  }

  const result = await machineService.remove(id)

  if (result.success) {
    revalidateMachines()
  }

  return result
}
