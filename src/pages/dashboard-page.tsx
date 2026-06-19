import { useEffect, useState } from "react"
import { ArrowUpRight, Building2, CircleCheckBig, ClipboardList, Clock3, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { appService } from "@/services/service-factory"
import type { DashboardSummary } from "@/types/domain"
export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [reload, setReload] = useState(0)
  useEffect(() => { appService.getDashboard().then(setSummary).catch(() => setError(true)).finally(() => setLoading(false)) }, [reload])
  const stats = summary ? [{ label: "Solicitudes totales", value: summary.total, icon: ClipboardList }, { label: "Pendientes", value: summary.pending, icon: Clock3 }, { label: "Aprobadas", value: summary.approved, icon: CircleCheckBig }, { label: "Entidades activas", value: summary.activeEntities, icon: Building2 }] : []
  return <><PageHeader title="Dashboard" description="Resumen operativo del sistema." actions={<Button asChild><Link to="/solicitudes/nueva">Nueva solicitud<ArrowUpRight data-icon="inline-end" /></Link></Button>} />
    {error ? <Alert variant="destructive"><AlertTitle>No se pudo cargar el dashboard</AlertTitle><AlertDescription><Button variant="outline" size="sm" onClick={() => { setLoading(true); setError(false); setReload((value) => value + 1) }}><RefreshCw data-icon="inline-start" />Reintentar</Button></AlertDescription></Alert> : null}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{loading ? Array.from({ length: 4 }, (_, index) => <Card key={index}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>) : stats.map((stat) => <Card key={stat.label}><CardHeader className="flex-row items-center justify-between"><CardDescription>{stat.label}</CardDescription><stat.icon /></CardHeader><CardContent><CardTitle className="text-3xl">{stat.value}</CardTitle></CardContent></Card>)}</section>
    <Card className="mt-6"><CardHeader><CardTitle>Solicitudes recientes</CardTitle><CardDescription>Últimos movimientos permitidos para tu perfil.</CardDescription></CardHeader><CardContent>{!loading && summary?.recentRequests.length ? <Table><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Entidad</TableHead><TableHead>Estado</TableHead><TableHead>Fecha</TableHead></TableRow></TableHeader><TableBody>{summary.recentRequests.map((item) => <TableRow key={item.id}><TableCell>{item.code}</TableCell><TableCell>{item.financialEntity}</TableCell><TableCell><StatusBadge status={item.status} /></TableCell><TableCell>{item.createdAt}</TableCell></TableRow>)}</TableBody></Table> : !loading && !error ? <p className="py-8 text-center text-muted-foreground">No hay solicitudes recientes.</p> : null}</CardContent></Card></>
}
