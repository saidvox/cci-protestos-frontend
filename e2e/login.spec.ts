import { expect, test } from "@playwright/test"
test("login demo abre el dashboard", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Correo institucional").fill("admin@demo.local")
  await page.getByLabel("Contraseña").fill("Demo123!")
  await page.getByRole("button", { name: "Iniciar sesión" }).click()
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
})
