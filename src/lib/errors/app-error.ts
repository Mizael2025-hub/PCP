export class AppError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
  }

  static badRequest(message: string) {
    return new AppError(message, 400)
  }

  static unauthorized(message = "Não autorizado.") {
    return new AppError(message, 401)
  }

  static notFound(message = "Recurso não encontrado.") {
    return new AppError(message, 404)
  }
}
