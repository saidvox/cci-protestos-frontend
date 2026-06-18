import { apiClient } from "@/services/api-client"
import type { AppService } from "@/services/contracts"
import {
  adaptAnalyst, adaptAudit, adaptEntity, adaptLogin, adaptPage, adaptProtest, adaptReport, adaptRequest,
  type AnalystDto, type AuditDto, type EntityDto, type LoginDto, type PageDto, type ProtestDto, type ReportDto, type RequestDto,
} from "@/services/api-adapters"

export const apiService: AppService = {
  async login(credentials) { return adaptLogin((await apiClient.post<LoginDto>("/auth/login", credentials)).data) },
  async getProtests(query) { return (await apiClient.get<ProtestDto[]>("/protestos/consulta", { params: { nombre: query } })).data.map(adaptProtest) },
  async getRequests(mine = false) { return adaptPage((await apiClient.get<PageDto<RequestDto>>(mine ? "/solicitudes/mis-solicitudes" : "/solicitudes")).data, adaptRequest) },
  async createRequest(input) { return adaptRequest((await apiClient.post<RequestDto>("/solicitudes", { entidadId: input.entityId, motivo: `${input.type} | ${input.detail}` })).data) },
  async updateRequestStatus(id, status, observation, analystId) { return adaptRequest((await apiClient.put<RequestDto>(`/solicitudes/${id}/estado`, { estado: status, observacion: observation, analistaId: analystId })).data) },
  async uploadDocument(requestId, file) {
    const form = new FormData(); form.append("solicitudId", String(requestId)); form.append("file", file)
    await apiClient.post("/documentos/upload", form)
  },
  async uploadExcel(file) { const form = new FormData(); form.append("file", file); await apiClient.post("/excel/upload", form) },
  async getEntities() { return (await apiClient.get<EntityDto[]>("/entidades")).data.map(adaptEntity) },
  async createEntity(input) { return adaptEntity((await apiClient.post<EntityDto>("/entidades", { ruc: input.ruc, razonSocial: input.name, contacto: input.contact, email: input.email })).data) },
  async getAnalysts() { return (await apiClient.get<AnalystDto[]>("/analistas")).data.map(adaptAnalyst) },
  async createAnalyst(input) { return adaptAnalyst((await apiClient.post<AnalystDto>("/analistas", { nombre: input.name, email: input.email, codigo: input.code })).data) },
  async getReport() { return adaptReport((await apiClient.get<ReportDto>("/reportes/solicitudes")).data) },
  async getAudit() { return adaptPage((await apiClient.get<PageDto<AuditDto>>("/auditoria")).data, adaptAudit) },
}
