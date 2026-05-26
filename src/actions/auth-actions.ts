"use server"

import { revalidatePath } from "next/cache"

import { AuthService } from "@/services/auth-service"
import { actionFail } from "@/lib/utils/action-response"
import { loginSchema, type LoginSchema } from "@/validations/auth/login-schema"

const authService = new AuthService()

export async function loginAction(input: LoginSchema) {
  const parsed = loginSchema.safeParse(input)

  if (!parsed.success) {
    return actionFail("Dados inválidos.")
  }

  const result = await authService.login(parsed.data)

  if (result.success) {
    revalidatePath("/", "layout")
  }

  return result
}

export async function logoutAction() {
  const result = await authService.logout()

  if (result.success) {
    revalidatePath("/", "layout")
  }

  return result
}

export async function getSessionAction() {
  return authService.getSession()
}
