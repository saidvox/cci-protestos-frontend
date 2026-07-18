import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AnalystActivationPage } from "@/features/auth/pages/analyst-activation-page"
import { appService } from "@/shared/services/service-factory"

vi.mock("@/shared/services/service-factory", () => ({
  appService: {
    validateAnalystInvitation: vi.fn(),
    activateAnalyst: vi.fn(),
  },
}))

describe("AnalystActivationPage", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("validates the invitation and activates the analyst account", async () => {
    vi.mocked(appService.validateAnalystInvitation).mockResolvedValue({
      name: "Analista Ica",
      email: "analista@banco.test",
      entity: "Banco Ica",
      expiresAt: "2099-01-01T00:00:00Z",
    })
    vi.mocked(appService.activateAnalyst).mockResolvedValue()

    render(<MemoryRouter initialEntries={["/analista/activar?token=valid-token"]}><AnalystActivationPage /></MemoryRouter>)
    expect(await screen.findByText("Analista Ica")).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText("Nueva contraseña"), "ClaveSegura1!")
    await userEvent.type(screen.getByLabelText("Confirmar contraseña"), "ClaveSegura1!")
    await userEvent.click(screen.getByRole("button", { name: "Activar mi cuenta" }))

    expect(await screen.findByText("Cuenta activada")).toBeInTheDocument()
    expect(appService.activateAnalyst).toHaveBeenCalledWith("valid-token", "ClaveSegura1!")
  })

  it("shows a safe error for an invalid invitation", async () => {
    vi.mocked(appService.validateAnalystInvitation).mockRejectedValue(new Error("La invitación es inválida, venció o ya fue utilizada."))
    render(<MemoryRouter initialEntries={["/analista/activar?token=invalid"]}><AnalystActivationPage /></MemoryRouter>)
    expect(await screen.findByText("Invitación no disponible")).toBeInTheDocument()
  })
})
