import { analysts, auditEntries, entities, protests, requests } from "@/mocks/data"
import type { AppService } from "@/services/contracts"
import type { AuthSession, RegisterInput, RequestRecord, RequestStatus, Role } from "@/types/domain"

const wait = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

function page<T>(items: T[], index = 0, size = 10) {
  const start = index * size
  return { content: items.slice(start, start + size), page: index, size, totalElements: items.length, totalPages: Math.ceil(items.length / size) }
}

function roleFor(email: string): Role {
  if (email.startsWith("admin")) return "CCI_ADMIN"
  if (email.startsWith("staff")) return "CCI_STAFF"
  if (email.startsWith("analista")) return "BANK_ANALYST"
  return "USER_DEBTOR"
}

function report() {
  const byStatus: Partial<Record<RequestStatus, number>> = {}
  requests.forEach((item) => {
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1
  })
  return { total: requests.length, byStatus }
}

interface MockUser {
  id: number
  nombreCompleto: string
  email: string
  tipoDocumento: string
  numeroDocumento: string
}

export const mockService: AppService = {
  async getCsrf() {},
  async login(credentials) {
    await wait()
    if (!credentials.email || !credentials.password) throw new Error("Ingresa correo y contraseña.")
    
    const registeredUsersStr = localStorage.getItem("mock_users")
    const registeredUsers: MockUser[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : []
    const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase())
    
    let name: string
    let role: Role
    if (foundUser) {
      name = foundUser.nombreCompleto
      role = "USER_DEBTOR"
    } else {
      role = roleFor(credentials.email.toLowerCase())
      name = role === "CCI_ADMIN" ? "Ana Torres" : role === "CCI_STAFF" ? "Pedro Staff" : role === "BANK_ANALYST" ? "Carlos Ramos" : "Deudor Demo"
    }

    const session: AuthSession = {
      expiresAt: "2099-01-01T00:00:00Z",
      user: {
        id: foundUser?.id || Date.now(),
        name,
        email: credentials.email,
        roles: [role],
        tipoDocumento: foundUser ? foundUser.tipoDocumento : (role === "USER_DEBTOR" ? "RUC" : undefined),
        numeroDocumento: foundUser ? foundUser.numeroDocumento : (role === "USER_DEBTOR" ? "20123456789" : undefined),
      },
    }
    localStorage.setItem("mock_session", JSON.stringify(session))
    return session
  },
  async logout() {
    await wait()
    localStorage.removeItem("mock_session")
  },
  async getSession() {
    await wait()
    const sessionStr = localStorage.getItem("mock_session")
    if (!sessionStr) throw new Error("No session active")
    return JSON.parse(sessionStr) as AuthSession
  },
  async register(input: RegisterInput) {
    await wait()
    const registeredUsersStr = localStorage.getItem("mock_users")
    const registeredUsers: MockUser[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : []
    if (registeredUsers.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("El correo electrónico ya está registrado.")
    }
    const newUser: MockUser = {
      id: Date.now(),
      nombreCompleto: input.nombreCompleto,
      email: input.email,
      tipoDocumento: input.tipoDocumento,
      numeroDocumento: input.numeroDocumento,
    }
    registeredUsers.push(newUser)
    localStorage.setItem("mock_users", JSON.stringify(registeredUsers))
  },
  async getDashboard() {
    await wait()
    const value = report()
    return {
      total: value.total,
      pending: (value.byStatus.REGISTRADA ?? 0) + (value.byStatus.EN_REVISION_CCI ?? 0),
      approved: value.byStatus.APROBADA_ENTIDAD ?? 0,
      activeEntities: entities.filter((item) => item.active).length,
      byStatus: value.byStatus,
      recentRequests: clone(requests.slice(0, 4)),
    }
  },
  async getProtests(filters = {}) {
    await wait()
    const document = filters.documento?.toLowerCase() ?? ""
    const name = filters.nombre?.toLowerCase() ?? ""
    return clone(protests.filter((item) => (!document || item.documentNumber.includes(document)) && (!name || item.debtorName.toLowerCase().includes(name))))
  },
  async getRequests({ mine = false, page: index = 0, size = 10, status, search } = {}) {
    await wait()
    const term = search?.toLowerCase() ?? ""
    return page(
      clone(requests.filter((item) => (!mine || item.financialEntity === "Banco Demo Ica") && (!status || item.status === status) && (!term || item.code.toLowerCase().includes(term)))),
      index,
      size,
    )
  },
  async createRequest(input) {
    await wait()
    const entity = entities.find((item) => item.id === input.entityId)
    return {
      id: Date.now(), code: "SOL-2026-0049", applicant: "Deudor Demo",
      financialEntity: entity?.name ?? "Entidad Demo", type: input.type, status: "REGISTRADA",
      createdAt: "2026-06-18", documentNumber: input.documentNumber, amount: input.amount,
      currency: input.currency, reason: input.reason, version: 0,
    }
  },
  async updateRequestStatus(id, status, observation) {
    await wait()
    const current = requests.find((item) => item.id === id)
    if (!current) throw new Error("Solicitud no encontrada.")
    return { ...clone(current), status, observation, version: current.version + 1 } satisfies RequestRecord
  },
  async uploadDocument() { await wait() },
  async uploadExcel() { await wait() },
  async getEntities() { await wait(); return clone(entities) },
  async createEntity(input) { await wait(); return { id: Date.now(), ...input, active: true } },
  async getAnalysts() { await wait(); return clone(analysts) },
  async createAnalyst(input) { await wait(); return { id: Date.now(), ...input, assigned: 0, active: true } },
  async getReport() { await wait(); return report() },
  async getAudit({ page: index = 0, size = 10 } = {}) { await wait(); return page(clone(auditEntries), index, size) },
}
