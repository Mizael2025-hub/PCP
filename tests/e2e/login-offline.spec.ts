import { expect, test } from "@playwright/test"

test("login lida com offline (sem crash)", async ({ page, context }) => {
  await context.setOffline(true)
  await page.goto("/login")

  await expect(
    page.getByRole("heading", { name: "PCP Baterias" })
  ).toBeVisible()

  await page.getByLabel("E-mail").fill("admin@pcp.local")
  await page.getByLabel("Senha").fill("Admin123!")

  await page.getByRole("button", { name: "Entrar" }).click()

  // O app deve informar falha, mas não pode travar.
  await expect(page.getByText(/erro/i)).toBeVisible()
})
