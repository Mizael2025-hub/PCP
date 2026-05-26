import { describe, expect, it, vi } from "vitest"

import { handleError } from "@/lib/utils/handle-error"

describe("handleError", () => {
  it("retorna resposta padronizada de erro", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = handleError("testFn", new Error("falha"))

    expect(result).toEqual({
      success: false,
      message: "Erro interno."
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
