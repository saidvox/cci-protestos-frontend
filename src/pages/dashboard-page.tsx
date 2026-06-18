import { ArrowUpRight, Building2, CircleCheckBig, ClipboardList, Clock3 } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { requests } from "@/mocks/data"

const stats = [
  { label: "Solicitudes del mes", value: "48", detail: "+12% frente a mayo", icon: ClipboardList },
  { label: "Pendientes de revisión", value: "14", detail: "6 con prioridad alta", icon: Clock3 },
  { label: "Aprobadas", value: "29", detail: "60% del total", icon: CircleCheckBig },
  { label: "Entidades activas", value: "18", detail: "3 incorporadas este año", icon: Building2 },
]

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Resumen operativo del sistema al 18 de junio de 2026." actions={<Button asChild><Link to="/solicitudes/nueva">Nueva solicitud<ArrowUpRight data-icon="inline-end" /></Link></Button>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
              <p className="text-xs text-muted-foreground">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div className="flex flex-col gap-1"><CardTitle>Solicitudes recientes</CardTitle><CardDescription>Últimos movimientos registrados.</CardDescription></div>
            <Button variant="outline" size="sm" asChild><Link to="/solicitudes">Ver todas</Link></Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Entidad</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Fecha</TableHead></TableRow></TableHeader>
              <TableBody>{requests.slice(0, 4).map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.code}</TableCell><TableCell>{item.financialEntity}</TableCell><TableCell><StatusBadge status={item.status} /></TableCell><TableCell className="text-right">{item.createdAt}</TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actividad del mes</CardTitle><CardDescription>Distribución del flujo de solicitudes.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-5">
            {[["Aprobadas", "29", "60%"], ["En revisión", "10", "21%"], ["Observadas", "6", "13%"], ["Registradas", "3", "6%"]].map(([label, value, percent]) => (
              <div className="flex items-center justify-between gap-3" key={label}>
                <div className="flex items-center gap-3"><span className="size-2 rounded-full bg-primary" /><span className="text-sm">{label}</span></div>
                <div className="flex items-center gap-2"><span className="font-medium">{value}</span><Badge variant="secondary">{percent}</Badge></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
