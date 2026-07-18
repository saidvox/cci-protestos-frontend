import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/services/api-client"
import { apiService } from "@/shared/services/api-service"

describe("API service contracts", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("sends document and name as independent protest filters", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: { content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 } })
    const result = await apiService.getProtests({ documento: "201", nombre: "Empresa", estado: "VIGENTE", page: 1, size: 10 })
    expect(get).toHaveBeenCalledWith("/protestos/consulta", { params: { documento: "201", nombre: "Empresa", estado: "VIGENTE", page: 1, size: 10 } })
    expect(result.page).toBe(1)
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

  it("creates a request and its documents in one multipart operation", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ data: {} })
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: {
      id: 7, codigo: "SOL-ATOMIC", solicitante: "Deudor", entidad: "Banco",
      tipoTramite: "REGULARIZACION", estado: "REGISTRADA", creadoEn: "2026-07-18T00:00:00Z",
      numeroDocumentoDeudor: "12345678", monto: 100, moneda: "PEN", motivo: "Pago", version: 0,
    } })
    const voucher = new File(["%PDF-1.4"], "voucher.pdf", { type: "application/pdf" })

    const result = await apiService.createRequest({
      type: "REGULARIZACION", entityId: 2, documentNumber: "12345678", amount: 100, currency: "PEN", reason: "Pago",
    }, [voucher])

    const multipartCall = post.mock.calls.find(([url]) => url === "/solicitudes/con-documentos")
    expect(multipartCall).toBeDefined()
    expect(multipartCall?.[1]).toBeInstanceOf(FormData)
    expect((multipartCall?.[1] as FormData).getAll("files")).toHaveLength(1)
    expect(result.code).toBe("SOL-ATOMIC")
  })
})
