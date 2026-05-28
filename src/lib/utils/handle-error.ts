import { AppError } from "@/lib/errors/app-error"
import { actionFail, type ActionResponse } from "@/lib/utils/action-response"

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) {
    return null
  }

  if (!("code" in error)) {
    return null
  }

  const code = (error as { code?: unknown }).code
  return typeof code === "string" ? code : null
}

function mapDatabaseErrorMessage(error: unknown): string | null {
  const code = getErrorCode(error)

  // Postgres error codes commonly surfaced by Supabase/PostgREST
  switch (code) {
    case "23505":
      return "Já existe um registro com este valor."
    case "23503":
      return "Não foi possível concluir: existe vínculo com outro registro."
    case "23502":
      return "Campo obrigatório não informado."
    case "23514":
      return "Valor fora da faixa permitida."
    default:
      return null
  }
}

export function handleError(
  functionName: string,
  error: unknown
): ActionResponse<never> {
  console.error(`[${functionName}]`, error)

  if (error instanceof AppError) {
    return actionFail(error.message)
  }

  const dbMessage = mapDatabaseErrorMessage(error)
  if (dbMessage) {
    return actionFail(dbMessage)
  }

  return actionFail("Erro interno.")
}
