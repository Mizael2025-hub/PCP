import type { ActionResponse } from "@/lib/utils/action-response"
import { handleError } from "@/lib/utils/handle-error"

export abstract class BaseService {
  protected handleError(
    functionName: string,
    error: unknown
  ): ActionResponse<never> {
    return handleError(functionName, error)
  }
}
