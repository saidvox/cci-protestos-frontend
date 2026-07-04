import { PageHeader } from "@/shared/components/shared/page-header"
import { UploadCard } from "@/shared/components/shared/upload-card"
import { appService } from "@/shared/services/service-factory"

export function DocumentsPage() {
  return <><PageHeader title="Carga de documentos" description="Adjunta documentos de sustento a una solicitud registrada." /><UploadCard title="Documento de sustento" description="Formatos permitidos: PDF, PNG y JPG." accept=".pdf,.png,.jpg,.jpeg" requestId onUpload={(file, id) => appService.uploadDocument(id ?? 0, file)} /></>
}
