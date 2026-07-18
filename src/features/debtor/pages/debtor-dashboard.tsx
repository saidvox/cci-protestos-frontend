import { type FormEvent, useEffect, useState } from "react"
import { Banknote, CheckCircle2, ClipboardList, Download, Eye, FileText, Loader2, LockKeyhole, Send, ShieldAlert, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Textarea } from "@/shared/components/ui/textarea"
import { OfficialDocumentPreviewDialog } from "@/shared/components/shared/official-document-preview-dialog"
import { StatusBadge } from "@/shared/components/shared/status-badge"
import { useAuth } from "@/features/auth/auth-context"
import { getErrorMessage } from "@/shared/lib/utils"
import { appService } from "@/shared/services/service-factory"
import type { OfficialDocument, Protest, RequestRecord, RequestStatus } from "@/shared/types/domain"

const formatMoney = (amount: number, currency = "PEN") =>
  `${currency === "PEN" ? "S/." : "$"} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

const formatDebtSummary = (items: Protest[]) => {
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.currency] = (acc[item.currency] ?? 0) + item.amount
    return acc
  }, {})
  const parts = Object.entries(totals).map(([currency, amount]) => formatMoney(amount, currency))
  return parts.length ? parts.join(" + ") : formatMoney(0)
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 KB"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const blockingRequestStatuses = new Set<RequestStatus>([
  "REGISTRADA",
  "EN_REVISION_CCI",
  "DERIVADA_ENTIDAD",
  "EN_REVISION_ANALISTA",
  "APROBADA_ENTIDAD",
])

const editableRequestStatuses = new Set<RequestStatus>([
  "OBSERVADA_CCI",
  "OBSERVADA_ENTIDAD",
  "RECHAZADA",
])

function isRelatedRegularizationRequest(request: RequestRecord, protest?: Protest, documentNumber?: string) {
  if (!protest || !documentNumber) return false
  return request.type === "REGULARIZACION"
    && request.documentNumber === documentNumber
    && request.financialEntity === protest.financialEntity
}

export function DebtorDashboard() {
  const { session } = useAuth()
  const user = session?.user

  const [protests, setProtests] = useState<Protest[]>([])
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [officialDocuments, setOfficialDocuments] = useState<OfficialDocument[]>([])
  const [previewDocument, setPreviewDocument] = useState<OfficialDocument | null>(null)

  const [loadingProtests, setLoadingProtests] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingOfficialDocuments, setLoadingOfficialDocuments] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [blockingRequestDocumentCount, setBlockingRequestDocumentCount] = useState<number | null>(null)

  const [selectedProtestId, setSelectedProtestId] = useState("")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [voucherFile, setVoucherFile] = useState<File | null>(null)
  const [officialDocumentFiles, setOfficialDocumentFiles] = useState<Record<number, File | null>>({})
  const [attachmentResetKey, setAttachmentResetKey] = useState(0)

  useEffect(() => {
    if (!user?.numeroDocumento) return

    appService.getProtests({ documento: user.numeroDocumento, estado: "VIGENTE", page: 0, size: 50 })
      .then((data) => setProtests(data.content))
      .catch(() => toast.error("No se pudo cargar la lista de protestos."))
      .finally(() => setLoadingProtests(false))

    appService.getRequests({ mine: true, page: 0, size: 50 })
      .then((data) => setRequests(data.content))
      .catch(() => toast.error("No se pudo cargar el historial de solicitudes."))
      .finally(() => setLoadingRequests(false))
  }, [user])

  useEffect(() => {
    appService.getOfficialDocuments()
      .then(setOfficialDocuments)
      .catch(() => toast.error("No se pudieron cargar los documentos oficiales."))
      .finally(() => setLoadingOfficialDocuments(false))
  }, [])

  const activeProtests = protests.filter((protest) => protest.status === "VIGENTE")
  const selectedProtest = activeProtests.find((protest) => String(protest.id) === selectedProtestId) ?? activeProtests[0]
  const canRegularize = !loadingProtests && activeProtests.length > 0
  const totalDebtLabel = formatDebtSummary(activeProtests)
  const relatedRequests = requests.filter((request) => isRelatedRegularizationRequest(request, selectedProtest, user?.numeroDocumento))
  const blockingRequest = relatedRequests.find((request) => blockingRequestStatuses.has(request.status))
  const editableRequest = relatedRequests.find((request) => editableRequestStatuses.has(request.status))
  const visibleProcessRequest = blockingRequest ?? editableRequest ?? relatedRequests[0]
  const requiredOfficialDocuments = officialDocuments.filter((document) => document.type === "FORMATO_REQUERIDO")
  const guideDocuments = officialDocuments.filter((document) => document.type === "GUIA")
  const recoverableRequest = blockingRequest?.status === "REGISTRADA" && blockingRequestDocumentCount === 0

  useEffect(() => {
    if (!blockingRequest) {
      setBlockingRequestDocumentCount(null)
      return
    }
    let active = true
    setBlockingRequestDocumentCount(null)
    appService.getRequestDocuments(blockingRequest.id)
      .then((documents) => { if (active) setBlockingRequestDocumentCount(documents.length) })
      .catch(() => { if (active) toast.error("No se pudieron verificar los documentos de la solicitud.") })
    return () => { active = false }
  }, [blockingRequest])

  useEffect(() => {
    if (!selectedProtestId && activeProtests.length > 0) {
      setSelectedProtestId(String(activeProtests[0].id))
    }
  }, [activeProtests, selectedProtestId])

  useEffect(() => {
    if (!editableRequest) return
    if (!amount) setAmount(String(editableRequest.amount))
    if (!reason) setReason(editableRequest.reason)
  }, [editableRequest, amount, reason])

  useEffect(() => {
    if (!recoverableRequest || !blockingRequest) return
    if (!amount) setAmount(String(blockingRequest.amount))
    if (!reason) setReason(blockingRequest.reason)
  }, [recoverableRequest, blockingRequest, amount, reason])

  async function handleCreateRequest(event: FormEvent) {
    event.preventDefault()
    if (!canRegularize) {
      toast.info("No registra protestos vigentes para regularizar.")
      return
    }
    if (!selectedProtest) {
      toast.error("Seleccione el protesto a regularizar.")
      return
    }
    if (blockingRequest && !recoverableRequest) {
      toast.info(`Ya existe una solicitud en trámite: ${blockingRequest.code}.`)
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Ingrese un monto válido mayor a cero.")
      return
    }
    if (!reason.trim()) {
      toast.error("Ingrese el motivo o descripción del trámite.")
      return
    }

    if (!voucherFile) {
      toast.error("Adjunte el voucher o comprobante de pago.")
      return
    }
    const missingOfficialDocument = requiredOfficialDocuments.find((document) => !officialDocumentFiles[document.id])
    if (missingOfficialDocument) {
      toast.error(`Adjunte el formato completado: ${missingOfficialDocument.title}`)
      return
    }

    setSubmitting(true)
    try {
      const filesToUpload = [
        voucherFile,
        ...requiredOfficialDocuments
          .map((document) => officialDocumentFiles[document.id])
          .filter((file): file is File => Boolean(file)),
      ]

      if (recoverableRequest && blockingRequest) {
        await appService.uploadDocuments(blockingRequest.id, filesToUpload)
        setBlockingRequestDocumentCount(filesToUpload.length)
        toast.success("Documentos adjuntados correctamente a la solicitud existente.")
      } else {
        const newRequest = await appService.createRequest({
          type: "REGULARIZACION",
          entityId: selectedProtest.financialEntityId,
          documentNumber: user?.numeroDocumento ?? "",
          amount: Number(amount),
          currency: selectedProtest.currency,
          reason: reason.trim(),
        }, filesToUpload)
        toast.success("Solicitud de levantamiento enviada con éxito.")
        setRequests((current) => [newRequest, ...current])
      }
      setSelectedProtestId("")
      setAmount("")
      setReason("")
      setVoucherFile(null)
      setOfficialDocumentFiles({})
      setAttachmentResetKey((current) => current + 1)
    } catch (error) {
      toast.error(getErrorMessage(error, "Error al enviar la solicitud."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <section className="mb-4 grid gap-4 sm:grid-cols-3">
          <SummaryTile icon={<FileText className="size-5" />} label="Protestos vigentes" value={loadingProtests ? "..." : String(activeProtests.length)} tone={canRegularize ? "danger" : "success"} />
          <SummaryTile icon={<Banknote className="size-5" />} label="Monto pendiente" value={loadingProtests ? "..." : totalDebtLabel} tone={canRegularize ? "danger" : "neutral"} />
          <SummaryTile icon={<ClipboardList className="size-5" />} label="Solicitudes enviadas" value={loadingRequests ? "..." : String(requests.length)} tone="neutral" />
        </section>

        {canRegularize ? <DebtNotice count={activeProtests.length} totalDebtLabel={totalDebtLabel} /> : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
          <div className="space-y-4">
            <ProtestDetailCard loading={loadingProtests} activeProtests={activeProtests} totalDebtLabel={totalDebtLabel} />
            <RequestsCard loading={loadingRequests} requests={requests} canRegularize={canRegularize} />
            <ProcessNote request={visibleProcessRequest} />
          </div>

          <aside className="min-w-0">
            <RegularizationCard
              canRegularize={canRegularize}
              loadingProtests={loadingProtests}
              activeProtests={activeProtests}
              selectedProtest={selectedProtest}
              selectedProtestId={selectedProtestId}
              setSelectedProtestId={setSelectedProtestId}
              amount={amount}
              setAmount={setAmount}
              reason={reason}
              setReason={setReason}
              voucherFile={voucherFile}
              setVoucherFile={setVoucherFile}
              officialDocumentFiles={officialDocumentFiles}
              setOfficialDocumentFile={(documentId, file) => setOfficialDocumentFiles((current) => ({ ...current, [documentId]: file }))}
              resetKey={attachmentResetKey}
              loadingOfficialDocuments={loadingOfficialDocuments}
              officialDocuments={requiredOfficialDocuments}
              guideDocuments={guideDocuments}
              onPreviewDocument={setPreviewDocument}
              blockingRequest={blockingRequest}
              recoveringDocuments={recoverableRequest}
              editableRequest={editableRequest}
              submitting={submitting}
              onSubmit={handleCreateRequest}
            />
          </aside>
        </div>
      </main>

      <OfficialDocumentPreviewDialog document={previewDocument} open={Boolean(previewDocument)} onOpenChange={(open) => { if (!open) setPreviewDocument(null) }} showDownload={previewDocument?.type !== "GUIA"} />
    </>
  )
}

function SummaryTile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "danger" | "success" | "neutral" }) {
  const toneClass = {
    danger: "border-red-100 bg-red-50 text-red-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    neutral: "border-slate-200 bg-white text-slate-700",
  }[tone]

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex size-8 items-center justify-center rounded-md border ${toneClass}`}>{icon}</span>
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-0.5 text-lg font-bold leading-tight text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  )
}

