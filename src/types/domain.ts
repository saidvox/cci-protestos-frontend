export type Role = "ADMIN" | "ANALISTA" | "ENTIDAD"
export type RequestStatus =
  | "REGISTRADA"
  | "EN_REVISION"
  | "OBSERVADA"
  | "APROBADA"
  | "RECHAZADA"

export interface User {
  id: number
  name: string
  email: string
  roles: readonly Role[]
}

export interface AuthSession {
  token: string
  expiresAt: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
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
  type: string
  status: RequestStatus
  createdAt: string
  observation?: string
  documentoDeudor?: string
  montoProtestado?: number
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
  byStatus: Record<RequestStatus, number>
}
