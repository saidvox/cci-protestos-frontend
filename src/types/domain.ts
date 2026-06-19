export type Role = "CCI_ADMIN" | "CCI_STAFF" | "BANK_ANALYST" | "USER_DEBTOR"

export type RequestStatus =
  | "REGISTRADA"
  | "EN_REVISION_CCI"
  | "OBSERVADA_CCI"
  | "DERIVADA_ENTIDAD"
  | "EN_REVISION_ANALISTA"
  | "OBSERVADA_ENTIDAD"
  | "RECHAZADA"
  | "APROBADA_ENTIDAD"
  | "FINALIZADA"
  | "LEVANTAMIENTO_PROCESADO"

export type RequestType = "REGISTRO_PROTESTO" | "REGULARIZACION" | "RECTIFICACION"
export type Currency = "PEN" | "USD"

export interface User {
  id: number
  name: string
  email: string
  roles: readonly Role[]
  tipoDocumento?: string
  numeroDocumento?: string
}

export interface AuthSession {
  expiresAt: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ProtestFilters {
  documento?: string
  nombre?: string
}

export interface PageQuery {
  page?: number
  size?: number
}

export interface RequestQuery extends PageQuery {
  mine?: boolean
  status?: RequestStatus
  search?: string
}

export interface Protest {
  id: number
  documentNumber: string
  debtorName: string
  financialEntity: string
  amount: number
  registeredAt: string
  status: "VIGENTE" | "REGULARIZADO"
}

export interface RequestRecord {
  id: number
  code: string
  applicant: string
  financialEntity: string
  type: RequestType
  status: RequestStatus
  createdAt: string
  documentNumber: string
  amount: number
  currency: Currency
  reason: string
  version: number
  observation?: string
}

export interface CreateRequestInput {
  type: RequestType
  entityId: number
  documentNumber: string
  amount: number
  currency: Currency
  reason: string
}

export interface FinancialEntity {
  id: number
  ruc: string
  name: string
  contact: string
  email: string
  active: boolean
}

export interface Analyst {
  id: number
  name: string
  email: string
  code: string
  assigned: number
  active: boolean
}

export interface AuditEntry {
  id: number
  actor: string
  action: string
  resource: string
  date: string
  detail: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface RequestReport {
  total: number
  byStatus: Partial<Record<RequestStatus, number>>
}

export interface DashboardSummary {
  total: number
  pending: number
  approved: number
  activeEntities: number
  byStatus: Partial<Record<RequestStatus, number>>
  recentRequests: RequestRecord[]
}

export interface RegisterInput {
  nombreCompleto: string
  email: string
  password: string
  tipoDocumento: string
  numeroDocumento: string
}

