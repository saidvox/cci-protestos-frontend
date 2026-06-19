import { Download, FileBarChart, Coins, Landmark, ClipboardList, ShieldAlert, Award } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { protests, requests, entities } from "@/mocks/data"

export function ReportsPage() {
  // Calculate dynamic stats from in-memory mock datasets
  const totalRequests = requests.length
  
  const approvedRequests = requests.filter(
    (r) => r.status === "APROBADA_ENTIDAD" || r.status === "FINALIZADA" || r.status === "LEVANTAMIENTO_PROCESADO"
  ).length
  const pendingRequests = requests.filter(
    (r) => r.status === "EN_REVISION_CCI" || r.status === "DERIVADA_ENTIDAD" || r.status === "EN_REVISION_ANALISTA"
  ).length
  const observedRequests = requests.filter(
    (r) => r.status === "OBSERVADA_CCI" || r.status === "OBSERVADA_ENTIDAD"
  ).length
  const rejectedRequests = requests.filter((r) => r.status === "RECHAZADA").length

  const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0

  const totalProtestsCount = protests.length
  const activeProtests = protests.filter((p) => p.status === "VIGENTE")
  const regularizedProtests = protests.filter((p) => p.status === "REGULARIZADO")

  const totalDebtPEN = protests.reduce((sum, p) => sum + p.amount, 0)
  const activeDebtPEN = activeProtests.reduce((sum, p) => sum + p.amount, 0)
  const regularizedDebtPEN = regularizedProtests.reduce((sum, p) => sum + p.amount, 0)

  // Calculate statistics per financial entity
  const entityStats = entities.map((ent) => {
    const entProtests = protests.filter((p) => p.financialEntity === ent.name)
    const entRequests = requests.filter((r) => r.financialEntity === ent.name)
    const entApproved = entRequests.filter(
      (r) => r.status === "APROBADA_ENTIDAD" || r.status === "FINALIZADA" || r.status === "LEVANTAMIENTO_PROCESADO"
    ).length

    const totalAmt = entProtests.reduce((sum, p) => sum + p.amount, 0)
    const activeAmt = entProtests.filter((p) => p.status === "VIGENTE").reduce((sum, p) => sum + p.amount, 0)

    const resolutionRate = entRequests.length > 0 ? Math.round((entApproved / entRequests.length) * 100) : 100

    return {
      name: ent.name,
      protestsCount: entProtests.length,
      requestsCount: entRequests.length,
      totalAmount: totalAmt,
      activeAmount: activeAmt,
      resolutionRate,
    }
  })

  const exportReport = () => {
    toast.success("Generando archivo Excel del Reporte Consolidado...")
    setTimeout(() => {
      // Simulate download
      const csvContent = `Reporte Consolidado de Protestos - Camara de Comercio de Ica\nFecha: ${new Date().toLocaleDateString()}\n\nResumen General:\nProtestos Totales:;${totalProtestsCount}\nDeuda Total Activa:;S/. ${activeDebtPEN.toLocaleString()}\nDeuda Regularizada:;S/. ${regularizedDebtPEN.toLocaleString()}\nSolicitudes Recibidas:;${totalRequests}\nTasa de Aprobacion:;${approvalRate}%\n`
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `reporte_consolidado_cci_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Reporte descargado correctamente (.csv)")
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reportes y Estadísticas"
        description="Métricas consolidadas de deudores, protestos vigentes y levantamientos de firmas."
        actions={
          <Button onClick={exportReport} className="cursor-pointer">
            <Download className="mr-1.5 h-4 w-4" />
            Exportar Excel
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monto Vigente</CardDescription>
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-slate-900">
              S/. {activeDebtPEN.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </CardTitle>
            <p className="text-[10px] text-slate-400 mt-1">
              De {activeProtests.length} protestos en estado activo
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saneado</CardDescription>
            <Award className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-slate-900">
              S/. {regularizedDebtPEN.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </CardTitle>
            <p className="text-[10px] text-slate-400 mt-1">
              {regularizedProtests.length} protestos regularizados con éxito
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trámites Recibidos</CardDescription>
            <ClipboardList className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-slate-900">{totalRequests}</CardTitle>
            <p className="text-[10px] text-slate-400 mt-1">
              {pendingRequests} solicitudes pendientes de visar
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eficacia de Visado</CardDescription>
            <FileBarChart className="h-4.5 w-4.5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-slate-900">{approvalRate}%</CardTitle>
            <p className="text-[10px] text-slate-400 mt-1">
              Tasa de aprobación por entidades bancarias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Grid */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Solicitudes breakdown */}
        <Card className="border border-slate-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              Estado de Trámites de Levantamiento
            </CardTitle>
            <CardDescription className="text-xs">
              Distribuición actual de las {totalRequests} solicitudes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Aprobadas</span>
                <span className="text-slate-900">{approvedRequests} ({totalRequests > 0 ? Math.round(approvedRequests/totalRequests*100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${totalRequests > 0 ? (approvedRequests/totalRequests*100) : 0}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">En revisión (CCI / Banco)</span>
                <span className="text-slate-900">{pendingRequests} ({totalRequests > 0 ? Math.round(pendingRequests/totalRequests*100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalRequests > 0 ? (pendingRequests/totalRequests*100) : 0}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Observadas</span>
                <span className="text-slate-900">{observedRequests} ({totalRequests > 0 ? Math.round(observedRequests/totalRequests*100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${totalRequests > 0 ? (observedRequests/totalRequests*100) : 0}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Rechazadas</span>
                <span className="text-slate-900">{rejectedRequests} ({totalRequests > 0 ? Math.round(rejectedRequests/totalRequests*100) : 0}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: `${totalRequests > 0 ? (rejectedRequests/totalRequests*100) : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deuda por Banco */}
        <Card className="border border-slate-200 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-emerald-600" />
              Monto Protestado por Entidad
            </CardTitle>
            <CardDescription className="text-xs">
              Monto total en títulos valores morosos reportados en Ica.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5 text-xs">
            {entityStats.slice(0, 5).map((ent) => {
              const percentage = totalDebtPEN > 0 ? Math.round((ent.totalAmount / totalDebtPEN) * 100) : 0
              return (
                <div className="space-y-1" key={ent.name}>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600 font-semibold">{ent.name}</span>
                    <span className="text-slate-900">
                      S/. {ent.totalAmount.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-700" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Entities Performance Table */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-slate-500" />
            Desempeño Operativo de Entidades Bancarias
          </CardTitle>
          <CardDescription className="text-xs">
            Reporte consolidado del flujo de registro y resolución por entidad financiera adscrita.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="font-semibold text-slate-700">Entidad Financiera</TableHead>
                  <TableHead className="font-semibold text-slate-700">Protestos Reportados</TableHead>
                  <TableHead className="font-semibold text-slate-700">Deuda Activa Vigente</TableHead>
                  <TableHead className="font-semibold text-slate-700">Solicitudes Gestionadas</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Monto Total Cargado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entityStats.map((ent) => (
                  <TableRow key={ent.name} className="hover:bg-slate-50/50">
                    <TableCell className="font-semibold text-slate-900 text-xs">{ent.name}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{ent.protestsCount} lotes</TableCell>
                    <TableCell className="text-xs text-red-600 font-bold">
                      S/. {ent.activeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-semibold">{ent.requestsCount} trámites</TableCell>
                    <TableCell className="text-right text-xs text-slate-800 font-bold">
                      S/. {ent.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
