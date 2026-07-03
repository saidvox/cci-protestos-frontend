import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "@/features/auth/auth-context"
import { appService } from "@/shared/services/service-factory"

vi.mock("@/shared/services/service-factory", () => ({ appService: { getSession: vi.fn(), login: vi.fn(), logout: vi.fn() } }))
function Probe() { const { session, login, logout } = useAuth(); return <><span>{session?.user.email ?? "guest"}</span><button onClick={() => void login({ email: "ana@demo.local", password: "secret" })}>login</button><button onClick={() => void logout()}>logout</button></> }
describe("AuthProvider", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })
  it("loads the active cookie-backed session on startup", async () => {
    vi.mocked(appService.getSession).mockResolvedValue({ expiresAt: "2099-01-01T00:00:00Z", user: { id: 1, name: "Ana", email: "ana@demo.local", roles: ["CCI_ADMIN"] } })
    render(<AuthProvider><Probe /></AuthProvider>); expect(await screen.findByText("ana@demo.local")).toBeInTheDocument()
  })
  it("keeps only the cookie-backed session in memory", async () => {
    vi.mocked(appService.getSession).mockRejectedValue(new Error("No session"))
    vi.mocked(appService.login).mockResolvedValue({ expiresAt: "2099-01-01T00:00:00Z", user: { id: 1, name: "Ana", email: "ana@demo.local", roles: ["CCI_ADMIN"] } })
    render(<AuthProvider><Probe /></AuthProvider>); expect(screen.getByText("guest")).toBeInTheDocument(); await userEvent.click(screen.getByText("login")); expect(await screen.findByText("ana@demo.local")).toBeInTheDocument(); expect(sessionStorage).toHaveLength(0)
  })
  it("calls server logout and clears the in-memory user", async () => {
    vi.mocked(appService.getSession).mockRejectedValue(new Error("No session"))
    vi.mocked(appService.login).mockResolvedValue({ expiresAt: "2099-01-01T00:00:00Z", user: { id: 1, name: "Ana", email: "ana@demo.local", roles: ["CCI_ADMIN"] } }); vi.mocked(appService.logout).mockResolvedValue()
    render(<AuthProvider><Probe /></AuthProvider>); await userEvent.click(screen.getByText("login")); await screen.findByText("ana@demo.local"); await userEvent.click(screen.getByText("logout")); expect(await screen.findByText("guest")).toBeInTheDocument(); expect(appService.logout).toHaveBeenCalledOnce()
  })
})
