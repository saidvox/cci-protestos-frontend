import { apiClient } from "@/services/api-client"
import type { AppService } from "@/services/contracts"
import { adaptAnalyst, adaptAudit, adaptDashboard, adaptEntity, adaptLogin, adaptPage, adaptProtest, adaptReport, adaptRequest, type AnalystDto, type AuditDto, type DashboardDto, type EntityDto, type LoginDto, type PageDto, type ProtestDto, type ReportDto, type RequestDto } from "@/services/api-adapters"
async function csrf() { await apiClient.get("/auth/csrf") }
async function mutate<T>(operation: () => Promise<T>) { await csrf(); return operation() }
export const apiService: AppService = {
  getCsrf: csrf,
  async login(credentials) { await csrf(); return adaptLogin((await apiClient.post<LoginDto>("/auth/login", credentials)).data) },
  async logout() { await mutate(() => apiClient.post("/auth/logout")) },
  async getSession() { return adaptLogin((await apiClient.get<LoginDto>("/v1/auth/session")).data) },
  async register(input) { await mutate(() => apiClient.post("/v1/auth/register", input)) },
  async getDashboard() { return adaptDashboard((await apiClient.get<DashboardDto>("/dashboard/resumen")).data) },
  async getProtests(filters = {}) { return (await apiClient.get<ProtestDto[]>("/protestos/consulta", { params: filters })).data.map(adaptProtest) },
  async getRequests({ mine = false, page = 0, size = 10, status, search } = {}) { return adaptPage((await apiClient.get<PageDto<RequestDto>>(mine ? "/solicitudes/mis-solicitudes" : "/solicitudes", { params: { page, size, ...(status ? { estado: status } : {}), ...(search ? { busqueda: search } : {}) } })).data, adaptRequest) },
  async createRequest(input) { return adaptRequest((await mutate(() => apiClient.post<RequestDto>("/solicitudes", { entidadId: input.entityId, tipoTramite: input.type, numeroDocumentoDeudor: input.documentNumber, monto: input.amount, moneda: input.currency, motivo: input.reason }))).data) },
  async updateRequestStatus(id, status, observation, analystId, version) { return adaptRequest((await mutate(() => apiClient.put<RequestDto>(`/solicitudes/${id}/estado`, { estado: status, observacion: observation, analistaId: analystId, version }))).data) },
  async uploadDocument(requestId, file) { const form = new FormData(); form.append("solicitudId", String(requestId)); form.append("file", file); await mutate(() => apiClient.post("/documentos/upload", form)) },
  async uploadExcel(file) { const form = new FormData(); form.append("file", file); await mutate(() => apiClient.post("/excel/upload", form)) },
  async getEntities() { return (await apiClient.get<EntityDto[]>("/entidades")).data.map(adaptEntity) },
  async createEntity(input) { return adaptEntity((await mutate(() => apiClient.post<EntityDto>("/entidades", { ruc: input.ruc, razonSocial: input.name, contacto: input.contact, email: input.email }))).data) },
  async getAnalysts() { return (await apiClient.get<AnalystDto[]>("/analistas")).data.map(adaptAnalyst) },
  async createAnalyst(input) { return adaptAnalyst((await mutate(() => apiClient.post<AnalystDto>("/analistas", { nombre: input.name, email: input.email, codigo: input.code }))).data) },
  async getReport() { return adaptReport((await apiClient.get<ReportDto>("/reportes/solicitudes")).data) },
  async getAudit({ page = 0, size = 10 } = {}) { return adaptPage((await apiClient.get<PageDto<AuditDto>>("/auditoria", { params: { page, size } })).data, adaptAudit) },
}
