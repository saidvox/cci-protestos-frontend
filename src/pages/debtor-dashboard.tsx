import { useEffect, useState } from "react"
import { CheckCircle2, FileText, Loader2, RefreshCw, Send, ShieldAlert, ShieldCheck, Download } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAuth } from "@/contexts/auth-context"
import { appService } from "@/services/service-factory"
import type { FinancialEntity, Protest, RequestRecord } from "@/types/domain"

export function DebtorDashboard() {
  const { session } = useAuth()
  const user = session?.user

  const downloadMockPDF = (filename: string, docTitle: string) => {
    const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 150 >>\nstream\nBT\n/F1 16 Tf\n50 780 Td\n(CAMARA DE COMERCIO DE ICA) Tj\n/F1 12 Tf\n0 -30 Td\n(${docTitle}) Tj\n0 -30 Td\n(Este documento es un formato oficial de simulacion para el levantamiento de protestos.) Tj\n0 -20 Td\n(Complete los datos del deudor y firme el documento antes de cargarlo.) Tj\n0 -30 Td\n(Fecha de descarga: ${new Date().toLocaleDateString()}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000062 00000 n \n0000000121 00000 n \n0000000281 00000 n \n0000000378 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n579\n%%EOF`;
    const blob = new Blob([pdfContent], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Descargando plantilla: ${filename}`)
  }

  // State
  const [protests, setProtests] = useState<Protest[]>([])
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [entities, setEntities] = useState<FinancialEntity[]>([])
  
  const [loadingProtests, setLoadingProtests] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingEntities, setLoadingEntities] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [selectedEntityId, setSelectedEntityId] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<"PEN" | "USD">("PEN")
  const [reason, setReason] = useState("")
  const [fileSelected, setFileSelected] = useState<File | null>(null)

  // Load Data
  useEffect(() => {
    if (user?.numeroDocumento) {
      // 1. Get protests
      appService.getProtests({ documento: user.numeroDocumento })
        .then((data) => {
          setProtests(data)
        })
        .catch(() => {
          toast.error("No se pudo cargar la lista de deudas.")
        })
        .finally(() => {
          setLoadingProtests(false)
        })

      // 2. Get requests
      appService.getRequests({ mine: true, page: 0, size: 50 })
        .then((data) => {
          // If we are in mock mode, filter requests that match this user's document
          // or just show all of them if they are returned
          setRequests(data.content)
        })
        .catch(() => {
          toast.error("No se pudo cargar el historial de trámites.")
        })
        .finally(() => {
          setLoadingRequests(false)
        })
    }
  }, [user])

  // Load Entities
  useEffect(() => {
    appService.getEntities()
      .then((data) => {
        setEntities(data.filter(e => e.active))
      })
      .catch(() => {
        toast.error("No se pudieron cargar las entidades financieras.")
      })
      .finally(() => {
        setLoadingEntities(false)
      })
  }, [])

  const activeProtests = protests.filter((p) => p.status === "VIGENTE")
  const totalDebtPEN = activeProtests.reduce((sum, p) => sum + p.amount, 0)

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEntityId) {
      toast.error("Seleccione una entidad financiera.")
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

    setSubmitting(true)
    try {
      // Create request
      const newRequest = await appService.createRequest({
        type: "REGULARIZACION",
        entityId: Number(selectedEntityId),
        documentNumber: user?.numeroDocumento ?? "",
        amount: Number(amount),
        currency: currency,
        reason: reason.trim()
      })

      // Simulate document upload if a file was selected
      if (fileSelected) {
        await appService.uploadDocument(newRequest.id, fileSelected)
      }

      toast.success("Solicitud de levantamiento enviada con éxito.")
      
      // Update requests list locally in state so the table immediately updates dynamically
      setRequests((prev) => [newRequest, ...prev])
      
      // Reset form
      setSelectedEntityId("")
      setAmount("")
      setReason("")
      setFileSelected(null)
      // Reset input element
      const fileInput = document.getElementById("proof-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar la solicitud.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Header Area */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-6 mb-8">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Panel del Ciudadano</span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">Mi Estado de Cuenta</h1>
          <p className="text-slate-500 mt-1">Consulte sus protestos y gestione sus trámites de regularización institucional.</p>
        </div>
        <Card className="border border-indigo-100 bg-indigo-50/50 py-2.5 px-4 h-fit max-w-xs self-start md:self-auto">
          <div className="text-xs text-indigo-900 flex flex-col">
            <span className="font-semibold text-slate-500">Documento Asociado</span>
            <span className="font-bold text-sm text-indigo-950 mt-0.5">{user?.tipoDocumento}: {user?.numeroDocumento}</span>
            <span className="text-[11px] text-indigo-700 font-medium truncate mt-0.5">{user?.name}</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Debts List & Request History */}
        <div className="flex flex-col gap-8">
          
          {/* Section 1: Debts Summary & Listing */}
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="size-4.5 text-indigo-600" />
                Protestos Registrados en la CC Ica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingProtests ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activeProtests.length === 0 ? (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-5 text-center flex flex-col items-center gap-3">
                  <CheckCircle2 className="size-10 text-emerald-600 animate-in zoom-in duration-300" />
                  <div className="max-w-md">
                    <h3 className="font-bold text-emerald-950 text-base">Situación Saneada</h3>
                    <p className="text-sm text-emerald-800 mt-1">
                      Felicitaciones. Usted no registra deudas ni protestos vigentes pendientes ante la Cámara de Comercio de Ica.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Warning Box */}
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-950">
                    <ShieldAlert className="size-5 text-red-600" />
                    <AlertTitle className="font-bold">Estado de Deudor Activo</AlertTitle>
                    <AlertDescription className="text-red-900 mt-1">
                      Usted registra <span className="font-bold">{activeProtests.length} protesto(s) vigente(s)</span> por un monto total de <span className="font-bold">S/. {totalDebtPEN.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>. Es necesario regularizar adjuntando las constancias de pago para sanear su historial crediticio.
                    </AlertDescription>
                  </Alert>

                  {/* Protests Table */}
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Entidad Financiera</TableHead>
                          <TableHead>Registrado el</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeProtests.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">#{item.id}</TableCell>
                            <TableCell>{item.financialEntity}</TableCell>
                            <TableCell>{item.registeredAt}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-700 uppercase">
                                Vigente
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-bold text-slate-900">S/. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Request History */}
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw className="size-4.5 text-indigo-600" />
                Mis Solicitudes de Regularización
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingRequests ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No ha iniciado solicitudes de levantamiento. Use el panel derecho para ingresar una.
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Entidad Financiera</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold text-indigo-950">
                            {item.code}
                            {item.observation && (
                              <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-1 font-medium max-w-xs">
                                Observación: {item.observation}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{item.financialEntity}</TableCell>
                          <TableCell className="text-xs font-medium text-slate-500 uppercase">{item.type.replace("_", " ")}</TableCell>
                          <TableCell className="text-slate-500">{item.createdAt}</TableCell>
                          <TableCell><StatusBadge status={item.status} /></TableCell>
                          <TableCell className="text-right font-bold text-slate-900">
                            {item.currency === "PEN" ? "S/." : "$"} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: New Request Form */}
        <div className="flex flex-col gap-6">
          <Card className="border border-indigo-100 shadow-md">
            <CardHeader className="bg-indigo-50/20 border-b border-indigo-100 py-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Send className="size-4 text-indigo-600" />
                Regularizar Protesto
              </CardTitle>
              <CardDescription className="text-xs">
                Sube tu comprobante de pago para solicitar el levantamiento del protesto.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="entity">Entidad Financiera</FieldLabel>
                    <Select value={selectedEntityId} onValueChange={setSelectedEntityId} disabled={loadingEntities}>
                      <SelectTrigger id="entity">
                        <SelectValue placeholder={loadingEntities ? "Cargando..." : "Selecciona una entidad"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {entities.map((ent) => (
                            <SelectItem key={ent.id} value={String(ent.id)}>
                              {ent.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <Field>
                      <FieldLabel htmlFor="currency">Moneda</FieldLabel>
                      <Select value={currency} onValueChange={(val) => setCurrency(val as "PEN" | "USD")}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PEN">S/.</SelectItem>
                          <SelectItem value="USD">$</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="amount">Monto pagado</FieldLabel>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="reason">Motivo / Descripción</FieldLabel>
                    <Textarea
                      id="reason"
                      placeholder="Ej. Pago total efectuado en caja de la entidad financiera..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="min-h-[70px] text-xs"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="proof-file">Comprobante de Pago (PDF / Imagen)</FieldLabel>
                    <Input
                      id="proof-file"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFileSelected(e.target.files?.[0] ?? null)}
                      className="text-xs file:text-xs"
                      required
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer mt-2 text-xs h-9">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Enviar Solicitud
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Formatos descargables obligatorios */}
          <Card className="border border-indigo-100 bg-indigo-50/10 p-5 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider text-left flex items-center gap-2">
              <Download className="size-4 text-indigo-600" />
              Formatos Obligatorios a Rellenar
            </h4>
            <p className="text-[11px] text-slate-500 text-left leading-relaxed">
              Descargue, complete y firme estos documentos antes de subirlos como sustento de pago:
            </p>
            <div className="flex flex-col gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadMockPDF("FUT_Levantamiento_Protesto.pdf", "FORMULARIO UNICO DE TRAMITE (FUT) - SOLICITUD DE LEVANTAMIENTO")}
                className="w-full text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-start gap-2 px-3 h-9"
              >
                <FileText className="size-4 text-red-500 shrink-0" />
                <div className="flex-1 text-left truncate">
                  <span className="block font-medium text-slate-800 text-[11px]">1. Formulario Único (FUT)</span>
                  <span className="text-[9px] text-slate-400 block font-normal -mt-0.5">FUT Oficial · PDF (145 KB)</span>
                </div>
                <Download className="size-3.5 text-slate-400 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadMockPDF("Declaracion_Jurada_Pago_Deuda.pdf", "DECLARACION JURADA DE PAGO TOTAL DE DEUDA")}
                className="w-full text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-start gap-2 px-3 h-9"
              >
                <FileText className="size-4 text-red-500 shrink-0" />
                <div className="flex-1 text-left truncate">
                  <span className="block font-medium text-slate-800 text-[11px]">2. Declaración Jurada</span>
                  <span className="text-[9px] text-slate-400 block font-normal -mt-0.5">Saneamiento · PDF (120 KB)</span>
                </div>
                <Download className="size-3.5 text-slate-400 shrink-0" />
              </Button>
            </div>
          </Card>

          {/* Quick-Help Banner */}
          <Card className="border border-slate-100 bg-slate-50/50 p-4 text-xs flex gap-3 text-slate-600">
            <ShieldCheck className="size-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-left leading-relaxed">
              <span className="font-semibold text-slate-800">Proceso Oficial Seguros</span>
              <p className="mt-0.5">
                Una vez enviada, la solicitud es verificada por la Cámara de Comercio de Ica y luego derivada a la entidad bancaria elegida para su levantamiento en el Registro Nacional de Protestos.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
