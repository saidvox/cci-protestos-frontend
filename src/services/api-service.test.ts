import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/services/api-client"
import { apiService } from "@/services/api-service"

describe("API service contracts", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("sends document and name as independent protest filters", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: [] })
    await apiService.getProtests({ documento: "201", nombre: "Empresa" })
    expect(get).toHaveBeenCalledWith("/protestos/consulta", { params: { documento: "201", nombre: "Empresa" } })
  })

  it("obtains CSRF before cookie-based login", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: {} })
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: { expiresAt: "2099-01-01T00:00:00Z", usuario: { id: 1, nombre: "Ana", email: "ana@demo.local", roles: ["ADMIN"] } } })
    await apiService.login({ email: "ana@demo.local", password: "secret" })
    expect(get).toHaveBeenCalledWith("/auth/csrf")
    expect(get.mock.invocationCallOrder[0]).toBeLessThan(post.mock.invocationCallOrder[0])
  })

  it("forwards page metadata parameters", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: { content: [], page: 2, size: 10, totalElements: 0, totalPages: 0 } })
    const result = await apiService.getRequests({ mine: true, page: 2, size: 10 })
    expect(get).toHaveBeenCalledWith("/solicitudes/mis-solicitudes", { params: { page: 2, size: 10 } })
    expect(result.page).toBe(2)
  })
})
