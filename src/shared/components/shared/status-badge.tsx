import { Badge } from "@/shared/components/ui/badge"
import type { RequestStatus } from "@/shared/types/domain"

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
  if (status === "APROBADA_ENTIDAD" || status === "FINALIZADA" || status === "LEVANTAMIENTO_PROCESADO") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50/80">
        {labels[status] ?? status}
      </Badge>
    )
  }

  const variant =
    status === "RECHAZADA"
      ? "destructive"
      : status === "OBSERVADA_CCI" || status === "OBSERVADA_ENTIDAD"
      ? "outline"
      : "secondary"
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>
}
