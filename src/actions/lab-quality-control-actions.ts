"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { LabQualityControlService } from "@/services/lab-quality-control-service"
import {
  createLabQualityControlSchema,
  updateLabQualityControlSchema
} from "@/validations/lab-quality-control/quality-schema"

const LAB_QC_PATH = "/qualidade/laboratorio"

const labQualityControlService = new LabQualityControlService()

function revalidateLabQualityControl() {
  revalidatePath(LAB_QC_PATH)
  revalidatePath("/qualidade")
}

export async function createLabQualityControlAction(input: unknown) {
  const parsed = createLabQualityControlSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await labQualityControlService.create(parsed.data)

  if (result.success) {
    revalidateLabQualityControl()
  }

  return result
}

export async function updateLabQualityControlAction(input: unknown) {
  const parsed = updateLabQualityControlSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await labQualityControlService.update(parsed.data)

  if (result.success) {
    revalidateLabQualityControl()
  }

  return result
}
