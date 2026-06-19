import type { Analyst, AuditEntry, AuthSession, CreateRequestInput, DashboardSummary, FinancialEntity, LoginCredentials, Page, PageQuery, Protest, ProtestFilters, RegisterInput, RequestQuery, RequestRecord, RequestReport, RequestStatus } from "@/types/domain"
export interface AppService {
  getCsrf(): Promise<void>; login(credentials: LoginCredentials): Promise<AuthSession>; logout(): Promise<void>; getDashboard(): Promise<DashboardSummary>
  getSession(): Promise<AuthSession>; register(input: RegisterInput): Promise<void>
  getProtests(filters?: ProtestFilters): Promise<Protest[]>; getRequests(query?: RequestQuery): Promise<Page<RequestRecord>>; createRequest(input: CreateRequestInput): Promise<RequestRecord>
  updateRequestStatus(id: number, status: RequestStatus, observation?: string, analystId?: number, version?: number): Promise<RequestRecord>
  uploadDocument(requestId: number, file: File): Promise<void>; uploadExcel(file: File): Promise<void>
  getEntities(): Promise<FinancialEntity[]>; createEntity(input: Omit<FinancialEntity, "id" | "active">): Promise<FinancialEntity>
  getAnalysts(): Promise<Analyst[]>; createAnalyst(input: Pick<Analyst, "name" | "email" | "code">): Promise<Analyst>
  getReport(): Promise<RequestReport>; getAudit(query?: PageQuery): Promise<Page<AuditEntry>>
}
