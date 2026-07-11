import type {
  Analyst,
  AuditEntry,
  AuthSession,
  CreateRequestInput,
  DashboardSummary,
  DebtorLookup,
  ExcelImportResult,
  ExcelValidationResult,
  FinancialEntity,
  LoginCredentials,
  OfficialDocument,
  Page,
  PageQuery,
  Protest,
  ProtestFilters,
  RegisterInput,
  RequestDocument,
  RequestQuery,
  RequestRecord,
  RequestReport,
  RequestStatus,
} from "@/shared/types/domain"

export interface AppService {
  getCsrf(): Promise<void>; login(credentials: LoginCredentials): Promise<AuthSession>; logout(): Promise<void>; getDashboard(): Promise<DashboardSummary>
  getSession(): Promise<AuthSession>; register(input: RegisterInput): Promise<void>; lookupDebtor(tipoDocumento: string, numeroDocumento: string): Promise<DebtorLookup>
  getProtests(filters?: ProtestFilters): Promise<Page<Protest>>; getRequests(query?: RequestQuery): Promise<Page<RequestRecord>>; createRequest(input: CreateRequestInput): Promise<RequestRecord>
  updateRequest(id: number, input: CreateRequestInput): Promise<RequestRecord>
  getDebtorRequestsHistory(documentNumber: string): Promise<RequestRecord[]>
  updateRequestStatus(id: number, status: RequestStatus, observation?: string, analystId?: number, version?: number): Promise<RequestRecord>
  uploadDocument(requestId: number, file: File): Promise<void>; uploadExcel(file: File): Promise<void>
  getRequestDocuments(requestId: number): Promise<RequestDocument[]>; previewRequestDocument(document: RequestDocument): Promise<Blob>; downloadRequestDocument(document: RequestDocument): Promise<void>
  validateExcel(file: File): Promise<ExcelValidationResult>; importExcel(file: File): Promise<ExcelImportResult>
  getOfficialDocuments(includeInactive?: boolean): Promise<OfficialDocument[]>; uploadOfficialDocument(input: { title: string; description?: string; order?: number; file: File }): Promise<OfficialDocument>
  deactivateOfficialDocument(id: number): Promise<OfficialDocument>; previewOfficialDocument(document: OfficialDocument): Promise<Blob>; downloadOfficialDocument(document: OfficialDocument): Promise<void>
  getEntities(): Promise<FinancialEntity[]>; createEntity(input: Omit<FinancialEntity, "id" | "active">): Promise<FinancialEntity>; updateEntity(id: number, input: Omit<FinancialEntity, "id">): Promise<FinancialEntity>
  getAnalysts(): Promise<Analyst[]>; createAnalyst(input: Pick<Analyst, "name" | "email" | "code"> & { entityId: number }): Promise<Analyst>; updateAnalyst(id: number, input: Omit<Analyst, "id" | "assigned"> & { entityId: number }): Promise<Analyst>
  getReport(): Promise<RequestReport>; getAudit(query?: PageQuery): Promise<Page<AuditEntry>>
}
