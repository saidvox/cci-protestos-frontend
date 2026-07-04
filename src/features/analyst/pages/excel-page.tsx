import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { PageHeader } from "@/shared/components/shared/page-header"
import { UploadCard } from "@/shared/components/shared/upload-card"
import { appService } from "@/shared/services/service-factory"

export function ExcelPage() {
  return <><PageHeader title="Carga de Excel" description="Valida lotes de protestos antes de su procesamiento." /><Alert><AlertCircle /><AlertTitle>Primera fase</AlertTitle><AlertDescription>El archivo se validará y registrará, pero sus filas todavía no se importarán.</AlertDescription></Alert><UploadCard title="Archivo de carga masiva" description="Usa una plantilla .xlsx con datos exclusivamente ficticios." accept=".xlsx,.xls" onUpload={(file) => appService.uploadExcel(file)} /></>
}
