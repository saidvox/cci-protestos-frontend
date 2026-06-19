import { Badge } from "@/components/ui/badge"
import type { RequestStatus } from "@/types/domain"

const labels: Record<RequestStatus, string> = {
  REGISTRADA: "Registrada",
  EN_REVISION_CCI: "En revisión CCI",
  OBSERVADA_CCI: "Observada CCI",
  DERIVADA_ENTIDAD: "Derivada a entidad",
  EN_REVISION_ANALISTA: "En revisión analista",
  OBSERVADA_ENTIDAD: "Observada por entidad",
  RECHAZADA: "Rechazada",
  APROBADA_ENTIDAD: "Aprobada por entidad",
  FINALIZADA: "Finalizada",
  LEVANTAMIENTO_PROCESADO: "Levantamiento procesado",
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const variant =
    status === "RECHAZADA"
      ? "destructive"
      : status === "APROBADA_ENTIDAD" || status === "FINALIZADA" || status === "LEVANTAMIENTO_PROCESADO"
      ? "default"
      : status === "OBSERVADA_CCI" || status === "OBSERVADA_ENTIDAD"
      ? "outline"
      : "secondary"
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>
}
