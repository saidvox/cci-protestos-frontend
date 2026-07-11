import { type ChangeEvent, type DragEvent, useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, CloudUpload, Download, FileSpreadsheet, Plus, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/shared/components/shared/page-header"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { appService } from "@/shared/services/service-factory"
import type { ExcelUploadRecord, OfficialDocument } from "@/shared/types/domain"

const EXCEL_ACCEPT = ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export function AnalystHistory() {
  const [uploads, setUploads] = useState<ExcelUploadRecord[]>([])
  const [template, setTemplate] = useState<OfficialDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [history, documents] = await Promise.all([
        appService.getExcelUploads(),
        appService.getOfficialDocuments(),
      ])
      setUploads(history)
      setTemplate(documents.find((item) => item.type === "PLANTILLA_EXCEL" && item.active) ?? null)
    } catch {
      toast.error("No fue posible cargar el historial de Excel.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function selectFile(candidate: File) {
    const name = candidate.name.toLowerCase()
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      toast.error("Selecciona un archivo Excel .xlsx o .xls.")
      return
    }
    if (candidate.size > 10 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 10 MB.")
      return
    }
    setFile(candidate)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const candidate = event.target.files?.[0]
    if (candidate) selectFile(candidate)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const candidate = event.dataTransfer.files?.[0]
    if (candidate) selectFile(candidate)
  }

  async function importFile() {
    if (!file) return
    setImporting(true)
    try {
      const validation = await appService.validateExcel(file)
      if (!validation.valid) {
        toast.error(`El Excel contiene ${validation.errorRows} fila(s) con errores. Corrige el archivo antes de importarlo.`)
        return
      }
      const result = await appService.importExcel(file)
      toast.success(`${result.importedRows} registro(s) importados correctamente.`)
      setDialogOpen(false)
      setFile(null)
      await load()
    } catch {
      toast.error("No fue posible validar e importar el Excel.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Historial de cargas"
        description="Consulta los archivos Excel procesados por tu usuario e importa nuevos registros con la plantilla institucional."
        actions={
          <Button onClick={() => { setFile(null); setDialogOpen(true) }}>
            <Plus data-icon="inline-start" />
            Nueva carga
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><FileSpreadsheet className="size-4" /></span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Plantilla Excel institucional</p>
            {template ? (
              <p className="mt-0.5 truncate text-xs text-slate-500">{template.filename}</p>
            ) : (
              <p className="mt-0.5 text-xs text-amber-700">Excel no disponible. El ERP debe publicar la plantilla institucional.</p>
            )}
          </div>
        </div>
        <Button variant="outline" disabled={!template} onClick={() => template && void appService.downloadOfficialDocument(template)}>
          <Download data-icon="inline-start" />
          Descargar plantilla
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between border-b">
          <div>
            <CardTitle>Cargas procesadas</CardTitle>
            <CardDescription>Solo se muestran archivos importados por tu cuenta.</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => void load()} aria-label="Actualizar historial"><RefreshCw /></Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : uploads.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileSpreadsheet className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Aún no hay cargas registradas</p>
              <p className="mt-1 text-xs text-slate-500">Cuando importes tu primer Excel, el resultado aparecerá aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Archivo</TableHead><TableHead>Fecha</TableHead><TableHead>Filas</TableHead><TableHead>Resultado</TableHead><TableHead>Usuario</TableHead></TableRow></TableHeader>
                <TableBody>
                  {uploads.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><div className="flex min-w-48 items-center gap-2"><FileSpreadsheet className="size-4 shrink-0 text-emerald-700" /><span className="max-w-72 truncate text-xs font-medium">{item.filename}</span></div></TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-500">{new Date(item.uploadedAt).toLocaleString("es-PE")}</TableCell>
                      <TableCell className="text-xs"><strong>{item.importedRows}</strong> de {item.totalRows}</TableCell>
                      <TableCell><UploadStatus record={item} /></TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-600">{item.uploader}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar protestos desde Excel</DialogTitle>
            <DialogDescription>El sistema validará todas las filas antes de guardar información en la base de datos.</DialogDescription>
          </DialogHeader>
          {!template && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertCircle className="size-4 shrink-0" /><span>No existe una plantilla institucional activa. Solicita al ERP que publique una antes de preparar la carga.</span></div>
          )}
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex min-w-0 items-center gap-3"><FileSpreadsheet className="size-5 shrink-0 text-emerald-700" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p></div></div>
              <Button variant="ghost" size="icon-sm" onClick={() => setFile(null)} aria-label="Quitar archivo"><Trash2 className="text-red-600" /></Button>
            </div>
          ) : (
            <label
              className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-slate-900 bg-slate-50" : "border-slate-300 hover:border-slate-500"}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input className="sr-only" type="file" accept={EXCEL_ACCEPT} onChange={handleFileChange} />
              <CloudUpload className="size-7 text-slate-500" />
              <span className="text-sm font-semibold text-slate-900">Arrastra el Excel aquí o selecciónalo</span>
              <span className="text-xs text-slate-500">Solo .xlsx o .xls, máximo 10 MB</span>
            </label>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={importing}>Cancelar</Button>
            <Button onClick={() => void importFile()} disabled={!file || importing}>{importing ? "Validando e importando..." : "Validar e importar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UploadStatus({ record }: { record: ExcelUploadRecord }) {
  if (record.status === "PROCESADA") {
    return <Badge className="bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-3" /> Procesada</Badge>
  }
  if (record.status === "CON_ERROR") {
    return <Badge variant="destructive"><AlertCircle className="size-3" /> Con errores ({record.errorRows})</Badge>
  }
  return <Badge variant="outline">Recibida</Badge>
}
