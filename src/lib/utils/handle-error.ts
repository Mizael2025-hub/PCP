export function handleError(functionName: string, error: unknown) {
  console.error(`[${functionName}]`, error)

  return {
    success: false,
    message: "Erro interno."
  }
}
