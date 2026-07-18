import type {
  Analyst,
  AuditEntry,
  AuthSession,
  Currency,
  DashboardSummary,
  FinancialEntity,
  OfficialDocument,
  ErpNotification,
  RequestDocument,
  Page,
  Protest,
  RequestRecord,
  RequestReport,
  RequestStatus,
  RequestType,
  Role,
} from "@/shared/types/domain"

export interface LoginDto {
  expiresAt: string
  usuario: { id: number; nombre: string; email: string; roles: string[]; tipoDocumento?: string; numeroDocumento?: string }
}
export interface ProtestDto { id: number; numeroDocumento: string; nombreDeudor: string; entidadId: number; entidad: string; tipoTitulo: string; monto: number; moneda: Currency; fechaProtesto: string; vigente: boolean }
export interface RequestDto { id: number; codigo: string; solicitante: string; entidad: string; analista: string | null; estado: RequestStatus; tipoTramite: RequestType; numeroDocumentoDeudor: string; monto: number; moneda: Currency; motivo: string; version: number; observacion: string | null; creadoEn: string; actualizadoEn: string }
export interface EntityDto { id: number; ruc: string; razonSocial: string; contacto: string | null; email: string | null; activo: boolean }
export interface AnalystDto { id: number; codigo: string; nombre: string; email: string; disponible: boolean; accessStatus: "PENDING_ACTIVATION" | "ACTIVE" | "DISABLED"; entidadId?: number; entidadNombre?: string }
export interface AnalystInvitationDto { analista: AnalystDto; activationToken: string; expiresAt: string }
export interface AnalystActivationInfoDto { nombre: string; email: string; entidad: string; expiresAt: string }
export interface ReportDto { total: number; porEstado: Partial<Record<RequestStatus, number>> }
export interface DashboardDto { total: number; pendientes: number; aprobadas: number; entidadesActivas: number; porEstado: Partial<Record<RequestStatus, number>>; solicitudesRecientes: RequestDto[] }
export interface AuditDto { id: number; actor: string; accion: string; recurso: string; recursoId: string | null; detalle: string; fecha: string }
export interface OfficialDocumentDto { id: number; titulo: string; descripcion: string | null; filename: string; downloadUrl: string; sizeBytes: number; tipo?: OfficialDocument["type"]; activo: boolean; orden: number; creadoEn: string }
export interface RequestDocumentDto { id: number; solicitudId: number; filename: string; mimeType: string; sizeBytes: number; downloadUrl: string; creadoEn: string }
export interface NotificationItemDto { id: number; action: string; resource: string; resourceId: string | null; actor: string; detail: string; occurredAt: string; read: boolean }
export interface NotificationFeedDto { items: NotificationItemDto[]; unreadCount: number }
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

export const adaptProtest = (dto: ProtestDto): Protest => ({ id: dto.id, documentNumber: dto.numeroDocumento, debtorName: dto.nombreDeudor, financialEntityId: dto.entidadId, financialEntity: dto.entidad, amount: dto.monto, currency: dto.moneda, registeredAt: dto.fechaProtesto, status: dto.vigente ? "VIGENTE" : "REGULARIZADO" })
export const adaptRequest = (dto: RequestDto): RequestRecord => ({ id: dto.id, code: dto.codigo, applicant: dto.solicitante, financialEntity: dto.entidad, type: dto.tipoTramite, status: dto.estado, createdAt: dto.creadoEn, documentNumber: dto.numeroDocumentoDeudor, amount: dto.monto, currency: dto.moneda, reason: dto.motivo, version: dto.version, observation: dto.observacion ?? undefined })
export const adaptEntity = (dto: EntityDto): FinancialEntity => ({ id: dto.id, ruc: dto.ruc, name: dto.razonSocial, contact: dto.contacto ?? "", email: dto.email ?? "", active: dto.activo })
export const adaptAnalyst = (dto: AnalystDto): Analyst => ({ id: dto.id, code: dto.codigo, name: dto.nombre, email: dto.email, assigned: 0, active: dto.disponible, accessStatus: dto.accessStatus, entityId: dto.entidadId, entityName: dto.entidadNombre })
export const adaptReport = (dto: ReportDto): RequestReport => ({ total: dto.total, byStatus: dto.porEstado })
export const adaptDashboard = (dto: DashboardDto): DashboardSummary => ({ total: dto.total, pending: dto.pendientes, approved: dto.aprobadas, activeEntities: dto.entidadesActivas, byStatus: dto.porEstado, recentRequests: dto.solicitudesRecientes.map(adaptRequest) })
export const adaptAudit = (dto: AuditDto): AuditEntry => ({ id: dto.id, actor: dto.actor, action: dto.accion, resource: dto.recurso, date: dto.fecha, detail: dto.detalle })
export const adaptOfficialDocument = (dto: OfficialDocumentDto): OfficialDocument => ({ id: dto.id, title: dto.titulo, description: dto.descripcion ?? undefined, filename: dto.filename, downloadUrl: dto.downloadUrl, sizeBytes: dto.sizeBytes, type: dto.tipo ?? "FORMATO_REQUERIDO", active: dto.activo, order: dto.orden, createdAt: dto.creadoEn })
export const adaptRequestDocument = (dto: RequestDocumentDto): RequestDocument => ({ id: dto.id, requestId: dto.solicitudId, filename: dto.filename, mimeType: dto.mimeType, sizeBytes: dto.sizeBytes, downloadUrl: dto.downloadUrl, createdAt: dto.creadoEn })
export const adaptNotification = (dto: NotificationItemDto): ErpNotification => ({ id: dto.id, action: dto.action, resource: dto.resource, resourceId: dto.resourceId ?? undefined, actor: dto.actor, detail: dto.detail, occurredAt: dto.occurredAt, read: dto.read })
export const adaptPage = <TDto, T>(dto: PageDto<TDto>, adapter: (item: TDto) => T): Page<T> => ({ ...dto, content: dto.content.map(adapter) })
