import type {
  Analyst,
  AnalystActivationInfo,
  AnalystInvitation,
  AuditEntry,
  AuthSession,
  CreateAnalystInput,
  CreateRequestInput,
  DashboardSummary,
  DebtorLookup,
  ExcelImportResult,
  ExcelUploadRecord,
  ExcelValidationResult,
  FinancialEntity,
  LoginCredentials,
  NotificationFeed,
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
  getProtests(filters?: ProtestFilters): Promise<Page<Protest>>; getRequests(query?: RequestQuery): Promise<Page<RequestRecord>>; createRequest(input: CreateRequestInput, files?: File[]): Promise<RequestRecord>
  updateRequest(id: number, input: CreateRequestInput): Promise<RequestRecord>
  getDebtorRequestsHistory(documentNumber: string): Promise<RequestRecord[]>
  updateRequestStatus(id: number, status: RequestStatus, observation?: string, analystId?: number, version?: number): Promise<RequestRecord>
  uploadDocument(requestId: number, file: File): Promise<void>; uploadDocuments(requestId: number, files: File[]): Promise<void>; uploadExcel(file: File): Promise<void>; getExcelUploads(): Promise<ExcelUploadRecord[]>
  getRequestDocuments(requestId: number): Promise<RequestDocument[]>; previewRequestDocument(document: RequestDocument): Promise<Blob>; downloadRequestDocument(document: RequestDocument): Promise<void>
  validateExcel(file: File): Promise<ExcelValidationResult>; importExcel(file: File): Promise<ExcelImportResult>
  getOfficialDocuments(includeInactive?: boolean): Promise<OfficialDocument[]>; uploadOfficialDocument(input: { title: string; description?: string; order?: number; type?: OfficialDocument["type"]; file: File }): Promise<OfficialDocument>
  deleteOfficialDocument(id: number): Promise<void>; previewOfficialDocument(document: OfficialDocument): Promise<Blob>; downloadOfficialDocument(document: OfficialDocument): Promise<void>
  getEntities(): Promise<FinancialEntity[]>; createEntity(input: Omit<FinancialEntity, "id" | "active">): Promise<FinancialEntity>; updateEntity(id: number, input: Omit<FinancialEntity, "id">): Promise<FinancialEntity>; toggleEntityStatus(id: number, active: boolean): Promise<FinancialEntity>
  getAnalysts(): Promise<Analyst[]>; createAnalyst(input: CreateAnalystInput): Promise<AnalystInvitation>; regenerateAnalystInvitation(id: number): Promise<AnalystInvitation>; restartAnalystActivation(id: number): Promise<AnalystInvitation>; validateAnalystInvitation(token: string): Promise<AnalystActivationInfo>; activateAnalyst(token: string, password: string): Promise<void>; updateAnalyst(id: number, input: Omit<Analyst, "id" | "assigned" | "accessStatus"> & { entityId: number }): Promise<Analyst>; toggleAnalystStatus(id: number, active: boolean): Promise<Analyst>; resetAnalystPassword(id: number, password: string): Promise<void>
  getNotifications(limit?: number): Promise<NotificationFeed>; markNotificationsRead(throughId: number): Promise<void>
  getReport(): Promise<RequestReport>; getAudit(query?: PageQuery): Promise<Page<AuditEntry>>
}
