import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, FileSpreadsheet, Landmark, TrendingUp, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { appService } from "@/services/service-factory"
import type { RequestRecord } from "@/types/domain"

export function AnalystDashboard() {
  const { session } = useAuth()
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appService.getRequests({ mine: true, page: 0, size: 5 })
      .then((data) => {
        setRequests(data.content)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pendingRequests = requests.filter(r => r.status === "EN_REVISION_CCI" || r.status === "DERIVADA_ENTIDAD" || r.status === "EN_REVISION_ANALISTA")
  
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 border-b pb-4">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Panel de Analista Bancario</span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">¡Bienvenido, {session?.user.name}!</h1>
        <p className="text-slate-500 text-sm">Resumen de solicitudes asignadas a tu entidad y cargas de protestos.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pendientes de Firma</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-12" /> : (
              <div className="text-2xl font-bold text-slate-900">{pendingRequests.length}</div>
            )}
            <p className="text-[10px] text-slate-400 mt-1">Solicitudes asignadas por revisar</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Historial de Cargas</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">4</div>
            <p className="text-[10px] text-slate-400 mt-1">Archivos Excel importados este mes</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registros Activos</CardTitle>
            <Landmark className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">128</div>
            <p className="text-[10px] text-slate-400 mt-1">Protestos ingresados en la Cámara</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tasa de Aprobación</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">85%</div>
            <p className="text-[10px] text-slate-400 mt-1">Levantamientos visados correctamente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        {/* Left Card: Recent requests table */}
        <Card className="border border-slate-200">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="size-4.5 text-indigo-600" />
              Solicitudes Recientes Asignadas
            </CardTitle>
            <CardDescription className="text-xs">Últimos levantamientos de firmas derivados a tu banco.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No hay solicitudes asignadas.</div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y text-xs">
                  {requests.map((item) => (
                    <div className="flex items-center justify-between py-3" key={item.id}>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-semibold text-indigo-950">{item.code}</span>
                        <span className="text-[10px] text-slate-400">Deudor: {item.documentNumber}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-slate-800">
                          {item.currency === "PEN" ? "S/." : "$"} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer" asChild>
                  <Link to="/analista/solicitudes">Ver todas las solicitudes</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Card: Quick info and shortcuts */}
        <div className="flex flex-col gap-4">
          <Card className="border border-indigo-100 bg-indigo-50/20 p-5">
            <CardTitle className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
              <CheckCircle className="size-4 text-indigo-700" />
              Instrucciones del Analista
            </CardTitle>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 mt-3 text-left">
              <p>1. **Evaluar Levantamientos**: Revisa la pestaña de solicitudes para visar las cartas de no adeudo enviadas por ciudadanos deudores.</p>
              <p>2. **Cargar Protestos**: En la pestaña "Historial de cargas", puedes subir un archivo Excel masivo para registrar nuevos deudores en la Cámara.</p>
            </div>
          </Card>

          <Card className="border border-slate-200 p-5 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Acceso rápido</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer" asChild>
                <Link to="/analista/solicitudes">Ver solicitudes</Link>
              </Button>
              <Button variant="outline" size="sm" className="text-xs cursor-pointer" asChild>
                <Link to="/analista/historial-excel">Cargar Excel</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
