import { AppError } from "@/lib/errors/app-error"
import { actionFail, type ActionResponse } from "@/lib/utils/action-response"

export function handleError(
  functionName: string,
  error: unknown
): ActionResponse<never> {
  console.error(`[${functionName}]`, error)

  if (error instanceof AppError) {
    return actionFail(error.message)
  }

  return actionFail()
}
