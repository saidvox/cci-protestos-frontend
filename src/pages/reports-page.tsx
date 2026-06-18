import { useEffect, useState } from "react"
import { Download, FileBarChart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { RequestReport } from "@/types/domain"

export function ReportsPage() {
  const [report, setReport] = useState<RequestReport | null>(null)
  useEffect(() => { appService.getReport().then(setReport).catch(() => toast.error("No fue posible cargar el reporte.")) }, [])
  const rows = report ? Object.entries(report.byStatus) : []
  return <>
    <PageHeader title="Reportes" description="Indicadores consolidados de solicitudes y estados." actions={<Button variant="outline" onClick={() => toast.info("Exportación simulada generada.")}><Download data-icon="inline-start" />Exportar reporte</Button>} />
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card><CardHeader><CardTitle>Solicitudes por estado</CardTitle><CardDescription>Distribución del período actual.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5">{rows.map(([status, count]) => { const percentage = report ? Math.round(count / report.total * 100) : 0; return <div className="flex flex-col gap-2" key={status}><div className="flex justify-between text-sm"><span>{status.replace("_", " ")}</span><span className="font-medium">{count} ({percentage}%)</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div></div> })}</CardContent></Card>
      <Card><CardHeader><div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-muted"><FileBarChart /></div><CardTitle>Total procesado</CardTitle><CardDescription>Solicitudes incluidas en el reporte.</CardDescription></CardHeader><CardContent><p className="text-5xl font-semibold">{report?.total ?? "—"}</p><p className="mt-2 text-sm text-muted-foreground">Período: junio de 2026</p></CardContent></Card>
    </div>
  </>
}
