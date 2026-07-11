import { useEffect, useState } from "react"
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { appService } from "@/shared/services/service-factory"
import type { OfficialDocument } from "@/shared/types/domain"

interface OfficialDocumentPreviewDialogProps {
  document: OfficialDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showDownload?: boolean
}

export function OfficialDocumentPreviewDialog({ document, open, onOpenChange, showDownload = true }: OfficialDocumentPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open || !document) {
      setPreviewUrl(null)
      setLoading(false)
      setError(false)
      return
    }

    let active = true
    let objectUrl: string | null = null
    setLoading(true)
    setError(false)
    setPreviewUrl(null)

    appService
      .previewOfficialDocument(document)
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch(() => {
        if (!active) return
        setError(true)
        toast.error("No se pudo cargar la previsualizacion del documento.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [document, open])

  const title = document?.title ?? "Documento"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-5">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-red-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="truncate">
            {document?.filename ?? "Archivo PDF"}
          </DialogDescription>
        </DialogHeader>

        <div className="h-[68vh] min-h-[420px] bg-slate-100">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 className="size-7 animate-spin text-slate-400" />
              Cargando previsualizacion...
            </div>
          ) : error || !previewUrl ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <FileText className="size-10 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">No se pudo mostrar la previsualizacion</p>
                <p className="mt-1 text-xs text-slate-500">Puedes descargar el archivo para abrirlo en tu lector de PDF.</p>
              </div>
            </div>
          ) : (
            <iframe className="h-full w-full border-0 bg-white" src={previewUrl} title={`Previsualizacion de ${title}`} />
          )}
        </div>

        <DialogFooter className="m-0 rounded-none">
          {previewUrl ? (
            <Button variant="outline" onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}>
              <ExternalLink data-icon="inline-start" />
              Abrir
            </Button>
          ) : null}
          {showDownload ? (
            <Button disabled={!document} onClick={() => { if (document) void appService.downloadOfficialDocument(document) }}>
              <Download data-icon="inline-start" />
              Descargar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
