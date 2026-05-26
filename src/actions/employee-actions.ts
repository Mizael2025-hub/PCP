"use server"

import { revalidatePath } from "next/cache"

import { actionFail } from "@/lib/utils/action-response"
import { EmployeeService } from "@/services/employee-service"
import {
  createEmployeeSchema,
  updateEmployeeSchema
} from "@/validations/employees/employee-schema"

const EMPLOYEES_PATH = "/configuracoes/funcionarios"

const employeeService = new EmployeeService()

function revalidateEmployees() {
  revalidatePath(EMPLOYEES_PATH)
  revalidatePath("/configuracoes")
}

export async function createEmployeeAction(input: unknown) {
  const parsed = createEmployeeSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await employeeService.create(parsed.data)

  if (result.success) {
    revalidateEmployees()
  }

  return result
}

export async function updateEmployeeAction(input: unknown) {
  const parsed = updateEmployeeSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await employeeService.update(parsed.data)

  if (result.success) {
    revalidateEmployees()
  }

  return result
}

export async function deleteEmployeeAction(id: string) {
  if (!id || typeof id !== "string") {
    return actionFail("ID inválido.")
  }

  const result = await employeeService.remove(id)

  if (result.success) {
    revalidateEmployees()
  }

  return result
}
