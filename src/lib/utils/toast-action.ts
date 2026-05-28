"use client"

import { toast } from "sonner"

import type { ActionResponse } from "@/lib/utils/action-response"

type ToastFromActionOptions = {
  successFallback?: string
  errorFallback?: string
  showSuccess?: boolean
}

export function toastFromActionResponse<T>(
  result: ActionResponse<T>,
  options: ToastFromActionOptions = {}
): boolean {
  const { successFallback, errorFallback, showSuccess = true } = options

  if (!result.success) {
    toast.error(result.message ?? errorFallback ?? "Erro ao concluir operação.")
    return false
  }

  if (showSuccess) {
    toast.success(result.message ?? successFallback ?? "Operação concluída.")
  }

  return true
}
