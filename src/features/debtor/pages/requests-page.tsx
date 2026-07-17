import { useEffect, useState, type FormEvent } from "react"
import { Eye, RefreshCw, Plus, Send } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { PageHeader } from "@/shared/components/shared/page-header"
import { PaginationControls } from "@/shared/components/shared/pagination-controls"
import { StatusBadge } from "@/shared/components/shared/status-badge"
import { NewRequestDialog } from "@/shared/components/shared/new-request-dialog"
import { UploadCard } from "@/shared/components/shared/upload-card"
import { appService } from "@/shared/services/service-factory"
import type { Currency, FinancialEntity, Page, RequestDocument, RequestRecord, RequestType } from "@/shared/types/domain"

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 KB"
  const units = ["B", "KB", "MB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const emptyPage: Page<RequestRecord> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }

export function RequestsPage() {
  const [data, setData] = useState(emptyPage)
  const [selected, setSelected] = useState<RequestRecord | null>(null)
  const [correcting, setCorrecting] = useState<RequestRecord | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    appService
      .getRequests({ mine: true, page, size: 10 })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [page, reload])

  function handleCreated() {
    setLoading(true)
    setError(false)
    setPage(0)
    setReload((v) => v + 1)
  }

  function retry() {
    setLoading(true)
    setError(false)
    setReload((v) => v + 1)
  }

  return (
    <>
      <PageHeader
        title="Solicitudes"
        description="Gestiona y da seguimiento a tus trámites de protesto."
        actions={<NewRequestDialog onCreated={handleCreated} />}
      />

      <Tabs defaultValue="seguimiento">
        <TabsList>
          <TabsTrigger value="seguimiento">Mis solicitudes</TabsTrigger>
          <TabsTrigger value="documentos">Documentos adjuntos</TabsTrigger>
        </TabsList>

        {/* Tab: Mis solicitudes */}
        <TabsContent value="seguimiento" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis solicitudes</CardTitle>
              <CardDescription>Listado paginado de tus trámites activos.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>No se pudieron cargar las solicitudes</AlertTitle>
                  <AlertDescription>
                    <Button variant="outline" size="sm" onClick={retry}>
                      <RefreshCw data-icon="inline-start" />
                      Reintentar
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : data.content.length ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.content.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-sm">{item.code}</TableCell>
                            <TableCell>{item.type.replaceAll("_", " ")}</TableCell>
                            <TableCell>
                              <StatusBadge status={item.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{item.createdAt}</TableCell>
                            <TableCell className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Ver ${item.code}`}
                                onClick={() => setSelected(item)}
                              >
                                <Eye className="size-4" />
                              </Button>
                              {(item.status === "OBSERVADA_CCI" || item.status === "OBSERVADA_ENTIDAD") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs font-semibold px-2.5 border-amber-200 text-amber-700 hover:bg-amber-50 cursor-pointer"
                                  onClick={() => setCorrecting(item)}
                                >
                                  Corregir
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationControls
                    page={data}
                    onPageChange={(next) => {
                      setLoading(true)
                      setError(false)
                      setPage(next)
                    }}
                  />
                </>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Sin solicitudes</EmptyTitle>
                    <EmptyDescription>
                      Aún no tienes trámites registrados. Usa el botón{" "}
                      <strong>Nueva solicitud</strong> para comenzar.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documentos" className="mt-4">
          <UploadCard
            title="Documento de sustento"
            description="Adjunta el PDF, PNG o JPG a una solicitud registrada. Formatos permitidos: PDF, PNG y JPG."
            accept=".pdf,.png,.jpg,.jpeg"
            requestId
            onUpload={(file, id) => appService.uploadDocument(id ?? 0, file)}
          />
        </TabsContent>
      </Tabs>

      {/* Detalle dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.code}</DialogTitle>
            <DialogDescription>Detalle de la solicitud</DialogDescription>
          </DialogHeader>
          {selected ? (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Documento</dt>
                <dd className="font-medium">{selected.documentNumber}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Monto</dt>
                <dd className="font-medium">
                  {selected.amount.toLocaleString("es-PE", {
                    style: "currency",
                    currency: selected.currency,
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd>{selected.type.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estado</dt>
                <dd>
                  <StatusBadge status={selected.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Motivo</dt>
                <dd>{selected.reason}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Observación</dt>
                <dd>{selected.observation || "Sin observaciones"}</dd>
              </div>
            </dl>
          ) : null}
          {selected && (selected.status === "OBSERVADA_CCI" || selected.status === "OBSERVADA_ENTIDAD") && (
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold border-amber-200 text-amber-700 hover:bg-amber-50 cursor-pointer w-full sm:w-auto"
                onClick={() => {
                  setCorrecting(selected)
                  setSelected(null)
                }}
              >
                Corregir Solicitud
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Corrección */}
      <Dialog open={Boolean(correcting)} onOpenChange={(open) => { if (!open) setCorrecting(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Corregir Solicitud <span className="font-mono text-indigo-600">{correcting?.code}</span></DialogTitle>
            <DialogDescription>
              Corrige los campos observados por la Cámara de Comercio para reenviar el trámite.
            </DialogDescription>
          </DialogHeader>

          {correcting?.observation && (
            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 text-left">
              <strong>Observación de la revisión:</strong>
              <p className="mt-1 font-medium">{correcting.observation}</p>
            </div>
          )}

          {correcting && (
            <CorrectionForm
              request={correcting}
              onFinished={() => {
                setCorrecting(null)
                retry()
              }}
              onCancel={() => setCorrecting(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface CorrectionFormProps {
  request: RequestRecord
  onFinished: () => void
  onCancel: () => void
}

function CorrectionForm({ request, onFinished, onCancel }: CorrectionFormProps) {
  const [type, setType] = useState<RequestType>(request.type)
  const [entityId, setEntityId] = useState("")
  const [entities, setEntities] = useState<FinancialEntity[]>([])
  const [reason, setReason] = useState(request.reason)
  const [documentNumber, setDocumentNumber] = useState(request.documentNumber)
  const [amount, setAmount] = useState(String(request.amount))
  const [currency, setCurrency] = useState<Currency>(request.currency)
  const [loading, setLoading] = useState(false)

  const [docs, setDocs] = useState<RequestDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)

  useEffect(() => {
    appService.getEntities().then((items) => {
      setEntities(items)
      const found = items.find(e => e.name === request.financialEntity)
      if (found) {
        setEntityId(String(found.id))
      } else {
        setEntityId(String(items[0]?.id ?? ""))
      }
    })
  }, [request])

  useEffect(() => {
    setDocsLoading(true)
    appService.getRequestDocuments(request.id)
      .then(setDocs)
      .finally(() => setDocsLoading(false))
  }, [request])

  async function handleFileUpload(file: File) {
    try {
      await appService.uploadDocument(request.id, file)
      toast.success("Documento subido correctamente.")
      const updated = await appService.getRequestDocuments(request.id)
      setDocs(updated)
    } catch {
      toast.error("Error al subir el documento.")
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = Number(amount)
    if (
      !entityId ||
      !documentNumber.trim() ||
      documentNumber.length > 20 ||
      !Number.isFinite(parsed) ||
      parsed <= 0 ||
      !reason.trim()
    ) {
      toast.error("Por favor, complete todos los campos requeridos correctamente.")
      return
    }
    setLoading(true)
    try {
      await appService.updateRequest(request.id, {
        type,
        entityId: Number(entityId),
        documentNumber: documentNumber.trim(),
        amount: parsed,
        currency,
        reason: reason.trim(),
      })
      toast.success(`Solicitud corregida y reenviada correctamente.`)
      onFinished()
    } catch {
      toast.error("No fue posible reenviar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipo de trámite</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as RequestType)}
            className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="REGISTRO_PROTESTO">Registro de protesto</option>
            <option value="REGULARIZACION">Regularización</option>
            <option value="RECTIFICACION">Rectificación</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Entidad financiera</label>
          <select 
            value={entityId} 
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            {entities.map((entity) => (
              <option key={entity.id} value={String(entity.id)}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documento del deudor</label>
          <input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            maxLength={20}
            required
            className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monto</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Moneda</label>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="PEN">PEN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Motivo</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={3}
          className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        />
      </div>

      {/* Documentos */}
      <div className="space-y-2 border-t pt-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documentos adjuntos</label>
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
          {docsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : docs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-2">No hay documentos adjuntos en esta solicitud.</p>
          ) : (
            docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between gap-2 p-2 border rounded bg-slate-50 text-xs">
                <span className="truncate font-medium text-slate-700">{doc.filename}</span>
                <span className="text-[10px] text-slate-400">
                  {doc.mimeType.split("/")[1]?.toUpperCase() || doc.mimeType} · {formatBytes(doc.sizeBytes)}
                </span>
              </div>
            ))
          )}
        </div>
        
        {/* Upload Button */}
        <input
          type="file"
          id="corr-file-upload"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="w-full text-xs cursor-pointer"
          onClick={() => document.getElementById("corr-file-upload")?.click()}
        >
          <Plus className="mr-1 size-3.5" />
          Subir nuevo documento de corrección
        </Button>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
          <Send className="mr-1.5 size-3.5" />
          {loading ? "Reenviando..." : "Reenviar solicitud"}
        </Button>
      </div>
    </form>
  )
}
