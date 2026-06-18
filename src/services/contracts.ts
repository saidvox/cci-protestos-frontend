import type {
  Analyst,
  AuditEntry,
  AuthSession,
  FinancialEntity,
  LoginCredentials,
  Page,
  Protest,
  RequestRecord,
  RequestReport,
  RequestStatus,
} from "@/types/domain"

export interface AppService {
  login(credentials: LoginCredentials): Promise<AuthSession>
  getProtests(query?: string): Promise<Protest[]>
  getRequests(mine?: boolean): Promise<Page<RequestRecord>>
  createRequest(input: { type: string; detail: string; entityId: number }): Promise<RequestRecord>
  updateRequestStatus(id: number, status: RequestStatus, observation?: string, analystId?: number): Promise<RequestRecord>
  uploadDocument(requestId: number, file: File): Promise<void>
  uploadExcel(file: File): Promise<void>
  getEntities(): Promise<FinancialEntity[]>
  createEntity(input: Omit<FinancialEntity, "id" | "active">): Promise<FinancialEntity>
  getAnalysts(): Promise<Analyst[]>
  createAnalyst(input: Pick<Analyst, "name" | "email" | "code">): Promise<Analyst>
  getReport(): Promise<RequestReport>
  getAudit(): Promise<Page<AuditEntry>>
}
