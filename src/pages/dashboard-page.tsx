import { useEffect, useState } from "react"
import { ArrowUpRight, Building2, CircleCheckBig, ClipboardList, Clock3 } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { appService } from "@/services/service-factory"
import type { RequestRecord, RequestReport } from "@/types/domain"

export function DashboardPage() {
  const [report, setReport] = useState<RequestReport | null>(null)
  const [recentRequests, setRecentRequests] = useState<RequestRecord[] | null>(null)
  const [entitiesCount, setEntitiesCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [rep, reqs, ents] = await Promise.all([
          appService.getReport(),
          appService.getRequests(false),
          appService.getEntities()
        ])
        setReport(rep)
        setRecentRequests(reqs.content.slice(0, 4))
        setEntitiesCount(ents.length)
      } catch {
        toast.error("No fue posible cargar los datos del dashboard.")
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  const stats = report ? [
    { label: "Solicitudes totales", value: String(report.total), detail: "Histórico general acumulado", icon: ClipboardList },
    { label: "Pendientes de revisión", value: String((report.byStatus.REGISTRADA || 0) + (report.byStatus.EN_REVISION || 0)), detail: `${report.byStatus.REGISTRADA || 0} registradas, ${report.byStatus.EN_REVISION || 0} en revisión`, icon: Clock3 },
    { label: "Aprobadas", value: String(report.byStatus.APROBADA || 0), detail: report.total > 0 ? `${Math.round(((report.byStatus.APROBADA || 0) / report.total) * 100)}% del total` : "0% del total", icon: CircleCheckBig },
    { label: "Entidades activas", value: String(entitiesCount), detail: "Entidades registradas en el sistema", icon: Building2 },
  ] : []

  const chartData = report ? [
    { label: "Aprobadas", value: report.byStatus.APROBADA || 0 },
    { label: "En revisión", value: report.byStatus.EN_REVISION || 0 },
    { label: "Observadas", value: report.byStatus.OBSERVADA || 0 },
    { label: "Registradas", value: report.byStatus.REGISTRADA || 0 }
  ] : []

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen operativo del sistema con datos del servidor." actions={<Button asChild><Link to="/solicitudes/nueva">Nueva solicitud<ArrowUpRight data-icon="inline-start" /></Link></Button>} />
      
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-32" /></CardContent></Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] mt-6">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div className="flex flex-col gap-1"><CardTitle>Solicitudes recientes</CardTitle><CardDescription>Últimos movimientos registrados.</CardDescription></div>
            <Button variant="outline" size="sm" asChild><Link to="/solicitudes">Ver todas</Link></Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : recentRequests && recentRequests.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Entidad</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Fecha</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentRequests.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.financialEntity}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-right">{item.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No hay solicitudes registradas recientemente.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actividad general</CardTitle><CardDescription>Distribución del flujo de solicitudes.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-5">
            {loading ? (
              <div className="flex flex-col gap-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
            ) : report && report.total > 0 ? (
              chartData.map(({ label, value }) => {
                const percent = report.total > 0 ? Math.round((value / report.total) * 100) : 0
                return (
                  <div className="flex items-center justify-between gap-3" key={label}>
                    <div className="flex items-center gap-3"><span className="size-2 rounded-full bg-primary" /><span className="text-sm">{label}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium">{value}</span><Badge variant="secondary">{percent}%</Badge></div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">Sin datos de distribución.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
