import { useState } from "react"
import { Calendar, CheckCircle2, FileSpreadsheet, Hash, Plus, User, CloudUpload, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { appService } from "@/services/service-factory"

interface UploadRecord {
  id: number
  filename: string
  uploadedAt: string
  recordsCount: number
  status: "PROCESADO" | "FALLIDO"
  uploader: string
}

export function AnalystHistory() {
  const { session } = useAuth()
  const [uploads, setUploads] = useState<UploadRecord[]>([
    {
      id: 1,
      filename: "protestos_junio_bancodemo_1506.xlsx",
      uploadedAt: "2026-06-15",
      recordsCount: 45,
      status: "PROCESADO",
      uploader: "Carlos Ramos",
    },
    {
      id: 2,
      filename: "protestos_junio_bancodemo_1006.xlsx",
      uploadedAt: "2026-06-10",
      recordsCount: 32,
      status: "PROCESADO",
      uploader: "Carlos Ramos",
    },
    {
      id: 3,
      filename: "correccion_protestos_bancodemo_0506.xlsx",
      uploadedAt: "2026-06-05",
      recordsCount: 12,
      status: "PROCESADO",
      uploader: "Carlos Ramos",
    },
    {
      id: 4,
      filename: "protestos_mayo_bancodemo_final.xlsx",
      uploadedAt: "2026-05-28",
      recordsCount: 39,
      status: "PROCESADO",
      uploader: "Carlos Ramos",
    },
  ])
  
  // Modal & Upload states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [fileSelected, setFileSelected] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)

  const downloadMockExcel = () => {
    // Generate a mock CSV template representing the Excel format that is openable
    const headers = "RUC_DNI;Deudor_Razon_Social;Monto;Moneda;Fecha_Protesto\n"
    const mockRow1 = "20123456789;Comercial El Sol S.A.C.;12500;PEN;2026-06-12\n"
    const mockRow2 = "10456789123;Maria Mendoza;3800;PEN;2026-05-28\n"
    const content = headers + mockRow1 + mockRow2
    
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plantilla_importacion_protestos.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success("Plantilla de importación descargada (.csv)")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"]
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Formato no permitido. Por favor suba archivos .xlsx, .xls o .csv")
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 10 MB.")
      return
    }

    setFileSelected(file)
    setUploadDone(false)
    setUploadProgress(0)
  }

  const startSimulatedUpload = async () => {
    if (!fileSelected) return
    setIsUploading(true)
    setUploadProgress(0)

    // Interval to simulate upload progress bar
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 15
      })
    }, 150)

    try {
      await appService.uploadExcel(fileSelected)
      
      setTimeout(() => {
        clearInterval(interval)
        setUploadProgress(100)
        setIsUploading(false)
        setUploadDone(true)
        
        // Add upload to history table reactively
        const newRecord: UploadRecord = {
          id: Date.now(),
          filename: fileSelected.name,
          uploadedAt: new Date().toISOString().split("T")[0],
          recordsCount: Math.floor(Math.random() * 40) + 15,
          status: "PROCESADO",
          uploader: session?.user.name ?? "Analista Demo",
        }
        setUploads((prev) => [newRecord, ...prev])
        toast.success("Lote masivo cargado correctamente.")
      }, 1000)

    } catch {
      clearInterval(interval)
      setIsUploading(false)
      toast.error("Ocurrió un error al cargar el archivo.")
    }
  }

  const resetModalState = () => {
    setFileSelected(null)
    setUploadProgress(0)
    setIsUploading(false)
    setUploadDone(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Historial de Cargas"
        description="Gestiona e importa los lotes masivos de protestos en formato Excel o CSV."
        actions={
          <Button onClick={() => { resetModalState(); setIsDialogOpen(true) }} className="cursor-pointer">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Carga Excel
          </Button>
        }
      />

      {/* Info Alert */}
      <Alert className="border-indigo-100 bg-indigo-50/20 text-indigo-900">
        <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
        <AlertTitle className="text-indigo-950 font-semibold text-xs text-left">Plantilla de Importación</AlertTitle>
        <AlertDescription className="text-indigo-800/90 text-xs text-left mt-1">
          Asegúrate de que tus archivos Excel respeten las columnas de la plantilla estándar de la Cámara de Comercio de Ica (RUC, Deudor, Monto, Moneda, Fecha Protesto). Recuerda usar únicamente datos ficticios para esta demostración.
        </AlertDescription>
      </Alert>

      {/* Uploads History Card */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base font-bold text-slate-800">Cargas Importadas</CardTitle>
          <CardDescription className="text-xs">Registro de los archivos procesados por tu entidad financiera.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="font-semibold text-slate-700">Nombre de Archivo</TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha de Carga</span>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Registros</span>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Usuario</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900 text-xs max-w-[280px] truncate">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{item.uploadedAt}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">{item.recordsCount}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "PROCESADO" ? "default" : "destructive"} className="text-[10px] font-semibold">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline-block align-middle" />
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.uploader}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Redesigned 2-Column Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-slate-900 text-lg font-bold">Importar Protestos Masivos</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Registra deudas y protestos de manera masiva en el sistema de la Cámara de Comercio de Ica.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-2 pt-2">
            {/* Left Column (2/5): Specifications & Downloads */}
            <div className="md:col-span-2 space-y-4 text-left md:border-r md:border-slate-100 md:pr-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Estructura del Archivo</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Asegúrese de que la primera fila del archivo contenga las siguientes columnas exactas:
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="font-semibold text-slate-700">RUC_DNI</span>
                    <span className="text-slate-400 text-[10px]">Identificación</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="font-semibold text-slate-700">Deudor_Razon_Social</span>
                    <span className="text-slate-400 text-[10px]">Nombre/Razón</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="font-semibold text-slate-700">Monto</span>
                    <span className="text-slate-400 text-[10px]">Número</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="font-semibold text-slate-700">Moneda</span>
                    <span className="text-slate-400 text-[10px]">PEN / USD</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="font-semibold text-slate-700">Fecha_Protesto</span>
                    <span className="text-slate-400 text-[10px]">AAAA-MM-DD</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg p-3 space-y-2.5 mt-auto">
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  <strong>Nota técnica:</strong> Se soportan hojas de cálculo Excel (`.xlsx`, `.xls`) y archivos planos delimitados por punto y coma (`.csv`).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadMockExcel}
                  className="w-full text-xs font-semibold text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50/50 cursor-pointer h-8"
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Descargar Plantilla
                </Button>
              </div>
            </div>

            {/* Right Column (3/5): Dropzone & Actions */}
            <div className="md:col-span-3 flex flex-col justify-center min-h-[220px]">
              {!fileSelected ? (
                /* Dropzone Area */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("excel-file-upload")?.click()}
                  className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    isDragActive
                      ? "border-indigo-600 bg-indigo-50/30 scale-[0.99]"
                      : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50"
                  }`}
                >
                  <input
                    id="excel-file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CloudUpload className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">
                      Arrastre la plantilla aquí o explore archivos
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Formatos: Excel o CSV de hasta 10 MB
                    </p>
                  </div>
                </div>
              ) : (
                /* Selected File View & Status */
                <div className="flex-1 border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between bg-white border border-slate-200/60 p-3 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="font-semibold text-slate-800 text-xs block truncate max-w-[170px] md:max-w-[210px]">
                          {fileSelected.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {(fileSelected.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    {!isUploading && !uploadDone && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer shrink-0"
                        onClick={() => setFileSelected(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  {isUploading && (
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>Procesando registros...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {uploadDone && (
                    <div className="bg-emerald-50 border border-emerald-200/50 rounded-lg p-2.5 flex gap-2 text-left animate-in fade-in duration-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">Archivo Validado Correctamente</span>
                        <span className="text-[10px] text-emerald-800 leading-normal block mt-0.5">
                          Se procesaron los registros de protestos en la base de la Cámara.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-2 mt-2">
                    {!uploadDone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs cursor-pointer h-8"
                        onClick={() => setFileSelected(null)}
                        disabled={isUploading}
                      >
                        Cancelar
                      </Button>
                    )}
                    {!isUploading && !uploadDone ? (
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs cursor-pointer h-8 font-medium"
                        onClick={startSimulatedUpload}
                      >
                        Cargar Lote Masivo
                      </Button>
                    ) : uploadDone ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer h-8 font-medium"
                        onClick={() => {
                          setFileSelected(null)
                          setUploadDone(false)
                          setIsDialogOpen(false)
                        }}
                      >
                        Finalizar
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
