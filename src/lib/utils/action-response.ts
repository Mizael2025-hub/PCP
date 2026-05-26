export type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  message?: string
}
