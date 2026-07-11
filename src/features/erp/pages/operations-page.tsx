import { type FormEvent, useEffect, useState } from "react"
import { BarChart3, Check, Download, Eye, FileText, RefreshCw, Trash2, UploadCloud, X } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Textarea } from "@/shared/components/ui/textarea"
import { OfficialDocumentPreviewDialog } from "@/shared/components/shared/official-document-preview-dialog"
import { PageHeader } from "@/shared/components/shared/page-header"
import { PaginationControls } from "@/shared/components/shared/pagination-controls"
import { StatusBadge } from "@/shared/components/shared/status-badge"
import { appService } from "@/shared/services/service-factory"
import { protests } from "@/shared/mocks/data"
import type { OfficialDocument, Page, RequestDocument, RequestRecord, RequestReport, RequestStatus } from "@/shared/types/domain"

const emptyPage: Page<RequestRecord> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 KB"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function OperationsPage() {
  return (
    <>
      <PageHeader title="Gestion de Solicitudes" description="Revision de solicitudes institucionales y documentos oficiales del tramite." />
      <Tabs defaultValue="revision">
        <TabsList>
          <TabsTrigger value="revision">Revision</TabsTrigger>
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

function RevisionTab() {
  const [data, setData] = useState(emptyPage)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<RequestRecord | null>(null)
  const [requestDocuments, setRequestDocuments] = useState<RequestDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [previewRequestDocument, setPreviewRequestDocument] = useState<RequestDocument | null>(null)
  const [observation, setObservation] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  const [filterType, setFilterType] = useState<"pending" | "all">("pending")
  const [debtorHistory, setDebtorHistory] = useState<RequestRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    appService
      .getRequests({ page, size: 10 })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [page, reload])

  async function change(status: RequestStatus) {
    if (!selected) return
    if (status === "OBSERVADA_CCI" && !observation.trim()) {
      toast.error("Por favor, ingrese un motivo de observación en el campo de texto.")
      return
    }
    try {
      await appService.updateRequestStatus(selected.id, status, observation, undefined, selected.version)
      setSelected(null)
      setObservation("")
      setLoading(true)
      setError(false)
      setReload((value) => value + 1)
      toast.success("Estado de solicitud actualizado.")
    } catch {
      toast.error("No fue posible actualizar; recarga para descartar un conflicto.")
    }
  }

  useEffect(() => {
    if (!selected) {
      setRequestDocuments([])
      setDebtorHistory([])
      return
    }
    setDocumentsLoading(true)
    appService
      .getRequestDocuments(selected.id)
      .then(setRequestDocuments)
      .catch(() => toast.error("No fue posible cargar los documentos enviados."))
      .finally(() => setDocumentsLoading(false))

    setHistoryLoading(true)
    appService
      .getDebtorRequestsHistory(selected.documentNumber)
      .then(setDebtorHistory)
      .catch(() => toast.error("No fue posible cargar el historial de solicitudes."))
      .finally(() => setHistoryLoading(false))
  }, [selected])

  return (
    <>
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle>Bandeja de Revisión</CardTitle>
            <CardDescription>Revisión y derivación de solicitudes de levantamiento.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {/* Filtro de estado */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                  filterType === "pending"
                    ? "bg-white text-indigo-650 shadow-xs"
                    : "text-slate-550 hover:text-slate-700"
                }`}
                onClick={() => setFilterType("pending")}
              >
                Pendientes
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                  filterType === "all"
                    ? "bg-white text-indigo-650 shadow-xs"
                    : "text-slate-550 hover:text-slate-700"
                }`}
                onClick={() => setFilterType("all")}
              >
                Historial / Todas
              </button>
            </div>
            <OfficialDocumentsSheet />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>No se pudo cargar la bandeja</AlertTitle>
              <AlertDescription>
                <Button variant="outline" size="sm" onClick={() => { setLoading(true); setError(false); setReload((value) => value + 1) }}>
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
                      <TableHead>Codigo</TableHead>
                      <TableHead>Ciudadano / Deudor</TableHead>
                      <TableHead>Entidad Financiera</TableHead>
                      <TableHead>Tipo de Tramite</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Accion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredContent = data.content.filter((item) => {
                        if (filterType === "pending") {
                          return item.status !== "RECHAZADA" && item.status !== "FINALIZADA" && item.status !== "LEVANTAMIENTO_PROCESADO"
                        }
                        return true
                      })
                      if (filteredContent.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-xs text-slate-400 py-8 italic">
                              No hay solicitudes para mostrar en esta sección.
                            </TableCell>
                          </TableRow>
                        )
                      }
                      return filteredContent.map((item) => {
                        const debtorName = protests.find((p) => p.documentNumber === item.documentNumber)?.debtorName || item.applicant || "Ciudadano Deudor"
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs font-semibold text-indigo-950">{item.code}</TableCell>
                            <TableCell className="text-xs font-semibold text-slate-900">{debtorName}</TableCell>
                            <TableCell className="text-xs text-slate-650">{item.financialEntity}</TableCell>
                            <TableCell className="text-xs text-slate-500 capitalize">{item.type.toLowerCase().replaceAll("_", " ")}</TableCell>
                            <TableCell><StatusBadge status={item.status} /></TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="text-xs cursor-pointer" onClick={() => { setSelected(item); setObservation(item.observation ?? "") }}>
                                <Eye data-icon="inline-start" />
                                Revisar
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    })()}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t p-4">
                <PaginationControls page={data} onPageChange={(next) => { setLoading(true); setError(false); setPage(next) }} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) { setSelected(null); setPreviewRequestDocument(null) } }}>
        <DialogContent className="max-w-3xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Revisar Solicitud <span className="text-indigo-600 font-mono">{selected?.code}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario de revisión para evaluar sustentos y documentos adjuntos de la solicitud.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Deudor / Solicitante</span>
              <span className="mt-0.5 block text-xs font-semibold text-slate-800">
                {protests.find((p) => p.documentNumber === selected?.documentNumber)?.debtorName || selected?.applicant || "Ciudadano Deudor"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sustento presentado</span>
              <span className="mt-0.5 block text-xs font-semibold text-slate-800 line-clamp-2" title={selected?.reason}>
                {selected?.reason || "Sin descripción provista."}
              </span>
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-150 pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Documentos cargados como sustento</p>
                <p className="text-xs text-slate-500">Voucher y formatos oficiales provistos para este trámite.</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 shadow-xs">
                {requestDocuments.length} archivo(s)
              </span>
            </div>
            
            <div className="mt-3 max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {documentsLoading ? (
                <>
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </>
              ) : requestDocuments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-350 bg-white p-6 text-center text-xs text-slate-500">
                  Esta solicitud no tiene documentos adjuntos.
                </div>
              ) : (
                requestDocuments.map((document) => (
                  <div key={document.id} className="flex min-w-0 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-350 hover:shadow-xs transition-all duration-200 sm:flex-row sm:items-center">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-slate-800" title={document.filename}>
                        {document.filename}
                      </p>
                      <p className="text-xs text-slate-450 mt-0.5">
                        {document.mimeType.split("/")[1]?.toUpperCase() || document.mimeType} · {formatBytes(document.sizeBytes)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium cursor-pointer" onClick={() => setPreviewRequestDocument(document)}>
                        <Eye className="mr-1.5 size-3.5" />
                        Previsualizar
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium cursor-pointer" onClick={() => void appService.downloadRequestDocument(document)}>
                        <Download className="mr-1.5 size-3.5" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Historial de solicitudes previas */}
          <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-150 pb-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Historial de solicitudes del deudor</p>
                <p className="text-xs text-slate-500">Historial de correcciones y envíos previos del RUC/DNI.</p>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200 shadow-xs">
                {debtorHistory.filter((h) => h.id !== selected?.id).length} intento(s) previo(s)
              </span>
            </div>
            
            <div className="mt-2.5 max-h-[140px] overflow-y-auto space-y-2 pr-1 text-left">
              {historyLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : debtorHistory.filter((h) => h.id !== selected?.id).length === 0 ? (
                <div className="text-xs text-slate-400 py-2 italic text-center">
                  No se registran solicitudes anteriores para este deudor.
                </div>
              ) : (
                debtorHistory.filter((h) => h.id !== selected?.id).map((historyItem) => (
                  <div key={historyItem.id} className="text-xs border-l-2 border-indigo-200 pl-3 py-1 space-y-1 bg-white p-2 rounded-md border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-700 font-mono">{historyItem.code}</span>
                      <span className="text-[10px] text-slate-450">{new Date(historyItem.createdAt).toLocaleDateString()}</span>
                      <StatusBadge status={historyItem.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 italic">
                      Motivo: {historyItem.reason || "Sin motivo registrado"}
                    </div>
                    {historyItem.observation && (
                      <div className="text-[11px] text-red-700 bg-red-50/50 p-1.5 rounded border border-red-100/40 mt-1">
                        <strong>Observación anterior:</strong> {historyItem.observation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <Field className="space-y-1.5 text-left">
            <FieldLabel htmlFor="revision-observation" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Observación / Anotaciones adicionales
            </FieldLabel>
            <Textarea 
              id="revision-observation" 
              placeholder="Ingrese las observaciones, motivos de rechazo o anotaciones correspondientes..." 
              className="min-h-[85px] text-xs focus-visible:ring-indigo-500 rounded-lg" 
              value={observation} 
              onChange={(event) => setObservation(event.target.value)} 
            />
          </Field>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="destructive" size="sm" className="text-xs cursor-pointer px-4" onClick={() => void change("RECHAZADA")}>
              <X className="mr-1.5 size-3.5" />
              Rechazar
            </Button>
            <Button variant="outline" size="sm" className="text-xs cursor-pointer px-4" onClick={() => void change("OBSERVADA_CCI")}>
              Observar
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white cursor-pointer px-4 font-semibold shadow-sm" onClick={() => void change("DERIVADA_ENTIDAD")}>
              <Check className="mr-1.5 size-3.5" />
              Enviar al analista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RequestDocumentPreviewDialog document={previewRequestDocument} open={Boolean(previewRequestDocument)} onOpenChange={(open) => { if (!open) setPreviewRequestDocument(null) }} />
    </>
  )
}

function RequestDocumentPreviewDialog({ document, open, onOpenChange }: { document: RequestDocument | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!document || !open) {
      setUrl(null)
      setError(false)
      return
    }

    let active = true
    let objectUrl: string | null = null
    setLoading(true)
    setError(false)

    appService
      .previewRequestDocument(document)
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [document, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{document?.filename ?? "Documento"}</DialogTitle>
          <DialogDescription className="text-xs">
            {document ? `${document.mimeType} · ${formatBytes(document.sizeBytes)}` : "Archivo adjunto"}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[520px] overflow-hidden rounded-lg border bg-slate-50">
          {loading ? (
            <div className="flex h-[520px] items-center justify-center">
              <RefreshCw className="size-5 animate-spin text-slate-400" />
            </div>
          ) : error || !url ? (
            <div className="flex h-[520px] flex-col items-center justify-center text-sm text-slate-500">
              <FileText className="mb-2 size-8 text-slate-300" />
              No se pudo previsualizar el documento.
            </div>
          ) : document?.mimeType.startsWith("image/") ? (
            <img src={url} alt={document.filename} className="h-[520px] w-full object-contain" />
          ) : (
            <iframe title={document?.filename ?? "Documento"} src={url} className="h-[520px] w-full" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (document) void appService.downloadRequestDocument(document) }}>
            <Download data-icon="inline-start" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OfficialDocumentsSheet() {
  const [items, setItems] = useState<OfficialDocument[]>([])
  const [open, setOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [order, setOrder] = useState("0")
  const [file, setFile] = useState<File | null>(null)
  const [previewDocument, setPreviewDocument] = useState<OfficialDocument | null>(null)

  const load = () => {
    setLoading(true)
    appService
      .getOfficialDocuments(true)
      .then(setItems)
      .catch(() => toast.error("No fue posible cargar los documentos oficiales."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !file) {
      toast.error("Ingresa un titulo y selecciona un PDF.")
      return
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Solo se permiten archivos PDF.")
      return
    }

    setUploading(true)
    try {
      await appService.uploadOfficialDocument({
        title: title.trim(),
        description: description.trim() || undefined,
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
        file,
      })
      setTitle("")
      setDescription("")
      setOrder("0")
      setFile(null)
      const input = window.document.getElementById("official-document-file") as HTMLInputElement | null
      if (input) input.value = ""
      setPublishOpen(false)
      load()
      toast.success("Documento oficial publicado.")
    } catch {
      toast.error("No fue posible publicar el documento.")
    } finally {
      setUploading(false)
    }
  }

  async function deactivate(item: OfficialDocument) {
    try {
      await appService.deactivateOfficialDocument(item.id)
      load()
      toast.success("Documento ocultado del portal del deudor.")
    } catch {
      toast.error("No fue posible desactivar el documento.")
    }
  }

  const activeItems = items.filter((item) => item.active)

  return (
    <>
      <Button variant="outline" size="sm" className="h-8 shrink-0 text-xs" onClick={() => setOpen(true)}>
        <FileText data-icon="inline-start" />
        Documentos oficiales
        <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">{activeItems.length}</span>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[92vw] gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-5 py-4 pr-12">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle>Documentos oficiales</SheetTitle>
                <SheetDescription>PDFs visibles para el portal del deudor.</SheetDescription>
              </div>
              <Button size="sm" className="h-8 shrink-0 text-xs" onClick={() => setPublishOpen(true)}>
                <UploadCloud data-icon="inline-start" />
                Publicar PDF
              </Button>
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <FileText className="mx-auto size-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-800">No hay documentos publicados</p>
                <p className="mt-1 text-xs text-slate-500">Publica un PDF para mostrarlo en el portal del deudor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-words text-sm font-semibold text-slate-950">{item.title}</p>
                          <span className={item.active ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"}>
                            {item.active ? "Visible" : "Oculto"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 break-words text-xs text-slate-500">{item.description || "Sin descripcion"}</p>
                        <p className="mt-2 break-words text-[11px] text-slate-400">
                          {item.filename} - {formatBytes(item.sizeBytes)} - Orden {item.order}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <Button variant="outline" size="sm" onClick={() => setPreviewDocument(item)} disabled={!item.active} className="h-8 text-xs">
                        <Eye data-icon="inline-start" />
                        Previsualizar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void appService.downloadOfficialDocument(item)} disabled={!item.active} className="h-8 text-xs">
                        <Download data-icon="inline-start" />
                        Descargar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void deactivate(item)} disabled={!item.active} className="h-8 text-xs">
                        <Trash2 data-icon="inline-start" />
                        Quitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Publicar PDF</DialogTitle>
            <DialogDescription>El archivo quedara disponible para los deudores cuando se guarde como activo.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submit}>
            <Field>
              <FieldLabel htmlFor="official-document-title">Titulo visible</FieldLabel>
              <Input id="official-document-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Formato de solicitud de levantamiento" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="official-document-description">Descripcion breve</FieldLabel>
              <Input id="official-document-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Indicacion que vera el deudor" />
            </Field>
            <Field>
              <FieldLabel htmlFor="official-document-order">Orden de visualizacion</FieldLabel>
              <Input id="official-document-order" type="number" min="0" value={order} onChange={(event) => setOrder(event.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="official-document-file">Archivo PDF</FieldLabel>
              <Input id="official-document-file" type="file" accept=".pdf,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
              {file ? (
                <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{file.name}</span>
                  <span className="ml-2 text-slate-400">{formatBytes(file.size)}</span>
                </div>
              ) : null}
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                <UploadCloud data-icon="inline-start" />
                {uploading ? "Publicando..." : "Publicar documento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <OfficialDocumentPreviewDialog document={previewDocument} open={Boolean(previewDocument)} onOpenChange={(open) => { if (!open) setPreviewDocument(null) }} />
    </>
  )
}

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
          <CardDescription>Distribucion del periodo actual.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 text-xs">
          {rows.map(([status, count]) => {
            const pct = report && report.total > 0 ? Math.round((count / report.total) * 100) : 0
            return (
              <div className="flex flex-col gap-2" key={status}>
                <div className="flex justify-between text-sm">
                  <span>{status.replace("_", " ")}</span>
                  <span className="font-medium">{count} ({pct}%)</span>
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
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-muted"><BarChart3 /></div>
          <CardTitle>Total procesado</CardTitle>
          <CardDescription>Solicitudes incluidas en el reporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-semibold">{report?.total ?? "-"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Periodo: junio de 2026</p>
          <Button variant="outline" className="mt-6 text-xs cursor-pointer" onClick={() => toast.info("Exportacion simulada generada.")}>
            <Download data-icon="inline-start" />
            Exportar reporte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
