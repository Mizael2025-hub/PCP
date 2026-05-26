export type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  message?: string
}

export function actionSuccess<T>(
  data?: T,
  message?: string
): ActionResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

export function actionFail(message = "Erro interno."): ActionResponse<never> {
  return {
    success: false,
    message
  }
}
