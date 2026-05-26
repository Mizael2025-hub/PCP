import { expect, test } from "@playwright/test"

test("exibe página de login", async ({ page }) => {
  await page.goto("/login")

  await expect(
    page.getByRole("heading", { name: "PCP Baterias" })
  ).toBeVisible()
})
