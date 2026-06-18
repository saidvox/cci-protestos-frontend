import type { Analyst, AuditEntry, FinancialEntity, Protest, RequestRecord } from "@/types/domain"

export const protests: Protest[] = [
  { id: 1, documentNumber: "20123456789", debtorName: "Comercial El Sol S.A.C.", financialEntity: "Banco Demo Ica", amount: 12500, registeredAt: "2026-06-12", status: "VIGENTE" },
  { id: 2, documentNumber: "10456789123", debtorName: "María Mendoza", financialEntity: "Caja Regional Demo", amount: 3800, registeredAt: "2026-05-28", status: "REGULARIZADO" },
  { id: 3, documentNumber: "20678912345", debtorName: "Servicios Paracas E.I.R.L.", financialEntity: "Cooperativa Académica", amount: 8200, registeredAt: "2026-05-17", status: "VIGENTE" },
]

export const requests: RequestRecord[] = [
  { id: 1, code: "SOL-2026-0048", applicant: "Banco Demo Ica", financialEntity: "Banco Demo Ica", type: "Registro de protesto", status: "EN_REVISION", createdAt: "2026-06-17" },
  { id: 2, code: "SOL-2026-0047", applicant: "Caja Regional Demo", financialEntity: "Caja Regional Demo", type: "Regularización", status: "OBSERVADA", createdAt: "2026-06-16", observation: "Adjuntar constancia legible." },
  { id: 3, code: "SOL-2026-0046", applicant: "Banco Demo Ica", financialEntity: "Banco Demo Ica", type: "Registro de protesto", status: "APROBADA", createdAt: "2026-06-15" },
  { id: 4, code: "SOL-2026-0045", applicant: "Cooperativa Académica", financialEntity: "Cooperativa Académica", type: "Rectificación", status: "REGISTRADA", createdAt: "2026-06-14" },
]

export const entities: FinancialEntity[] = [
  { id: 1, ruc: "20111111111", name: "Banco Demo Ica", contact: "Mesa de operaciones", email: "operaciones@bancodemo.local", active: true },
  { id: 2, ruc: "20222222222", name: "Caja Regional Demo", contact: "Secretaría", email: "contacto@cajademo.local", active: true },
  { id: 3, ruc: "20333333333", name: "Cooperativa Académica", contact: "Mesa de partes", email: "mesa@cooperativademo.local", active: false },
]

export const analysts: Analyst[] = [
  { id: 1, code: "AN-001", name: "Carlos Ramos", email: "carlos.ramos@demo.local", assigned: 12, active: true },
  { id: 2, code: "AN-002", name: "Lucía Fernández", email: "lucia.fernandez@demo.local", assigned: 8, active: true },
]

export const auditEntries: AuditEntry[] = [
  { id: 1, actor: "Ana Torres", action: "INICIÓ SESIÓN", resource: "Autenticación", date: "2026-06-18 09:12", detail: "Acceso administrativo de demostración" },
  { id: 2, actor: "Carlos Ramos", action: "CAMBIÓ ESTADO", resource: "SOL-2026-0048", date: "2026-06-18 08:44", detail: "REGISTRADA → EN_REVISION" },
  { id: 3, actor: "Lucía Fernández", action: "OBSERVÓ SOLICITUD", resource: "SOL-2026-0047", date: "2026-06-17 16:30", detail: "Documento principal ilegible" },
]
