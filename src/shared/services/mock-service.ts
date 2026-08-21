import { analysts, auditEntries, entities, protests, requests } from "@/shared/mocks/data"
import type { AppService } from "@/shared/services/contracts"
import type { AuthSession, ErpNotification, OfficialDocument, RegisterInput, RequestRecord, RequestStatus, Role } from "@/shared/types/domain"

const wait = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)
const DEMO_PREFIX = "cci-protestos-demo/"

function getDemoData<T>(name: string, seed: T): T {
  const saved = localStorage.getItem(`${DEMO_PREFIX}${name}`)
  if (!saved) return clone(seed)
  try { return JSON.parse(saved) as T } catch { return clone(seed) }
}

function setDemoData<T>(name: string, value: T) {
  localStorage.setItem(`${DEMO_PREFIX}${name}`, JSON.stringify(value))
}

const getRequestsStore = () => getDemoData("requests", requests)
const setRequestsStore = (value: typeof requests) => setDemoData("requests", value)
const getEntitiesStore = () => getDemoData("entities", entities)
const setEntitiesStore = (value: typeof entities) => setDemoData("entities", value)
const getAnalystsStore = () => getDemoData("analysts", analysts)
const setAnalystsStore = (value: typeof analysts) => setDemoData("analysts", value)

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
  getRequestsStore().forEach((item) => {
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

const defaultOfficialDocuments: OfficialDocument[] = [
  {
    id: 1,
    title: "Formulario Unico de Tramite (FUT)",
    description: "Formato oficial para solicitar el levantamiento de protesto.",
    filename: "FUT_Levantamiento_Protesto.pdf",
    downloadUrl: "/api/documentos-tramite/1/download",
    sizeBytes: 145000,
    type: "FORMATO_REQUERIDO",
    active: true,
    order: 1,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Declaracion Jurada de Pago Total",
    description: "Declaracion jurada para sustentar el pago total de la deuda.",
    filename: "Declaracion_Jurada_Pago_Deuda.pdf",
    downloadUrl: "/api/documentos-tramite/2/download",
    sizeBytes: 120000,
    type: "FORMATO_REQUERIDO",
    active: true,
    order: 2,
    createdAt: "2026-06-01T00:00:00Z",
  },
]

const mockNotifications: ErpNotification[] = [
  { id: 2, action: "CREAR", resource: "SOLICITUD", resourceId: "2", actor: "deudor@demo.local", detail: "Nueva solicitud registrada", occurredAt: new Date().toISOString(), read: false },
  { id: 1, action: "IMPORTAR", resource: "CARGA_EXCEL", resourceId: "1", actor: "admin@demo.local", detail: "Importacion de protestos completada", occurredAt: new Date(Date.now() - 3_600_000).toISOString(), read: false },
]

function getMockOfficialDocuments() {
  const saved = localStorage.getItem(`${DEMO_PREFIX}official-documents`)
  return saved ? JSON.parse(saved) as OfficialDocument[] : clone(defaultOfficialDocuments)
}

function setMockOfficialDocuments(items: OfficialDocument[]) {
  localStorage.setItem(`${DEMO_PREFIX}official-documents`, JSON.stringify(items))
}

export const mockService: AppService = {
  async getCsrf() {},
  async login(credentials) {
    await wait()
    if (!credentials.email || !credentials.password) throw new Error("Ingresa correo y contraseña.")
    
    const registeredUsersStr = localStorage.getItem(`${DEMO_PREFIX}users`)
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
    localStorage.setItem(`${DEMO_PREFIX}session`, JSON.stringify(session))
    return session
  },
  async logout() {
    await wait()
    localStorage.removeItem(`${DEMO_PREFIX}session`)
  },
  async getSession() {
    await wait()
    const sessionStr = localStorage.getItem(`${DEMO_PREFIX}session`)
    if (!sessionStr) throw new Error("No session active")
    return JSON.parse(sessionStr) as AuthSession
  },
  async register(input: RegisterInput) {
    await wait()
    const registeredUsersStr = localStorage.getItem(`${DEMO_PREFIX}users`)
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
    localStorage.setItem(`${DEMO_PREFIX}users`, JSON.stringify(registeredUsers))
  },
  async lookupDebtor(_tipoDocumento: string, numeroDocumento: string) {
    await wait()
    const normalized = numeroDocumento.replace(/\D/g, "")
    const found = protests.find((item) => item.documentNumber === normalized)
    return {
      found: Boolean(found),
      nombreCompleto: found?.debtorName,
      email: found ? `${normalized}@deudor.local` : undefined,
    }
  },
  async getDashboard() {
    await wait()
    const value = report()
    const requestItems = getRequestsStore()
    const entityItems = getEntitiesStore()
    return {
      total: value.total,
      pending: (value.byStatus.REGISTRADA ?? 0) + (value.byStatus.EN_REVISION_CCI ?? 0),
      approved: value.byStatus.APROBADA_ENTIDAD ?? 0,
      activeEntities: entityItems.filter((item) => item.active).length,
      byStatus: value.byStatus,
      recentRequests: clone(requestItems.slice(0, 4)),
    }
  },
  async getProtests(filters = {}) {
    await wait()
    const document = filters.documento?.toLowerCase() ?? ""
    const name = filters.nombre?.toLowerCase() ?? ""
    return page(
      clone(protests.filter((item) => (!document || item.documentNumber.includes(document)) && (!name || item.debtorName.toLowerCase().includes(name)) && (!filters.estado || item.status === filters.estado))),
      filters.page ?? 0,
      filters.size ?? 10,
    )
  },
  async getRequests({ mine = false, page: index = 0, size = 10, status, search } = {}) {
    await wait()
    const term = search?.toLowerCase() ?? ""
    return page(
      clone(getRequestsStore().filter((item) => (!mine || item.financialEntity === "Banco Demo Ica") && (!status || item.status === status) && (!term || item.code.toLowerCase().includes(term)))),
      index,
      size,
    )
  },
  async createRequest(input) {
    await wait()
    const entity = getEntitiesStore().find((item) => item.id === input.entityId)
    const created = {
      id: Date.now(), code: "SOL-2026-0049", applicant: "Deudor Demo",
      financialEntity: entity?.name ?? "Entidad Demo", type: input.type, status: "REGISTRADA" as RequestStatus,
      createdAt: "2026-06-18", documentNumber: input.documentNumber, amount: input.amount,
      currency: input.currency, reason: input.reason, version: 0,
    }
    setRequestsStore([created, ...getRequestsStore()] as typeof requests)
    return created
  },
  async updateRequestStatus(id, status, observation) {
    await wait()
    const items = getRequestsStore()
    const current = items.find((item) => item.id === id)
    if (!current) throw new Error("Solicitud no encontrada.")
    const updated = { ...clone(current), status, observation, version: current.version + 1 } satisfies RequestRecord
    setRequestsStore(items.map((item) => item.id === id ? updated : item) as typeof requests)
    return updated
  },
  async uploadDocument() { await wait() },
  async uploadDocuments() { await wait() },
  async getRequestDocuments(requestId) {
    await wait()
    return [
      { id: requestId * 10 + 1, requestId, filename: "voucher-pago.pdf", mimeType: "application/pdf", sizeBytes: 184_000, downloadUrl: `/api/documentos/${requestId * 10 + 1}/download`, createdAt: new Date().toISOString() },
      { id: requestId * 10 + 2, requestId, filename: "formato-solicitud-completado.pdf", mimeType: "application/pdf", sizeBytes: 262_000, downloadUrl: `/api/documentos/${requestId * 10 + 2}/download`, createdAt: new Date().toISOString() },
    ]
  },
  async previewRequestDocument(document) {
    await wait()
    return new Blob([`Documento simulado: ${document.filename}`], { type: document.mimeType })
  },
  async downloadRequestDocument(document) {
    await wait()
    const blob = new Blob([`Documento simulado: ${document.filename}`], { type: document.mimeType })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement("a")
    link.href = url
    link.download = document.filename
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
  async uploadExcel(file) {
    await wait()
    const item = { id: Date.now(), filename: file?.name ?? "plantilla-protestos.xlsx", status: "CARGADO", createdAt: new Date().toISOString() }
    const items = getDemoData<typeof item[]>("excel-uploads", [])
    setDemoData("excel-uploads", [item, ...items])
    return undefined
  },
  async getExcelUploads() { await wait(); return getDemoData("excel-uploads", []) },
  async validateExcel() { await wait(); return { valid: true, totalRows: 10, validRows: 10, errorRows: 0, errors: [], preview: [] } },
  async importExcel() {
    await wait()
    const result = { cargaId: Date.now(), filename: "plantilla-protestos-cci-datos-prueba.xlsx", status: "PROCESADA", summary: "Archivo importado correctamente", totalRows: 10, importedRows: 10, errorRows: 0, errors: [] }
    setDemoData("excel-import", result)
    return result
  },
  async getOfficialDocuments(includeInactive = false) {
    await wait()
    return getMockOfficialDocuments()
      .filter((item) => includeInactive || item.active)
      .sort((a, b) => a.order - b.order)
  },
  async uploadOfficialDocument(input) {
    await wait()
    const items = getMockOfficialDocuments()
    const item: OfficialDocument = {
      id: Date.now(),
      title: input.title,
      description: input.description,
      filename: input.file.name,
      downloadUrl: `/api/documentos-tramite/${Date.now()}/download`,
      sizeBytes: input.file.size,
      type: input.type ?? "FORMATO_REQUERIDO",
      active: true,
      order: input.order ?? items.length + 1,
      createdAt: new Date().toISOString(),
    }
    setMockOfficialDocuments([item, ...items])
    return item
  },
  async deleteOfficialDocument(id) {
    await wait()
    const items = getMockOfficialDocuments()
    const next = items.filter((item) => item.id !== id)
    setMockOfficialDocuments(next)
  },
  async downloadOfficialDocument(document) {
    await wait()
    const blob = new Blob([`PDF simulado: ${document.title}`], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement("a")
    link.href = url
    link.download = document.filename
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
  async previewOfficialDocument(document) {
    await wait()
    return new Blob([`PDF simulado: ${document.title}`], { type: "application/pdf" })
  },
  async getEntities() { await wait(); return clone(getEntitiesStore()) },
  async createEntity(input) { await wait(); const created = { id: Date.now(), ...input, active: true }; setEntitiesStore([created, ...getEntitiesStore()] as typeof entities); return created },
  async updateEntity(id, input) { await wait(); const items = getEntitiesStore(); const current = items.find((item) => item.id === id); if (!current) throw new Error("Entidad no encontrada."); const updated = { ...current, ...input }; setEntitiesStore(items.map((item) => item.id === id ? updated : item) as typeof entities); return updated },
  async toggleEntityStatus(id, active) {
    await wait()
    const items = getEntitiesStore()
    const current = items.find((item) => item.id === id)
    if (!current) throw new Error("Entidad no encontrada.")
    const updated = { ...clone(current), active }
    setEntitiesStore(items.map((item) => item.id === id ? updated : item) as typeof entities)
    return updated
  },
  async getAnalysts() { await wait(); return clone(getAnalystsStore()) },
  async createAnalyst(input) { 
    await wait(); 
    const ent = getEntitiesStore().find(e => e.id === input.entityId);
    const analyst = { id: Date.now(), ...input, assigned: 0, active: false, accessStatus: "PENDING_ACTIVATION" as const, entityName: ent?.name }
    setAnalystsStore([analyst, ...getAnalystsStore()] as typeof analysts)
    return { analyst, activationToken: "mock-activation-token", expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() }
  },
  async regenerateAnalystInvitation(id) {
    await wait()
    const current = getAnalystsStore().find((item) => item.id === id)
    if (!current) throw new Error("Analista no encontrado.")
    return { analyst: clone(current), activationToken: "mock-regenerated-token", expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() }
  },
  async restartAnalystActivation(id) {
    await wait()
    const items = getAnalystsStore()
    const current = items.find((item) => item.id === id)
    if (!current) throw new Error("Analista no encontrado.")
    const analyst = { ...clone(current), active: false, accessStatus: "PENDING_ACTIVATION" as const }
    setAnalystsStore(items.map((item) => item.id === id ? analyst : item) as typeof analysts)
    return { analyst, activationToken: "mock-reactivation-token", expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() }
  },
  async validateAnalystInvitation() { await wait(); return { name: "Analista invitado", email: "analista@entidad.test", entity: "Entidad financiera", expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() } },
  async activateAnalyst() { await wait() },
  async updateAnalyst(id, input) { 
    await wait(); 
    const ent = getEntitiesStore().find(e => e.id === input.entityId);
    const updated = { id, ...input, assigned: 0, accessStatus: input.active ? "ACTIVE" as const : "DISABLED" as const, entityName: ent?.name }
    setAnalystsStore(getAnalystsStore().map((item) => item.id === id ? { ...item, ...updated } : item) as typeof analysts)
    return updated
  },
  async toggleAnalystStatus(id, active) {
    await wait()
    const items = getAnalystsStore()
    const current = items.find((item) => item.id === id)
    if (!current) throw new Error("Analista no encontrado.")
    const updated = { ...clone(current), active, accessStatus: active ? "ACTIVE" as const : "DISABLED" as const }
    setAnalystsStore(items.map((item) => item.id === id ? updated : item) as typeof analysts)
    return updated
  },
  async resetAnalystPassword() { await wait() },
  async getNotifications(limit = 10) {
    await wait()
    const throughId = Number(localStorage.getItem(`${DEMO_PREFIX}notifications-read`) ?? 0)
    const items = mockNotifications.slice(0, limit).map((item) => ({ ...item, read: item.id <= throughId }))
    return { items, unreadCount: mockNotifications.filter((item) => item.id > throughId).length }
  },
  async markNotificationsRead(throughId) {
    await wait()
    localStorage.setItem(`${DEMO_PREFIX}notifications-read`, String(throughId))
  },
  async getDebtorRequestsHistory(documentNumber) {
    await wait()
    return clone(getRequestsStore()).filter((item) => item.documentNumber === documentNumber)
  },
  async updateRequest(id, input) {
    await wait()
    const updated = { id, code: "SOL-CORRECTED", applicant: "Deudor Demo", ...input, status: "REGISTRADA" as RequestStatus, version: 1, createdAt: new Date().toISOString(), financialEntity: getEntitiesStore().find(e => e.id === input.entityId)?.name || "" }
    setRequestsStore(getRequestsStore().map((item) => item.id === id ? updated : item) as typeof requests)
    return updated
  },
  async getReport() { await wait(); return report() },
  async getAudit({ page: index = 0, size = 10 } = {}) { await wait(); return page(clone(auditEntries), index, size) },
}
