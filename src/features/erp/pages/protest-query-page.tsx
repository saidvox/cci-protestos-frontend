import { useEffect, useState } from "react"
import { AlertCircle, Calendar, CheckCircle2, Coins, Download, FileSearch, Filter, Search, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { PageHeader } from "@/shared/components/shared/page-header"
import { PaginationControls } from "@/shared/components/shared/pagination-controls"
import { appService } from "@/shared/services/service-factory"
import type { ExcelValidationResult, Page, Protest } from "@/shared/types/domain"

const excelExtensions = [".xlsx", ".xls"]
const pageSize = 10
const emptyProtestPage: Page<Protest> = { content: [], page: 0, size: pageSize, totalElements: 0, totalPages: 0 }

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback
  if (!("response" in error)) return fallback
  const response = (error as { response?: { data?: { message?: unknown } } }).response
  return typeof response?.data?.message === "string" ? response.data.message : fallback
}

export function ProtestQueryPage() {
  const [protestsPage, setProtestsPage] = useState<Page<Protest>>(emptyProtestPage)
  const [page, setPage] = useState(0)
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchDoc, setSearchDoc] = useState("")
  const [searchName, setSearchName] = useState("")
  const [filterStatus, setFilterStatus] = useState("TODOS")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validation, setValidation] = useState<ExcelValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    setError(false)
    setLoading(true)
    appService.getProtests({
      page,
      size: pageSize,
      ...(searchDoc.trim() ? { documento: searchDoc.trim() } : {}),
      ...(searchName.trim() ? { nombre: searchName.trim() } : {}),
      ...(filterStatus !== "TODOS" ? { estado: filterStatus as Protest["status"] } : {}),
    })
      .then(setProtestsPage)
      .catch(() => {
        setError(true)
        toast.error("No se pudo cargar el listado de protestos.")
      })
      .finally(() => setLoading(false))
  }, [page, searchDoc, searchName, filterStatus, reload])

  const updateSearchDoc = (value: string) => {
    setSearchDoc(value)
    setPage(0)
  }

  const updateSearchName = (value: string) => {
    setSearchName(value)
    setPage(0)
  }

  const updateFilterStatus = (value: string) => {
    setFilterStatus(value)
    setPage(0)
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setValidation(null)
    setValidating(false)
    setImporting(false)
    setDragActive(false)
  }

  const handleFileSelected = (file?: File) => {
    if (!file) return
    const dotIndex = file.name.lastIndexOf(".")
    const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : ""
    if (!excelExtensions.includes(extension)) {
      toast.error("Solo se permiten archivos Excel .xlsx o .xls.")
      return
    }
    setSelectedFile(file)
    setValidation(null)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFileSelected(file)
  }

  const validateSelectedFile = async () => {
    if (!selectedFile) return
    setValidating(true)
    try {
      const result = await appService.validateExcel(selectedFile)
      setValidation(result)
      if (result.valid) {
        toast.success(`Plantilla válida: ${result.validRows} fila(s) listas para importar.`)
      } else {
        toast.error(`Se encontraron ${result.errorRows} fila(s) con observaciones.`)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo validar el Excel. Revisa que uses la plantilla oficial."))
    } finally {
      setValidating(false)
    }
  }

  const importSelectedFile = async () => {
    if (!selectedFile || !validation?.valid) return
    setImporting(true)
    try {
      const result = await appService.importExcel(selectedFile)
      toast.success(result.summary)
      setUploadOpen(false)
      resetUpload()
      setPage(0)
      setReload((value) => value + 1)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo importar el Excel. Valida nuevamente el archivo."))
    } finally {
      setImporting(false)
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Registro Nacional de Protestos"
        description="Consulta y administra los deudores con protestos vigentes y regularizados."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/templates/plantilla-protestos-cci.xlsx" download="plantilla-protestos-cci.xlsx">
                <Download data-icon="inline-start" />
                Descargar plantilla Excel
              </a>
            </Button>
            <Button onClick={() => { resetUpload(); setUploadOpen(true) }}>
              <UploadCloud data-icon="inline-start" />
              Cargar Excel
            </Button>
          </div>
        }
      />

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Directorio de Deudas</CardTitle>
              <CardDescription className="text-xs">
                {protestsPage.totalElements} registro(s) encontrado(s) en la base de datos de la Cámara.
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-3 pt-1 sm:grid-cols-12">
            <div className="relative sm:col-span-4">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por DNI o RUC..."
                value={searchDoc}
                onChange={(event) => updateSearchDoc(event.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>

            <div className="relative sm:col-span-5">
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por Razón Social o Nombre..."
                value={searchName}
                onChange={(event) => updateSearchName(event.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <Select value={filterStatus} onValueChange={updateFilterStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="VIGENTE">Vigente</SelectItem>
                  <SelectItem value="REGULARIZADO">Regularizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-48 w-full animate-pulse" />
            </div>
          ) : error ? (
            <div className="p-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileSearch />
                  </EmptyMedia>
                  <EmptyTitle>No se pudo cargar la información</EmptyTitle>
                  <EmptyDescription>Ocurrió un error al consultar el registro de protestos.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : protestsPage.content.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Ningún deudor coincide con los parámetros de búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="font-semibold text-slate-700">Documento</TableHead>
                    <TableHead className="font-semibold text-slate-700">Deudor / Razón Social</TableHead>
                    <TableHead className="font-semibold text-slate-700">Entidad Acreedora</TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Registrado</span>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Plazo / Vencimiento</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      <span className="flex items-center justify-end gap-1"><Coins className="h-3.5 w-3.5" /> Monto</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protestsPage.content.map((item) => {
                    const regDate = new Date(item.registeredAt)
                    regDate.setDate(regDate.getDate() + 30)
                    const dueDateString = regDate.toISOString().split("T")[0]

                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.documentNumber}</TableCell>
                        <TableCell className="text-xs font-semibold text-slate-900">{item.debtorName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{item.financialEntity}</TableCell>
                        <TableCell className="text-xs text-slate-500">{item.registeredAt}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {dueDateString}
                          {item.status === "VIGENTE" ? (
                            <span className="ml-1.5 rounded border border-amber-100 bg-amber-50 px-1 py-0.5 text-[10px] font-medium text-amber-600">
                              Pendiente
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "VIGENTE" ? "destructive" : "secondary"}
                            className="text-[10px] font-semibold uppercase"
                          >
                            {item.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-slate-900">
                          S/. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="px-6 pb-5">
                <PaginationControls page={protestsPage} onPageChange={(nextPage) => { setLoading(true); setPage(nextPage) }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUpload() }}>
        <DialogContent className="max-h-[90vh] w-[min(calc(100vw-2rem),720px)] !max-w-none overflow-y-auto overflow-x-hidden sm:!max-w-none">
          <DialogHeader>
            <DialogTitle>Validar e importar protestos</DialogTitle>
            <DialogDescription>
              Sube la plantilla oficial. El sistema revisará columnas, catálogos, fechas, montos y entidades antes de guardar en la base de datos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label
              htmlFor="protest-excel-upload"
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragEnter={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors ${
                dragActive
                  ? "border-slate-900 bg-slate-100"
                  : "border-slate-300 bg-slate-50/70 hover:border-slate-500 hover:bg-slate-50"
              }`}
            >
              <UploadCloud className="h-9 w-9 text-slate-500" />
              <span className="max-w-full px-2 text-sm font-semibold leading-snug text-slate-900">
                {selectedFile ? selectedFile.name : "Arrastra tu Excel aquí o haz clic para seleccionarlo"}
              </span>
              <span className="text-xs text-slate-500">Solo archivos .xlsx o .xls</span>
            </label>
            <Input
              id="protest-excel-upload"
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => handleFileSelected(event.target.files?.[0])}
            />

            <div className="grid min-w-0 gap-2 sm:grid-cols-2">
              <Button className="min-w-0" disabled={!selectedFile || validating || importing} onClick={validateSelectedFile}>
                {validating ? "Validando..." : "Validar archivo"}
              </Button>
              <Button className="min-w-0" variant="outline" disabled={!validation?.valid || importing} onClick={importSelectedFile}>
                {importing ? "Importando..." : "Confirmar importación"}
              </Button>
            </div>

            {!validation ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                <FileSearch className="mx-auto mb-2 h-7 w-7 text-slate-400" />
                Selecciona o arrastra un Excel y presiona validar para revisar si está listo para importarse.
              </div>
            ) : validation.valid ? (
              <div className="space-y-4">
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertTitle>Archivo listo para importar</AlertTitle>
                  <AlertDescription>
                    {validation.validRows} de {validation.totalRows} fila(s) pasaron la validación.
                  </AlertDescription>
                </Alert>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fila</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Deudor</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.preview.map((item) => (
                        <TableRow key={`${item.row}-${item.numeroTitulo}`}>
                          <TableCell className="text-xs">{item.row}</TableCell>
                          <TableCell className="font-mono text-xs">{item.numeroDocumento}</TableCell>
                          <TableCell className="text-xs">{item.nombreRazonSocial}</TableCell>
                          <TableCell className="text-xs">{item.numeroTitulo}</TableCell>
                          <TableCell className="text-xs font-semibold">
                            {item.moneda} {item.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Corrige el Excel antes de importarlo</AlertTitle>
                  <AlertDescription>
                    {validation.errorRows} fila(s) tienen observaciones. No se guardará nada hasta que el archivo esté limpio.
                  </AlertDescription>
                </Alert>
                <div className="max-h-72 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fila</TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Corrección requerida</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.errors.map((item, index) => (
                        <TableRow key={`${item.row}-${item.field}-${index}`}>
                          <TableCell className="text-xs font-semibold">{item.row}</TableCell>
                          <TableCell className="text-xs">{item.field}</TableCell>
                          <TableCell className="max-w-36 truncate font-mono text-xs">{item.value || "-"}</TableCell>
                          <TableCell className="text-xs">{item.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
