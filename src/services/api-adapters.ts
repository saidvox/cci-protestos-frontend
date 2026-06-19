import type { Analyst, AuditEntry, AuthSession, Currency, DashboardSummary, FinancialEntity, Page, Protest, RequestRecord, RequestReport, RequestStatus, RequestType, Role } from "@/types/domain"

export interface LoginDto { expiresAt: string; usuario: { id: number; nombre: string; email: string; roles: string[]; tipoDocumento?: string; numeroDocumento?: string } }
export interface ProtestDto { id: number; numeroDocumento: string; nombreDeudor: string; entidad: string; tipoTitulo: string; monto: number; moneda: string; fechaProtesto: string; vigente: boolean }
export interface RequestDto { id: number; codigo: string; solicitante: string; entidad: string; analista: string | null; estado: RequestStatus; tipoTramite: RequestType; numeroDocumentoDeudor: string; monto: number; moneda: Currency; motivo: string; version: number; observacion: string | null; creadoEn: string; actualizadoEn: string }
export interface EntityDto { id: number; ruc: string; razonSocial: string; contacto: string | null; email: string | null; activo: boolean }
export interface AnalystDto { id: number; codigo: string; nombre: string; email: string; disponible: boolean }
export interface ReportDto { total: number; porEstado: Partial<Record<RequestStatus, number>> }
export interface DashboardDto { total: number; pendientes: number; aprobadas: number; entidadesActivas: number; porEstado: Partial<Record<RequestStatus, number>>; solicitudesRecientes: RequestDto[] }
export interface AuditDto { id: number; actor: string; accion: string; recurso: string; recursoId: string | null; detalle: string; fecha: string }
export interface PageDto<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }

function mapRole(name: string): Role {
  const LEGACY: Record<string, Role> = { ADMIN: "CCI_ADMIN", ANALISTA: "BANK_ANALYST", ENTIDAD: "BANK_ANALYST" }
  return (LEGACY[name] ?? name) as Role
}

export const adaptLogin = (dto: LoginDto): AuthSession => ({
  expiresAt: dto.expiresAt,
  user: {
    id: dto.usuario.id,
    name: dto.usuario.nombre,
    email: dto.usuario.email,
    roles: dto.usuario.roles.map(mapRole),
    tipoDocumento: dto.usuario.tipoDocumento,
    numeroDocumento: dto.usuario.numeroDocumento,
  },
})

export const adaptProtest = (dto: ProtestDto): Protest => ({ id: dto.id, documentNumber: dto.numeroDocumento, debtorName: dto.nombreDeudor, financialEntity: dto.entidad, amount: dto.monto, registeredAt: dto.fechaProtesto, status: dto.vigente ? "VIGENTE" : "REGULARIZADO" })
export const adaptRequest = (dto: RequestDto): RequestRecord => ({ id: dto.id, code: dto.codigo, applicant: dto.solicitante, financialEntity: dto.entidad, type: dto.tipoTramite, status: dto.estado, createdAt: dto.creadoEn, documentNumber: dto.numeroDocumentoDeudor, amount: dto.monto, currency: dto.moneda, reason: dto.motivo, version: dto.version, observation: dto.observacion ?? undefined })
export const adaptEntity = (dto: EntityDto): FinancialEntity => ({ id: dto.id, ruc: dto.ruc, name: dto.razonSocial, contact: dto.contacto ?? "", email: dto.email ?? "", active: dto.activo })
export const adaptAnalyst = (dto: AnalystDto): Analyst => ({ id: dto.id, code: dto.codigo, name: dto.nombre, email: dto.email, assigned: 0, active: dto.disponible })
export const adaptReport = (dto: ReportDto): RequestReport => ({ total: dto.total, byStatus: dto.porEstado })
export const adaptDashboard = (dto: DashboardDto): DashboardSummary => ({ total: dto.total, pending: dto.pendientes, approved: dto.aprobadas, activeEntities: dto.entidadesActivas, byStatus: dto.porEstado, recentRequests: dto.solicitudesRecientes.map(adaptRequest) })
export const adaptAudit = (dto: AuditDto): AuditEntry => ({ id: dto.id, actor: dto.actor, action: dto.accion, resource: dto.recurso, date: dto.fecha, detail: dto.detalle })
export const adaptPage = <TDto, T>(dto: PageDto<TDto>, adapter: (item: TDto) => T): Page<T> => ({ ...dto, content: dto.content.map(adapter) })
