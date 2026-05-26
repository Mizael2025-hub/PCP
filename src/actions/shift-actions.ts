"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { ShiftService } from "@/services/shift-service"
import {
  createShiftSchema,
  updateShiftSchema
} from "@/validations/shifts/shift-schema"

const SHIFTS_PATH = "/configuracoes/turnos"

const shiftService = new ShiftService()

function revalidateShifts() {
  revalidatePath(SHIFTS_PATH)
  revalidatePath("/configuracoes")
}

export async function createShiftAction(input: unknown) {
  const parsed = createShiftSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await shiftService.create(parsed.data)

  if (result.success) {
    revalidateShifts()
  }

  return result
}

export async function updateShiftAction(input: unknown) {
  const parsed = updateShiftSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await shiftService.update(parsed.data)

  if (result.success) {
    revalidateShifts()
  }

  return result
}

export async function deleteShiftAction(id: string) {
  if (!id || typeof id !== "string") {
    return actionFail("ID inválido.")
  }

  const result = await shiftService.remove(id)

  if (result.success) {
    revalidateShifts()
  }

  return result
}