function DebtNotice({ count, totalDebtLabel }: { count: number; totalDebtLabel: string }) {
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-950 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-600">
          <ShieldAlert className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Tienes {count} protesto pendiente de regularización por {totalDebtLabel}.</p>
          <p className="mt-0.5 text-xs text-red-800">Completa el formulario y adjunta todos los documentos requeridos para enviar tu solicitud.</p>
        </div>
      </div>
    </div>
  )
}

function ProtestDetailCard({ loading, activeProtests, totalDebtLabel }: { loading: boolean; activeProtests: Protest[]; totalDebtLabel: string }) {
  const protest = activeProtests[0]

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-white px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
          <FileText className="size-4 text-indigo-600" />
          Detalle del protesto
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : activeProtests.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600">
                <CheckCircle2 className="size-7" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-emerald-950">No registra protestos vigentes</h2>
                <p className="mt-1 text-sm text-emerald-800">
                  El formulario de regularización queda bloqueado porque no existe una deuda pendiente para levantar.
                </p>
              </div>
            </div>
          </div>
        ) : protest ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <DetailItem label="Registro" value={`#${protest.id}`} />
              <DetailItem label="Entidad financiera" value={protest.financialEntity} wide />
              <DetailItem label="Fecha" value={protest.registeredAt} />
              <DetailItem label="Estado" value="Vigente" badge />
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Monto pendiente</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{totalDebtLabel}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DetailItem({ label, value, wide, badge }: { label: string; value: string; wide?: boolean; badge?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      {badge ? (
        <span className="mt-2 inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{value}</span>
      ) : (
        <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
      )}
    </div>
  )
}

