import { useEffect, useState } from "react"
import { BarChart3, Check, Download, Eye, RefreshCw, X } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/page-header"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { StatusBadge } from "@/components/shared/status-badge"
import { appService } from "@/services/service-factory"
import { protests } from "@/mocks/data"
import type { Page, RequestRecord, RequestReport, RequestStatus } from "@/types/domain"

const emptyPage: Page<RequestRecord> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }

export function OperationsPage() {
  return (
    <>
      <PageHeader
        title="Gestión de Solicitudes"
        description="Revisión de solicitudes institucionales y reportes estadísticos de la Cámara."
      />
      <Tabs defaultValue="revision">
        <TabsList>
          <TabsTrigger value="revision">Revisión</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="revision" className="mt-4">
          <RevisionTab />
        </TabsContent>
        <TabsContent value="reportes" className="mt-4">
          <ReportesTab />
        </TabsContent>
      </Tabs>
    </>
  )
}

/* ── Revisión ── */
function RevisionTab() {
  const [data, setData] = useState(emptyPage)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<RequestRecord | null>(null)
  const [observation, setObservation] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    appService
      .getRequests({ page, size: 10 })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [page, reload])

  async function change(status: RequestStatus) {
    if (!selected) return
    try {
      await appService.updateRequestStatus(selected.id, status, observation, undefined, selected.version)
      setSelected(null)
      setObservation("")
      setLoading(true)
      setError(false)
      setReload((v) => v + 1)
      toast.success("Estado de solicitud actualizado.")
    } catch {
      toast.error("No fue posible actualizar; recarga para descartar un conflicto.")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bandeja de Revisión</CardTitle>
          <CardDescription>Solicitudes paginadas pendientes de evaluación y derivación.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>No se pudo cargar la bandeja</AlertTitle>
              <AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setLoading(true); setError(false); setReload((v) => v + 1) }}
                >
                  <RefreshCw data-icon="inline-start" />
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Ciudadano / Deudor</TableHead>
                      <TableHead>Entidad Financiera</TableHead>
                      <TableHead>Tipo de Trámite</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.content.map((item) => {
                      // Lookup debtor name using documentNumber
                      const debtorName = protests.find(p => p.documentNumber === item.documentNumber)?.debtorName || item.applicant || "Ciudadano Deudor"
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold text-indigo-950">{item.code}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-900">{debtorName}</TableCell>
                          <TableCell className="text-xs text-slate-600">{item.financialEntity}</TableCell>
                          <TableCell className="text-xs text-slate-500 capitalize">{item.type.toLowerCase().replaceAll("_", " ")}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs cursor-pointer"
                              onClick={() => { setSelected(item); setObservation(item.observation ?? "") }}
                            >
                              <Eye data-icon="inline-start" />
                              Revisar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t">
                <PaginationControls
                  page={data}
                  onPageChange={(next) => { setLoading(true); setError(false); setPage(next) }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar Solicitud {selected?.code}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Deudor: {protests.find(p => p.documentNumber === selected?.documentNumber)?.debtorName || selected?.applicant || "Ciudadano Deudor"}
              <br />
              Sustento: {selected?.reason}
            </DialogDescription>
          </DialogHeader>
          <Field className="space-y-1.5 text-left">
            <FieldLabel htmlFor="revision-observation" className="text-xs font-semibold text-slate-700">
              Observación / Anotaciones adicionales
            </FieldLabel>
            <Textarea
              id="revision-observation"
              placeholder="Ingrese el motivo de rechazo u observación en caso sea necesario..."
              className="text-xs min-h-[80px]"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </Field>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="destructive" size="sm" className="text-xs cursor-pointer" onClick={() => void change("RECHAZADA")}>
              <X data-icon="inline-start" />
              Rechazar
            </Button>
            <Button variant="outline" size="sm" className="text-xs cursor-pointer" onClick={() => void change("OBSERVADA_CCI")}>
              Observar
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs cursor-pointer" onClick={() => void change("DERIVADA_ENTIDAD")}>
              <Check data-icon="inline-start" />
              Enviar al analista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ── Reportes ── */
function ReportesTab() {
  const [report, setReport] = useState<RequestReport | null>(null)

  useEffect(() => {
    appService.getReport().then(setReport).catch(() => toast.error("No fue posible cargar el reporte."))
  }, [])

  const rows = report ? Object.entries(report.byStatus) : []

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes por estado</CardTitle>
          <CardDescription>Distribución del período actual.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 text-xs">
          {rows.map(([status, count]) => {
            const pct = report && report.total > 0 ? Math.round((count / report.total) * 100) : 0
            return (
              <div className="flex flex-col gap-2" key={status}>
                <div className="flex justify-between text-sm">
                  <span>{status.replace("_", " ")}</span>
                  <span className="font-medium">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-muted">
            <BarChart3 />
          </div>
          <CardTitle>Total procesado</CardTitle>
          <CardDescription>Solicitudes incluidas en el reporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-semibold">{report?.total ?? "—"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Período: junio de 2026</p>
          <Button
            variant="outline"
            className="mt-6 text-xs cursor-pointer"
            onClick={() => toast.info("Exportación simulada generada.")}
          >
            <Download data-icon="inline-start" />
            Exportar reporte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
