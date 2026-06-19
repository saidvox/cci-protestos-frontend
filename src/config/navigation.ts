import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileSearch,
  FileSpreadsheet,
  Gauge,
  ListChecks,
  Users,
  Eye,
  FolderOpen,
} from "lucide-react"

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

/** Navegación del deudor — /usuario/** */
export const debtorNavigation: readonly NavigationItem[] = [
  { label: "Dashboard", path: "/usuario/dashboard", icon: Gauge },
  { label: "Consultar protestos", path: "/usuario/consulta", icon: FileSearch },
  { label: "Mis solicitudes", path: "/usuario/solicitudes", icon: ListChecks },
  { label: "Mis documentos", path: "/usuario/documentos", icon: FolderOpen },
  { label: "Seguimiento", path: "/usuario/seguimiento", icon: Eye },
  { label: "Notificaciones", path: "/usuario/notificaciones", icon: Bell },
]

/** Navegación del analista bancario — /analista/** */
export const analystNavigation: readonly NavigationItem[] = [
  { label: "Dashboard", path: "/analista/dashboard", icon: Gauge },
  { label: "Historial de cargas", path: "/analista/historial-excel", icon: FileSpreadsheet },
  { label: "Solicitudes", path: "/analista/solicitudes", icon: ClipboardList },
]

/** Navegación del ERP interno — /erp/** */
export const erpNavigation: readonly NavigationItem[] = [
  { label: "Dashboard", path: "/erp/dashboard", icon: Gauge },
  { label: "Protestos", path: "/erp/protestos", icon: FileSearch },
  { label: "Solicitudes", path: "/erp/solicitudes", icon: ListChecks },
  { label: "Entidades", path: "/erp/entidades", icon: Building2 },
  { label: "Analistas", path: "/erp/analistas", icon: Users },
  { label: "Reportes", path: "/erp/reportes", icon: BarChart3 },
]

/** Mapa de títulos para breadcrumbs */
export const titleByPath = new Map(
  [...debtorNavigation, ...analystNavigation, ...erpNavigation].map((item) => [item.path, item.label]),
)