function RequestsCard({ loading, requests, canRegularize }: { loading: boolean; requests: RequestRecord[]; canRegularize: boolean }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/70 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
          <ClipboardList className="size-4 text-indigo-600" />
          Mis solicitudes
        </CardTitle>
        <CardDescription className="text-xs">Seguimiento de solicitudes enviadas a la CÃ¡mara de Comercio de Ica.</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-5 text-center">
            <ClipboardList className="mx-auto size-7 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-800">AÃºn no hay solicitudes</p>
            <p className="mt-1 text-xs text-slate-500">
              {canRegularize ? "Use el panel lateral para iniciar una regularizaciÃ³n." : "Cuando registre protestos vigentes, podrÃ¡ iniciar una regularizaciÃ³n."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-indigo-950">{item.code}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.financialEntity} Â· {item.type.replaceAll("_", " ")}</p>
                    {item.observation ? (
                      <p className="mt-2 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        ObservaciÃ³n: {item.observation}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <StatusBadge status={item.status} />
                    <p className="text-sm font-bold text-slate-950">{formatMoney(item.amount, item.currency)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RegularizationCard({
  canRegularize,
  loadingProtests,
  activeProtests,
  selectedProtest,
  selectedProtestId,
  setSelectedProtestId,
  amount,
  setAmount,
  reason,
  setReason,
  voucherFile,
  setVoucherFile,
  officialDocumentFiles,
  setOfficialDocumentFile,
  resetKey,
  loadingOfficialDocuments,
  officialDocuments,
  guideDocuments,
  onPreviewDocument,
  blockingRequest,
  recoveringDocuments,
  editableRequest,
  submitting,
  onSubmit,
}: {
  canRegularize: boolean
  loadingProtests: boolean
  activeProtests: Protest[]
  selectedProtest?: Protest
  selectedProtestId: string
  setSelectedProtestId: (value: string) => void
  amount: string
  setAmount: (value: string) => void
  reason: string
  setReason: (value: string) => void
  voucherFile: File | null
  setVoucherFile: (value: File | null) => void
  officialDocumentFiles: Record<number, File | null>
  setOfficialDocumentFile: (documentId: number, file: File | null) => void
  resetKey: number
  loadingOfficialDocuments: boolean
  officialDocuments: OfficialDocument[]
  guideDocuments: OfficialDocument[]
  onPreviewDocument: (document: OfficialDocument) => void
  blockingRequest?: RequestRecord
  recoveringDocuments: boolean
  editableRequest?: RequestRecord
  submitting: boolean
  onSubmit: (event: FormEvent) => void
}) {
  const disabled = !canRegularize || submitting || Boolean(blockingRequest && !recoveringDocuments)
  const requiredAttachments = 1 + officialDocuments.length
  const uploadedAttachments = (voucherFile ? 1 : 0) + officialDocuments.filter((document) => officialDocumentFiles[document.id]).length

  return (
    <Card className={canRegularize ? "min-w-0 border-slate-200 shadow-sm" : "min-w-0 border-slate-200 bg-slate-50 shadow-sm"}>
      <CardHeader className="border-b bg-white px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
          {canRegularize ? <Send className="size-4 text-indigo-600" /> : <LockKeyhole className="size-4 text-slate-500" />}
          Regularizar protesto
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {!canRegularize ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="flex gap-3">
              {loadingProtests ? <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-slate-400" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />}
              <div>
                <p className="font-semibold text-slate-900">{loadingProtests ? "Verificando estado" : "Sin deuda pendiente"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {loadingProtests ? "El sistema está consultando sus protestos vigentes." : "No puede crear una solicitud de levantamiento si no hay un protesto activo asociado a su documento."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {blockingRequest ? (
          <div className={`mb-4 rounded-lg border p-4 text-sm ${recoveringDocuments ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
            <div className="flex gap-3">
              {recoveringDocuments ? <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />}
              <div>
                <p className="font-semibold">{recoveringDocuments ? "Documentos pendientes" : "Solicitud enviada"}</p>
                <p className={`mt-1 text-xs ${recoveringDocuments ? "text-amber-800" : "text-emerald-800"}`}>
                  {recoveringDocuments
                    ? `La solicitud ${blockingRequest.code} fue registrada sin adjuntos. Vuelve a seleccionar el voucher y los formatos para completar el envío.`
                    : `La solicitud ${blockingRequest.code} ya está en trámite. No puedes enviar otra para el mismo protesto hasta que sea observada, rechazada o finalizada.`}
                </p>
              </div>
            </div>
          </div>
        ) : editableRequest ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold">Solicitud editable</p>
                <p className="mt-1 text-xs text-amber-800">
                  La solicitud {editableRequest.code} requiere corrección. Puedes ajustar los datos y volver a enviarla con los documentos actualizados.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <StepHeading number={1} title="Datos del pago" />
            <FieldGroup className="mt-4 gap-3">
              <Field>
                <FieldLabel htmlFor="protest">Protesto seleccionado</FieldLabel>
                <Select value={selectedProtestId} onValueChange={setSelectedProtestId} disabled={disabled || activeProtests.length <= 1}>
                  <SelectTrigger id="protest">
                    <SelectValue placeholder="Seleccione un protesto vigente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {activeProtests.map((protest) => (
                        <SelectItem key={protest.id} value={String(protest.id)}>
                          #{protest.id} - {protest.financialEntity} - {formatMoney(protest.amount, protest.currency)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="currency">Moneda</FieldLabel>
                  <Input id="currency" value={selectedProtest?.currency ?? ""} disabled className="font-semibold" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="amount">Monto pagado</FieldLabel>
                  <Input id="amount" type="number" placeholder={selectedProtest ? String(selectedProtest.amount) : "0.00"} step="0.01" min="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={disabled} required />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="reason">Motivo / descripción</FieldLabel>
                <Textarea id="reason" placeholder="Ej. Pago total efectuado en la entidad financiera." value={reason} onChange={(event) => setReason(event.target.value)} disabled={disabled} required className="min-h-[72px] text-sm" />
              </Field>
            </FieldGroup>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <StepHeading number={2} title="Documentos requeridos" aside={`${uploadedAttachments} de ${requiredAttachments} cargados`} progress={requiredAttachments ? (uploadedAttachments / requiredAttachments) * 100 : 0} />
            <AttachmentsGrid
              disabled={disabled}
              resetKey={resetKey}
              loading={loadingOfficialDocuments}
              voucherFile={voucherFile}
              setVoucherFile={setVoucherFile}
              officialDocuments={officialDocuments}
              guideDocuments={guideDocuments}
              officialDocumentFiles={officialDocumentFiles}
              setOfficialDocumentFile={setOfficialDocumentFile}
              onPreviewDocument={onPreviewDocument}
            />
          </div>

          <Button type="submit" disabled={disabled} className="mt-1 h-11 w-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send data-icon="inline-start" />}
            {submitting ? "Enviando..." : recoveringDocuments ? "Completar documentos" : blockingRequest ? "Solicitud en trámite" : editableRequest ? "Enviar corrección" : "Enviar solicitud"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function StepHeading({ number, title, aside, progress = 0 }: { number: number; title: string; aside?: string; progress?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
        {number}
      </span>
      <p className="font-bold text-slate-950">{title}</p>
      {aside ? (
        <div className="ml-auto min-w-[150px] text-right">
          <p className="text-xs font-semibold text-slate-500">{aside}</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AttachmentsGrid({
  disabled,
  resetKey,
  loading,
  voucherFile,
  setVoucherFile,
  officialDocuments,
  guideDocuments,
  officialDocumentFiles,
  setOfficialDocumentFile,
  onPreviewDocument,
}: {
  disabled: boolean
  resetKey: number
  loading: boolean
  voucherFile: File | null
  setVoucherFile: (file: File | null) => void
  officialDocuments: OfficialDocument[]
  guideDocuments: OfficialDocument[]
  officialDocumentFiles: Record<number, File | null>
  setOfficialDocumentFile: (documentId: number, file: File | null) => void
  onPreviewDocument: (document: OfficialDocument) => void
}) {
  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mt-3 grid gap-2">
        <FileUploadSlot id="voucher-file" resetKey={resetKey} title="Voucher de pago" description="Comprobante emitido por la entidad financiera." file={voucherFile} required disabled={disabled} accept=".pdf,image/*" onFileChange={setVoucherFile} />

        {guideDocuments.map((document) => (
          <div key={document.id} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
                <FileText className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="min-w-0 truncate text-xs font-bold leading-tight text-slate-900" title={document.title}>{document.title}</p>
                  <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">Guía</span>
                </div>
                <p className="mt-0.5 max-w-full truncate text-[10px] leading-snug text-slate-500" title={document.description || document.filename}>
                  {document.description || document.filename}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-3 text-xs text-slate-700" onClick={() => onPreviewDocument(document)}>
                <Eye data-icon="inline-start" />
                Ver guía
              </Button>
            </div>
          </div>
        ))}

        {loading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : officialDocuments.length === 0 ? (
          <div className="rounded-md border border-dashed border-indigo-200 bg-white p-3 text-xs text-slate-500">
            No hay formatos oficiales publicados para adjuntar.
          </div>
        ) : (
          officialDocuments.map((document) => (
            <FileUploadSlot
              key={document.id}
              id={`official-document-${document.id}`}
              resetKey={resetKey}
              title={document.title}
              description={`${document.filename} - ${formatBytes(document.sizeBytes)}`}
              file={officialDocumentFiles[document.id] ?? null}
              required
              disabled={disabled}
              accept=".pdf,image/*"
              onFileChange={(file) => setOfficialDocumentFile(document.id, file)}
              actions={
                <>
                  <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs text-indigo-700" onClick={() => onPreviewDocument(document)}>
                    <Eye data-icon="inline-start" />
                    Ver
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs text-indigo-700" onClick={() => void appService.downloadOfficialDocument(document)}>
                    <Download data-icon="inline-start" />
                    Descargar
                  </Button>
                </>
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

function FileUploadSlot({
  id,
  resetKey,
  title,
  description,
  file,
  required,
  disabled,
  accept,
  actions,
  onFileChange,
}: {
  id: string
  resetKey: number
  title: string
  description: string
  file: File | null
  required?: boolean
  disabled: boolean
  accept: string
  actions?: React.ReactNode
  onFileChange: (file: File | null) => void
}) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-lg border bg-white px-3 py-2 ${file ? "border-emerald-200" : "border-slate-200"}`}>
      <div className="flex min-w-0 items-center gap-2">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${file ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-indigo-100 bg-indigo-50 text-indigo-600"}`}>
          {file ? <CheckCircle2 className="size-3.5" /> : <FileText className="size-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="min-w-0 truncate text-xs font-bold leading-tight text-slate-900" title={title}>{title}</p>
            {required ? <span className="shrink-0 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">Req.</span> : null}
          </div>
          <p className="mt-0.5 max-w-full truncate text-[10px] leading-snug text-slate-500" title={file ? file.name : description}>
            {file ? `${file.name} - ${formatBytes(file.size)}` : description}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
          <Button type="button" variant={file ? "secondary" : "outline"} size="sm" className="h-8 px-3 text-xs text-indigo-700" disabled={disabled} onClick={() => document.getElementById(id)?.click()}>
            <Upload data-icon="inline-start" />
            {file ? "Cambiar" : "Subir"}
          </Button>
          {file ? (
            <Button type="button" variant="ghost" size="icon" className="size-7 text-slate-500" title="Quitar archivo" aria-label={`Quitar archivo de ${title}`} disabled={disabled} onClick={() => onFileChange(null)}>
              <X data-icon="inline-start" />
            </Button>
          ) : null}
        </div>
      </div>
      <Input key={`${id}-${resetKey}-${file?.name ?? "empty"}`} id={id} type="file" accept={accept} disabled={disabled} className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
    </div>
  )
}

export function OfficialDocumentsCard({ loading, documents, onPreview }: { loading: boolean; documents: OfficialDocument[]; onPreview: (document: OfficialDocument) => void }) {
  const visibleDocuments = documents.filter((document) => document.type !== "PLANTILLA_EXCEL")

  return (
    <Card className="border-indigo-100 bg-indigo-50/10 shadow-sm">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-indigo-950">
          <Download className="size-4 text-indigo-600" />
          Formatos oficiales
        </CardTitle>
        <CardDescription className="text-xs">PDFs publicados por la CÃ¡mara para completar su trÃ¡mite.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-5 pt-0">
        {loading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : visibleDocuments.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-center">
            <FileText className="mx-auto size-6 text-slate-400" />
            <p className="mt-2 text-xs font-medium text-slate-500">No hay documentos oficiales publicados.</p>
          </div>
        ) : (
          visibleDocuments.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="break-words text-xs font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.filename} Â· {formatBytes(item.sizeBytes)}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => onPreview(item)} className="h-8 text-xs">
                  <Eye data-icon="inline-start" />
                  Ver
                </Button>
                {item.type === "GUIA" ? null : (
                  <Button variant="outline" size="sm" onClick={() => void appService.downloadOfficialDocument(item)} className="h-8 text-xs">
                    <Download data-icon="inline-start" />
                    Descargar
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

type ProcessStepTone = "done" | "current" | "pending" | "rejected"

function requestStepTone(request: RequestRecord | undefined, index: number): ProcessStepTone {
  if (!request) return "pending"
  const status = request.status
  if (status === "RECHAZADA") return index === 0 ? "done" : "rejected"
  if (status === "OBSERVADA_CCI") return index === 0 ? "done" : index === 1 ? "rejected" : "pending"
  if (status === "OBSERVADA_ENTIDAD") return index <= 1 ? "done" : index === 2 ? "rejected" : "pending"
  if (status === "LEVANTAMIENTO_PROCESADO" || status === "FINALIZADA") return "done"
  if (status === "APROBADA_ENTIDAD") return index <= 2 ? "done" : "current"
  if (status === "DERIVADA_ENTIDAD" || status === "EN_REVISION_ANALISTA") return index <= 1 ? "done" : index === 2 ? "current" : "pending"
  if (status === "EN_REVISION_CCI") return index === 0 ? "done" : index === 1 ? "current" : "pending"
  return index === 0 ? "done" : index === 1 ? "current" : "pending"
}

function processStepDetail(request: RequestRecord | undefined, tone: ProcessStepTone, fallback: string) {
  if (!request) return "Pendiente"
  if (tone === "done") return "Listo"
  if (tone === "current") return fallback
  if (tone === "rejected") return request.status === "RECHAZADA" ? "Rechazada" : "Observada"
  return "Pendiente"
}

function ProcessNote({ request }: { request?: RequestRecord }) {
  const baseSteps = [
    { title: "Solicitud enviada", fallback: "Registrada" },
    { title: "Revisión Cámara", fallback: "En revisión" },
    { title: "Validación entidad financiera", fallback: "En revisión" },
  ]
  const steps = baseSteps.map((step, index) => {
    const tone = requestStepTone(request, index)
    return { ...step, tone, detail: processStepDetail(request, tone, step.fallback) }
  })

  const toneClass: Record<ProcessStepTone, string> = {
    done: "border-emerald-200 bg-emerald-50 text-emerald-950",
    current: "border-amber-200 bg-amber-50 text-amber-950",
    rejected: "border-red-200 bg-red-50 text-red-950",
    pending: "border-slate-100 bg-white text-slate-500",
  }
  const dotClass: Record<ProcessStepTone, string> = {
    done: "bg-emerald-600 text-white",
    current: "bg-amber-500 text-white",
    rejected: "bg-red-600 text-white",
    pending: "bg-slate-100 text-slate-500",
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-white px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
          <ClipboardList className="size-4 text-indigo-600" />
          Proceso de revisión
        </CardTitle>
        {request ? <CardDescription className="text-xs">Seguimiento de {request.code}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className={`relative rounded-lg border p-4 ${toneClass[step.tone]}`}>
              {index < steps.length - 1 ? <span className="absolute left-[calc(100%-2px)] top-7 hidden h-px w-6 border-t border-dashed border-slate-200 sm:block" /> : null}
              <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${dotClass[step.tone]}`}>
                {step.tone === "done" ? <CheckCircle2 className="size-4" /> : step.tone === "rejected" ? <X className="size-4" /> : index + 1}
              </span>
              <p className="mt-3 text-sm font-bold">{step.title}</p>
              <p className="mt-1 text-xs">{step.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
