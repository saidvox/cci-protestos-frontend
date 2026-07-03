import { useEffect, useState } from "react"
import { Eye, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
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
import type { Page, RequestRecord } from "@/shared/types/domain"

const emptyPage: Page<RequestRecord> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }

export function RequestsPage() {
  const [data, setData] = useState(emptyPage)
  const [selected, setSelected] = useState<RequestRecord | null>(null)
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
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Ver ${item.code}`}
                                onClick={() => setSelected(item)}
                              >
                                <Eye />
                              </Button>
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
        </DialogContent>
      </Dialog>
    </>
  )
}
