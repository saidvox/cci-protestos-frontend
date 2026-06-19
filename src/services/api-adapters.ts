import type { Analyst, AuditEntry, AuthSession, FinancialEntity, Page, Protest, RequestRecord, RequestReport, RequestStatus, Role } from "@/types/domain"

export interface LoginDto { accessToken: string; tokenType: string; expiresAt: string; usuario: { id: number; nombre: string; email: string; roles: Role[] } }
export interface ProtestDto { id: number; numeroDocumento: string; nombreDeudor: string; entidad: string; tipoTitulo: string; monto: number; moneda: string; fechaProtesto: string; vigente: boolean }
export interface RequestDto { id: number; codigo: string; solicitante: string; entidad: string; analista: string | null; estado: RequestStatus; motivo: string; documentoDeudor?: string | null; montoProtestado?: number | null; observacion: string | null; creadoEn: string; actualizadoEn: string }
export interface EntityDto { id: number; ruc: string; razonSocial: string; contacto: string | null; email: string | null; activo: boolean }
export interface AnalystDto { id: number; codigo: string; nombre: string; email: string; disponible: boolean }
export interface ReportDto { total: number; porEstado: Partial<Record<RequestStatus, number>> }
export interface AuditDto { id: number; actor: string; accion: string; recurso: string; recursoId: string | null; detalle: string; fecha: string }
export interface PageDto<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }

export const adaptLogin = (dto: LoginDto): AuthSession => ({ token: dto.accessToken, expiresAt: dto.expiresAt, user: { id: dto.usuario.id, name: dto.usuario.nombre, email: dto.usuario.email, roles: dto.usuario.roles } })
export const adaptProtest = (dto: ProtestDto): Protest => ({ id: dto.id, documentNumber: dto.numeroDocumento, debtorName: dto.nombreDeudor, financialEntity: dto.entidad, amount: dto.monto, registeredAt: dto.fechaProtesto, status: dto.vigente ? "VIGENTE" : "REGULARIZADO" })
export const adaptRequest = (dto: RequestDto): RequestRecord => ({ id: dto.id, code: dto.codigo, applicant: dto.solicitante, financialEntity: dto.entidad, type: dto.motivo.split(" | ")[0] || "Solicitud", status: dto.estado, createdAt: dto.creadoEn, observation: dto.observacion ?? undefined, documentoDeudor: dto.documentoDeudor ?? undefined, montoProtestado: dto.montoProtestado ?? undefined })
export const adaptEntity = (dto: EntityDto): FinancialEntity => ({ id: dto.id, ruc: dto.ruc, name: dto.razonSocial, contact: dto.contacto ?? "", email: dto.email ?? "", active: dto.activo })
export const adaptAnalyst = (dto: AnalystDto): Analyst => ({ id: dto.id, code: dto.codigo, name: dto.nombre, email: dto.email, assigned: 0, active: dto.disponible })
export const adaptReport = (dto: ReportDto): RequestReport => ({ total: dto.total, byStatus: { REGISTRADA: dto.porEstado.REGISTRADA ?? 0, EN_REVISION: dto.porEstado.EN_REVISION ?? 0, OBSERVADA: dto.porEstado.OBSERVADA ?? 0, APROBADA: dto.porEstado.APROBADA ?? 0, RECHAZADA: dto.porEstado.RECHAZADA ?? 0 } })
export const adaptAudit = (dto: AuditDto): AuditEntry => ({ id: dto.id, actor: dto.actor, action: dto.accion, resource: dto.recurso, date: dto.fecha, detail: dto.detalle })
export const adaptPage = <TDto, T>(dto: PageDto<TDto>, adapter: (item: TDto) => T): Page<T> => ({ ...dto, content: dto.content.map(adapter) })
