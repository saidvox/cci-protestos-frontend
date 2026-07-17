import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { useAuth } from "@/features/auth/auth-context"
import { ErpLoginPage } from "@/features/auth/pages/erp-login-page"
import { LoginPage } from "@/features/auth/pages/login-page"
import type { AuthSession, Role } from "@/shared/types/domain"

vi.mock("@/features/auth/auth-context", () => ({ useAuth: vi.fn() }))

const authenticate = vi.fn()
const acceptSession = vi.fn()

function sessionFor(role: Role): AuthSession {
  return {
    expiresAt: "2099-01-01T00:00:00Z",
    user: { id: 1, name: "Demo", email: "demo@local", roles: [role] },
  }
}

function mockGuest() {
  vi.mocked(useAuth).mockReturnValue({
    session: null,
    loading: false,
    isAuthenticated: false,
    authenticate,
    acceptSession,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

async function fillPublicCredentials() {
  await userEvent.type(screen.getByLabelText(/DNI, RUC o correo/i), "usuario@test.local")
  await userEvent.type(screen.getByLabelText(/Contraseña/i), "Password1!")
}

async function fillErpCredentials() {
  await userEvent.type(screen.getByLabelText(/Correo institucional/i), "admin@test.local")
  await userEvent.type(screen.getByLabelText(/Contraseña/i), "Password1!")
}

describe("login entrypoints", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("public login accepts debtor and bank analyst roles", async () => {
    mockGuest()
    authenticate.mockResolvedValue(sessionFor("BANK_ANALYST"))

    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await fillPublicCredentials()
    await userEvent.click(screen.getByRole("button", { name: /^Iniciar sesi/i }))

    expect(acceptSession).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ roles: ["BANK_ANALYST"] }),
    }))
  })

  it("public login rejects ERP roles", async () => {
    mockGuest()
    authenticate.mockResolvedValue(sessionFor("CCI_ADMIN"))

    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await fillPublicCredentials()
    await userEvent.click(screen.getByRole("button", { name: /^Iniciar sesi/i }))

    expect(await screen.findByText(/Para ingresar al ERP/)).toBeInTheDocument()
    expect(acceptSession).not.toHaveBeenCalled()
  })

  it("ERP login accepts CCI internal roles", async () => {
    mockGuest()
    authenticate.mockResolvedValue(sessionFor("CCI_STAFF"))

    render(<MemoryRouter><ErpLoginPage /></MemoryRouter>)
    await fillErpCredentials()
    await userEvent.click(screen.getByRole("button", { name: /^Ingresar al ERP$/i }))

    expect(acceptSession).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ roles: ["CCI_STAFF"] }),
    }))
  })

  it("ERP login rejects public portal roles", async () => {
    mockGuest()
    authenticate.mockResolvedValue(sessionFor("USER_DEBTOR"))

    render(<MemoryRouter><ErpLoginPage /></MemoryRouter>)
    await fillErpCredentials()
    await userEvent.click(screen.getByRole("button", { name: /^Ingresar al ERP$/i }))

    expect(await screen.findByText(/no tiene permisos/)).toBeInTheDocument()
    expect(acceptSession).not.toHaveBeenCalled()
  })
})
