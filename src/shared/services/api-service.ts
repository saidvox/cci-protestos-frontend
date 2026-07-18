import { apiClient } from "@/shared/services/api-client"
import type { AppService } from "@/shared/services/contracts"
import { adaptAnalyst, adaptAudit, adaptDashboard, adaptEntity, adaptLogin, adaptNotification, adaptOfficialDocument, adaptPage, adaptProtest, adaptReport, adaptRequest, adaptRequestDocument, type AnalystActivationInfoDto, type AnalystDto, type AnalystInvitationDto, type AuditDto, type DashboardDto, type EntityDto, type LoginDto, type NotificationFeedDto, type OfficialDocumentDto, type PageDto, type ProtestDto, type ReportDto, type RequestDocumentDto, type RequestDto } from "@/shared/services/api-adapters"
async function csrf() { await apiClient.get("/auth/csrf") }
async function mutate<T>(operation: () => Promise<T>) { await csrf(); return operation() }
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
export const apiService: AppService = {
  getCsrf: csrf,
  async login(credentials) { await csrf(); return adaptLogin((await apiClient.post<LoginDto>("/auth/login", credentials)).data) },
  async logout() { await mutate(() => apiClient.post("/auth/logout")) },
  async getSession() { return adaptLogin((await apiClient.get<LoginDto>("/v1/auth/session")).data) },
  async register(input) { await mutate(() => apiClient.post("/v1/auth/register", input)) },
  async lookupDebtor(tipoDocumento, numeroDocumento) { return (await apiClient.get("/v1/auth/debtor-lookup", { params: { tipoDocumento, numeroDocumento } })).data },
  async getDashboard() { return adaptDashboard((await apiClient.get<DashboardDto>("/dashboard/resumen")).data) },
  async getProtests(filters = {}) { return adaptPage((await apiClient.get<PageDto<ProtestDto>>("/protestos/consulta", { params: filters })).data, adaptProtest) },
  async getRequests({ mine = false, page = 0, size = 10, status, search } = {}) { return adaptPage((await apiClient.get<PageDto<RequestDto>>(mine ? "/solicitudes/mis-solicitudes" : "/solicitudes", { params: { page, size, ...(status ? { estado: status } : {}), ...(search ? { busqueda: search } : {}) } })).data, adaptRequest) },
  async createRequest(input, files) {
    const payload = { entidadId: input.entityId, tipoTramite: input.type, numeroDocumentoDeudor: input.documentNumber, monto: input.amount, moneda: input.currency, motivo: input.reason }
    if (!files?.length) return adaptRequest((await mutate(() => apiClient.post<RequestDto>("/solicitudes", payload))).data)
    const form = new FormData()
    form.append("solicitud", new Blob([JSON.stringify(payload)], { type: "application/json" }))
    files.forEach((file) => form.append("files", file))
    return adaptRequest((await mutate(() => apiClient.post<RequestDto>("/solicitudes/con-documentos", form, { timeout: 120_000 }))).data)
  },
  async updateRequest(id, input) { return adaptRequest((await mutate(() => apiClient.put<RequestDto>(`/solicitudes/${id}`, { entidadId: input.entityId, tipoTramite: input.type, numeroDocumentoDeudor: input.documentNumber, monto: input.amount, moneda: input.currency, motivo: input.reason }))).data) },
  async updateRequestStatus(id, status, observation, analystId, version) { return adaptRequest((await mutate(() => apiClient.put<RequestDto>(`/solicitudes/${id}/estado`, { estado: status, observacion: observation, analistaId: analystId, version }))).data) },
  async getDebtorRequestsHistory(documentNumber) { return (await apiClient.get<RequestDto[]>(`/solicitudes/deudor/${documentNumber}`)).data.map(adaptRequest) },
  async uploadDocument(requestId, file) { const form = new FormData(); form.append("solicitudId", String(requestId)); form.append("file", file); await mutate(() => apiClient.post("/documentos/upload", form)) },
  async uploadDocuments(requestId, files) { const form = new FormData(); files.forEach((file) => form.append("files", file)); await mutate(() => apiClient.post(`/documentos/solicitud/${requestId}/upload-batch`, form, { timeout: 120_000 })) },
  async getRequestDocuments(requestId) { return (await apiClient.get<RequestDocumentDto[]>(`/documentos/solicitud/${requestId}`)).data.map(adaptRequestDocument) },
  async previewRequestDocument(document) { return (await apiClient.get(document.downloadUrl.replace(/^\/api/, ""), { params: { disposition: "inline" }, responseType: "blob" })).data },
  async downloadRequestDocument(document) { const response = await apiClient.get(document.downloadUrl.replace(/^\/api/, ""), { responseType: "blob" }); saveBlob(response.data, document.filename) },
  async uploadExcel(file) { const form = new FormData(); form.append("file", file); await mutate(() => apiClient.post("/excel/upload", form)) },
  async getExcelUploads() { return (await apiClient.get("/excel/cargas")).data },
  async validateExcel(file) { const form = new FormData(); form.append("file", file); return (await mutate(() => apiClient.post("/excel/validate", form))).data },
  async importExcel(file) { const form = new FormData(); form.append("file", file); return (await mutate(() => apiClient.post("/excel/import", form))).data },
  async getOfficialDocuments(includeInactive = false) { return (await apiClient.get<OfficialDocumentDto[]>("/documentos-tramite", { params: { incluirInactivos: includeInactive } })).data.map(adaptOfficialDocument) },
  async uploadOfficialDocument(input) { const form = new FormData(); form.append("titulo", input.title); if (input.description) form.append("descripcion", input.description); if (typeof input.order === "number") form.append("orden", String(input.order)); form.append("tipo", input.type ?? "FORMATO_REQUERIDO"); form.append("file", input.file); return adaptOfficialDocument((await mutate(() => apiClient.post<OfficialDocumentDto>("/documentos-tramite", form))).data) },
  async deleteOfficialDocument(id) { await mutate(() => apiClient.delete(`/documentos-tramite/${id}`)) },
  async previewOfficialDocument(document) { return (await apiClient.get(document.downloadUrl.replace(/^\/api/, ""), { params: { disposition: "inline" }, responseType: "blob" })).data },
  async downloadOfficialDocument(document) { const response = await apiClient.get(document.downloadUrl.replace(/^\/api/, ""), { responseType: "blob" }); saveBlob(response.data, document.filename) },
  async getEntities() { return (await apiClient.get<EntityDto[]>("/entidades")).data.map(adaptEntity) },
  async createEntity(input) { return adaptEntity((await mutate(() => apiClient.post<EntityDto>("/entidades", { ruc: input.ruc, razonSocial: input.name, contacto: input.contact, email: input.email }))).data) },
  async updateEntity(id, input) { return adaptEntity((await mutate(() => apiClient.put<EntityDto>(`/entidades/${id}`, { ruc: input.ruc, razonSocial: input.name, contacto: input.contact, email: input.email, activo: input.active }))).data) },
  async toggleEntityStatus(id, active) { return adaptEntity((await mutate(() => apiClient.patch<EntityDto>(`/entidades/${id}/estado`, { activo: active }))).data) },
  async getAnalysts() { return (await apiClient.get<AnalystDto[]>("/analistas")).data.map(adaptAnalyst) },
  async createAnalyst(input) { const dto = (await mutate(() => apiClient.post<AnalystInvitationDto>("/analistas", { nombre: input.name, email: input.email, codigo: input.code, entidadId: input.entityId }))).data; return { analyst: adaptAnalyst(dto.analista), activationToken: dto.activationToken, expiresAt: dto.expiresAt } },
  async regenerateAnalystInvitation(id) { const dto = (await mutate(() => apiClient.post<AnalystInvitationDto>(`/analistas/${id}/invitacion`))).data; return { analyst: adaptAnalyst(dto.analista), activationToken: dto.activationToken, expiresAt: dto.expiresAt } },
  async restartAnalystActivation(id) { const dto = (await mutate(() => apiClient.post<AnalystInvitationDto>(`/analistas/${id}/reactivacion`))).data; return { analyst: adaptAnalyst(dto.analista), activationToken: dto.activationToken, expiresAt: dto.expiresAt } },
  async validateAnalystInvitation(token) { const dto = (await apiClient.get<AnalystActivationInfoDto>("/v1/auth/analyst-activation", { params: { token } })).data; return { name: dto.nombre, email: dto.email, entity: dto.entidad, expiresAt: dto.expiresAt } },
  async activateAnalyst(token, password) { await apiClient.post("/v1/auth/analyst-activation", { token, password }) },
  async updateAnalyst(id, input) { return adaptAnalyst((await mutate(() => apiClient.put<AnalystDto>(`/analistas/${id}`, { nombre: input.name, email: input.email, codigo: input.code, entidadId: input.entityId, disponible: input.active }))).data) },
  async toggleAnalystStatus(id, active) { return adaptAnalyst((await mutate(() => apiClient.patch<AnalystDto>(`/analistas/${id}/estado`, { disponible: active }))).data) },
  async resetAnalystPassword(id, password) { await mutate(() => apiClient.patch(`/analistas/${id}/password`, { password })) },
  async getNotifications(limit = 10) { const dto = (await apiClient.get<NotificationFeedDto>("/v1/erp/notificaciones", { params: { limit } })).data; return { items: dto.items.map(adaptNotification), unreadCount: dto.unreadCount } },
  async markNotificationsRead(throughId) { await mutate(() => apiClient.patch("/v1/erp/notificaciones/leidas", { throughId })) },
  async getReport() { return adaptReport((await apiClient.get<ReportDto>("/reportes/solicitudes")).data) },
  async getAudit({ page = 0, size = 10 } = {}) { return adaptPage((await apiClient.get<PageDto<AuditDto>>("/auditoria", { params: { page, size } })).data, adaptAudit) },
}
