import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileArchive,
  FileSearch,
  FileSpreadsheet,
  FileUp,
  Gauge,
  History,
  ListChecks,
  UserRoundCog,
} from "lucide-react"
import type { Role } from "@/types/domain"

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  roles?: readonly Role[]
}

export const navigationItems: readonly NavigationItem[] = [
  { label: "Dashboard", path: "/", icon: Gauge },
  { label: "Consulta de protestos", path: "/protestos", icon: FileSearch },
  { label: "Registrar solicitud", path: "/solicitudes/nueva", icon: FileArchive },
  { label: "Seguimiento", path: "/solicitudes", icon: ListChecks },
  { label: "Carga de documentos", path: "/documentos", icon: FileUp },
  { label: "Carga de Excel", path: "/excel", icon: FileSpreadsheet, roles: ["ADMIN", "ANALISTA"] },
  { label: "Entidades financieras", path: "/entidades", icon: Building2, roles: ["ADMIN"] },
  { label: "Analistas", path: "/analistas", icon: UserRoundCog, roles: ["ADMIN"] },
  { label: "Revisión", path: "/revision", icon: ClipboardCheck, roles: ["ADMIN", "ANALISTA"] },
  { label: "Reportes", path: "/reportes", icon: BarChart3, roles: ["ADMIN", "ANALISTA"] },
  { label: "Auditoría", path: "/auditoria", icon: History, roles: ["ADMIN"] },
]

export const titleByPath = new Map(navigationItems.map((item) => [item.path, item.label]))
