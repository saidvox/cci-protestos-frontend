import { Badge } from "@/components/ui/badge"
import type { RequestStatus } from "@/types/domain"

const labels: Record<RequestStatus, string> = {
  REGISTRADA: "Registrada",
  EN_REVISION: "En revisión",
  OBSERVADA: "Observada",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const variant = status === "RECHAZADA" ? "destructive" : status === "APROBADA" ? "default" : status === "OBSERVADA" ? "outline" : "secondary"
  return <Badge variant={variant}>{labels[status]}</Badge>
}
