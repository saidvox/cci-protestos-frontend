import { describe, expect, it } from "vitest"
import {
  adaptAnalyst,
  adaptAudit,
  adaptEntity,
  adaptLogin,
  adaptPage,
  adaptProtest,
  adaptReport,
  adaptRequest,
} from "@/services/api-adapters"

describe("API DTO adapters", () => {
  it("maps the backend login shape", () => {
    expect(adaptLogin({ accessToken: "jwt", tokenType: "Bearer", expiresAt: "2099-01-01T00:00:00Z", usuario: { id: 3, nombre: "Ana", email: "ana@demo.local", roles: ["ADMIN"] } })).toMatchObject({ token: "jwt", user: { id: 3, name: "Ana", roles: ["ADMIN"] } })
  })
  it("maps protest, request and catalog DTOs", () => {
    expect(adaptProtest({ id: 1, numeroDocumento: "20", nombreDeudor: "Empresa", entidad: "Banco", tipoTitulo: "Letra", monto: 25, moneda: "PEN", fechaProtesto: "2026-01-01", vigente: true })).toMatchObject({ documentNumber: "20", debtorName: "Empresa", status: "VIGENTE" })
    expect(adaptRequest({ id: 2, codigo: "SOL-1", solicitante: "Ana", entidad: "Banco", analista: null, estado: "REGISTRADA", motivo: "Registro | Detalle", observacion: null, creadoEn: "2026-01-01T00:00:00Z", actualizadoEn: "2026-01-01T00:00:00Z" })).toMatchObject({ code: "SOL-1", applicant: "Ana", type: "Registro" })
    expect(adaptEntity({ id: 1, ruc: "201", razonSocial: "Banco", contacto: "Persona", email: "p@demo.local", activo: true })).toMatchObject({ name: "Banco", contact: "Persona", email: "p@demo.local" })
    expect(adaptAnalyst({ id: 1, codigo: "AN-01", nombre: "Carlos", email: "c@demo.local", disponible: true })).toMatchObject({ code: "AN-01", name: "Carlos", active: true })
  })
  it("maps reports, audits and page metadata", () => {
    expect(adaptReport({ total: 2, porEstado: { REGISTRADA: 2 } }).byStatus.REGISTRADA).toBe(2)
    expect(adaptAudit({ id: 1, actor: "Ana", accion: "CREÓ", recurso: "Solicitud", recursoId: "1", detalle: "ok", fecha: "2026-01-01T00:00:00Z" })).toMatchObject({ action: "CREÓ", resource: "Solicitud" })
    expect(adaptPage({ content: [1, 2], page: 1, size: 10, totalElements: 12, totalPages: 2 }, (value) => String(value))).toEqual({ content: ["1", "2"], page: 1, size: 10, totalElements: 12, totalPages: 2 })
  })
})
