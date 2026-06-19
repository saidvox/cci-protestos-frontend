import { analysts, auditEntries, entities, protests, requests } from "@/mocks/data"
import type { AppService } from "@/services/contracts"
import type { AuthSession, RequestRecord, RequestStatus, Role } from "@/types/domain"

const wait = (milliseconds = 250) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const clone = <T>(value: T): T => structuredClone(value)

function page<T>(content: T[]) {
  return { content, page: 0, size: content.length, totalElements: content.length, totalPages: 1 }
}

function roleFor(email: string): Role {
  if (email.startsWith("analista")) return "ANALISTA"
  if (email.startsWith("entidad")) return "ENTIDAD"
  return "ADMIN"
}

export const mockService: AppService = {
  async login(credentials) {
    await wait()
    if (!credentials.email || !credentials.password) throw new Error("Ingresa correo y contraseña.")
    const role = roleFor(credentials.email.toLowerCase())
    return {
      token: "demo-jwt-token",
      expiresAt: "2099-01-01T00:00:00Z",
      user: { id: 1, name: role === "ADMIN" ? "Ana Torres" : role === "ANALISTA" ? "Carlos Ramos" : "Entidad Demo", email: credentials.email, roles: [role] },
    } satisfies AuthSession
  },
  async getProtests(query = "") {
    await wait()
    const term = query.trim().toLowerCase()
    return clone(protests.filter((item) => !term || item.debtorName.toLowerCase().includes(term) || item.documentNumber.includes(term)))
  },
  async getRequests(mine = false) {
    await wait()
    return page(clone(mine ? requests.filter((item) => item.financialEntity === "Banco Demo Ica") : requests))
  },
  async createRequest(input) {
    await wait()
    const entity = entities.find((item) => item.id === input.entityId)
    return { id: Date.now(), code: "SOL-2026-0049", applicant: "Entidad Demo", financialEntity: entity?.name ?? "Entidad Demo", type: input.type, status: "REGISTRADA", createdAt: "2026-06-18", documentoDeudor: input.documentoDeudor, montoProtestado: input.montoProtestado }
  },
  async updateRequestStatus(id, status, observation) {
    await wait()
    const current = requests.find((item) => item.id === id)
    if (!current) throw new Error("Solicitud no encontrada.")
    return { ...clone(current), status, observation } satisfies RequestRecord
  },
  async uploadDocument(requestId, file) { void requestId; void file; await wait(500) },
  async uploadExcel(file) { void file; await wait(500) },
  async getEntities() { await wait(); return clone(entities) },
  async createEntity(input) { await wait(); return { id: Date.now(), ...input, active: true } },
  async getAnalysts() { await wait(); return clone(analysts) },
  async createAnalyst(input) { await wait(); return { id: Date.now(), ...input, assigned: 0, active: true } },
  async getReport() {
    await wait()
    const byStatus = { REGISTRADA: 0, EN_REVISION: 0, OBSERVADA: 0, APROBADA: 0, RECHAZADA: 0 } satisfies Record<RequestStatus, number>
    requests.forEach((item) => { byStatus[item.status] += 1 })
    return { total: requests.length, byStatus }
  },
  async getAudit() { await wait(); return page(clone(auditEntries)) },
}
