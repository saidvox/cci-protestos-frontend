import { useEffect, useState } from "react"
import { Check, Eye, RefreshCw, X, AlertCircle, FileText, Search, Download } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Textarea } from "@/shared/components/ui/textarea"
import { PageHeader } from "@/shared/components/shared/page-header"
import { PaginationControls } from "@/shared/components/shared/pagination-controls"
import { StatusBadge } from "@/shared/components/shared/status-badge"
import { appService } from "@/shared/services/service-factory"
import type { Page, RequestRecord, RequestStatus, RequestDocument } from "@/shared/types/domain"

const emptyPage: Page<RequestRecord> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }

export function AnalystRequests() {
  const [data, setData] = useState(emptyPage)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<RequestRecord | null>(null)
  const [observation, setObservation] = useState("")
  const [showObservationField, setShowObservationField] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [reload, setReload] = useState(0)

  const [documents, setDocuments] = useState<RequestDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<RequestDocument | null>(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  useEffect(() => {
    appService
      .getRequests({ mine: true, page, size: 10, search: searchTerm })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [page, reload, searchTerm])

  async function handleResolve(status: RequestStatus) {
    if (!selected) return
    if (status === "OBSERVADA_ENTIDAD" && !observation.trim()) {
      toast.error("Por favor, ingrese un motivo de observación.")
      return
    }

    try {
      await appService.updateRequestStatus(selected.id, status, observation, undefined, selected.version)
      
      // Update local state reactively
      setData(prev => ({
        ...prev,
        content: prev.content.map(item => 
          item.id === selected.id 
            ? { ...item, status, observation: status === "OBSERVADA_ENTIDAD" ? observation : item.observation, version: item.version + 1 }
            : item
        )
      }))

      setSelected(null)
      setObservation("")
      setShowObservationField(false)
      toast.success(status === "APROBADA_ENTIDAD" ? "Solicitud aprobada correctamente." : "Solicitud observada.")
    } catch {
      toast.error("No fue posible actualizar el estado de la solicitud.")
    }
  }

  function handleSelect(item: RequestRecord) {
    setObservation(item.observation ?? "")
    setShowObservationField(false)

    setDocsLoading(true)
    setDocuments([])
    appService.getRequestDocuments(item.id)
      .then(setDocuments)
      .catch(() => toast.error("Error al cargar los documentos de sustento."))
      .finally(() => setDocsLoading(false))

    if (item.status === "DERIVADA_ENTIDAD") {
      appService.updateRequestStatus(item.id, "EN_REVISION_ANALISTA", "", undefined, item.version)
        .then((updated) => {
          setData(prev => ({
            ...prev,
            content: prev.content.map(x => x.id === item.id ? updated : x)
          }))
          setSelected(updated)
        })
        .catch(() => {
          setSelected(item)
        })
    } else {
      setSelected(item)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Evaluación de Solicitudes"
        description="Revisa, aprueba u observa los trámites de levantamiento de protesto derivados a tu banco."
      />

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">Bandeja de Solicitudes Asignadas</CardTitle>
            <CardDescription className="text-xs">Visualiza las solicitudes del Banco Demo Ica.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por código..."
              className="pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertTitle>Error de carga</AlertTitle>
                <AlertDescription className="flex items-center gap-3">
                  <span>No se pudieron cargar las solicitudes asignadas.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setLoading(true); setError(false); setReload((v) => v + 1) }}
                  >
                    <RefreshCw className="mr-1 h-3.5 w-3.5" />
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : data.content.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No se encontraron solicitudes que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="font-semibold text-slate-700">Código</TableHead>
                    <TableHead className="font-semibold text-slate-700">Documento Deudor</TableHead>
                    <TableHead className="font-semibold text-slate-700">Monto</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tipo de Trámite</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="font-semibold text-slate-700">Fecha Registro</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((item) => {
                    const isEvaluable = item.status === "EN_REVISION_CCI" || item.status === "DERIVADA_ENTIDAD" || item.status === "EN_REVISION_ANALISTA"
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs font-semibold text-indigo-950">{item.code}</TableCell>
                        <TableCell className="text-xs text-slate-600">{item.documentNumber}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-800">
                          {item.currency === "PEN" ? "S/." : "$"} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 capitalize">{item.type.toLowerCase().replaceAll("_", " ")}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{item.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isEvaluable ? "default" : "outline"}
                            size="sm"
                            className="text-xs cursor-pointer"
                            onClick={() => handleSelect(item)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            {isEvaluable ? "Evaluar" : "Ver Detalle"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="p-4 border-t">
                <PaginationControls
                  page={data}
                  onPageChange={(next) => { setLoading(true); setError(false); setPage(next) }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Solicitud {selected?.code}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Verifica los sustentos adjuntos del deudor antes de tomar una decisión.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 my-2 text-left">
              {/* Request Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Deudor (Nro Documento)</span>
                  <span className="font-semibold text-slate-900">{selected.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Monto del Protesto</span>
                  <span className="font-semibold text-slate-900">
                    {selected.currency === "PEN" ? "S/." : "$"} {selected.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tipo de Trámite</span>
                  <span className="font-semibold text-slate-900 capitalize">{selected.type.toLowerCase().replaceAll("_", " ")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Estado Actual</span>
                  <div className="mt-0.5"><StatusBadge status={selected.status} /></div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-medium">Motivo/Sustento del Deudor</span>
                  <span className="text-slate-700 block mt-0.5">{selected.reason}</span>
                </div>
              </div>

              {/* Archivos de Sustento Adjuntos */}
              <div className="border border-indigo-100 rounded-lg p-3 bg-indigo-50/20">
                <h4 className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Documentos de Sustento Adjuntos
                </h4>
                {docsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4 bg-white rounded border border-dashed">
                    No se adjuntaron documentos de sustento.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-indigo-100/50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-slate-700 block truncate" title={doc.filename}>
                              {doc.filename}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(doc.sizeBytes / 1024).toFixed(1)} KB • Creado el {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 font-semibold text-[11px] h-7 px-2 cursor-pointer hover:bg-indigo-50"
                          onClick={() => setPreviewDocument(doc)}
                        >
                          Ver Documento
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observation Textarea if requested or observing */}
              {(showObservationField || selected.status === "OBSERVADA_ENTIDAD") && (
                <Field className="space-y-1">
                  <FieldLabel htmlFor="observation-input" className="text-xs font-semibold text-slate-700">
                    Motivo de Observación (Requerido para Observar)
                  </FieldLabel>
                  <Textarea
                    id="observation-input"
                    placeholder="Detalla qué correcciones o documentos adicionales se requieren de parte del ciudadano..."
                    className="text-xs min-h-[70px]"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                  />
                </Field>
              )}

              {/* History observation display if it already had one */}
              {selected.observation && !showObservationField && (
                <div className="text-xs p-3 bg-amber-50 rounded-lg border border-amber-200/50 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-900 block">Última observación registrada</span>
                    <span className="text-amber-800">{selected.observation}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs cursor-pointer"
              onClick={() => {
                setSelected(null)
                setShowObservationField(false)
              }}
            >
              Cerrar
            </Button>

            {selected && (selected.status === "EN_REVISION_CCI" || selected.status === "DERIVADA_ENTIDAD" || selected.status === "EN_REVISION_ANALISTA") && (
              <>
                {!showObservationField ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs cursor-pointer"
                    onClick={() => setShowObservationField(true)}
                  >
                    Observar...
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs cursor-pointer"
                    onClick={() => handleResolve("OBSERVADA_ENTIDAD")}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Enviar Observación
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs cursor-pointer text-white"
                  onClick={() => setShowApproveConfirm(true)}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Aprobar Firma
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-950 font-bold text-sm">Confirmar Aprobación</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              ¿Está seguro de que desea aprobar la solicitud <strong>{selected?.code}</strong>? Esta acción actualizará el estado y notificará al deudor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setShowApproveConfirm(false)} className="text-xs">
              Cancelar
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white cursor-pointer" onClick={() => {
              setShowApproveConfirm(false)
              handleResolve("APROBADA_ENTIDAD")
            }}>
              Sí, Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <RequestDocumentPreviewDialog
        document={previewDocument}
        open={Boolean(previewDocument)}
        onOpenChange={(open) => { if (!open) setPreviewDocument(null) }}
      />
    </div>
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
            {document ? `${document.mimeType} · ${(document.sizeBytes / 1024).toFixed(1)} KB` : "Archivo adjunto"}
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
            <Download className="mr-1 h-3.5 w-3.5" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShieldCheck(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
