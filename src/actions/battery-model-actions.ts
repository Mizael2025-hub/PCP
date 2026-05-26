"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { BatteryModelService } from "@/services/battery-model-service"
import {
  createBatteryModelSchema,
  updateBatteryModelSchema
} from "@/validations/battery-models/battery-model-schema"

const BATTERY_MODELS_PATH = "/configuracoes/modelos-bateria"

const batteryModelService = new BatteryModelService()

function revalidateBatteryModels() {
  revalidatePath(BATTERY_MODELS_PATH)
  revalidatePath("/configuracoes")
}

export async function createBatteryModelAction(input: unknown) {
  const parsed = createBatteryModelSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await batteryModelService.create(parsed.data)

  if (result.success) {
    revalidateBatteryModels()
  }

  return result
}

export async function updateBatteryModelAction(input: unknown) {
  const parsed = updateBatteryModelSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await batteryModelService.update(parsed.data)

  if (result.success) {
    revalidateBatteryModels()
  }

  return result
}

export async function deleteBatteryModelAction(id: string) {
  if (!id || typeof id !== "string") {
    return actionFail("ID inválido.")
  }

  const result = await batteryModelService.remove(id)

  if (result.success) {
    revalidateBatteryModels()
  }

  return result
}
