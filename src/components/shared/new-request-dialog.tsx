import { useEffect, useState, type FormEvent } from "react"
import { CheckCircle2, Plus, Send } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { appService } from "@/services/service-factory"
import type { Currency, FinancialEntity, RequestType } from "@/types/domain"

const typeLabels: Record<RequestType, string> = {
  REGISTRO_PROTESTO: "Registro de protesto",
  REGULARIZACION: "Regularización",
  RECTIFICACION: "Rectificación",
}

interface NewRequestDialogProps {
  onCreated?: (code: string) => void
}

export function NewRequestDialog({ onCreated }: NewRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RequestType>("REGISTRO_PROTESTO")
  const [entityId, setEntityId] = useState("")
  const [entities, setEntities] = useState<FinancialEntity[]>([])
  const [reason, setReason] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("PEN")
  const [created, setCreated] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      appService
        .getEntities()
        .then((items) => {
          setEntities(items)
          setEntityId(String(items[0]?.id ?? ""))
        })
        .catch(() => toast.error("No fue posible cargar las entidades."))
    }
  }, [open])

  function reset() {
    setType("REGISTRO_PROTESTO")
    setReason("")
    setDocumentNumber("")
    setAmount("")
    setCurrency("PEN")
    setCreated("")
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = Number(amount)
    if (
      !entityId ||
      !documentNumber.trim() ||
      documentNumber.length > 20 ||
      !Number.isFinite(parsed) ||
      parsed <= 0 ||
      !reason.trim()
    )
      return
    setLoading(true)
    try {
      const result = await appService.createRequest({
        type,
        entityId: Number(entityId),
        documentNumber: documentNumber.trim(),
        amount: parsed,
        currency,
        reason: reason.trim(),
      })
      setCreated(result.code)
      toast.success(`Solicitud ${result.code} registrada correctamente.`)
      onCreated?.(result.code)
    } catch {
      toast.error("No fue posible registrar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button id="btn-nueva-solicitud">
          <Plus data-icon="inline-start" />
          Nueva solicitud
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registro de solicitud</DialogTitle>
          <DialogDescription>Completa los campos para iniciar un trámite de protesto.</DialogDescription>
        </DialogHeader>

        {created ? (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>Solicitud registrada</AlertTitle>
            <AlertDescription>
              El código de seguimiento es <strong>{created}</strong>.
            </AlertDescription>
          </Alert>
        ) : (
          <form id="new-request-form" onSubmit={submit}>
            <FieldGroup>
              <div className="grid gap-5 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dlg-type">Tipo de trámite</FieldLabel>
                  <Select value={type} onValueChange={(value) => setType(value as RequestType)}>
                    <SelectTrigger id="dlg-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="dlg-entity">Entidad financiera</FieldLabel>
                  <Select value={entityId} onValueChange={setEntityId}>
                    <SelectTrigger id="dlg-entity">
                      <SelectValue placeholder="Selecciona una entidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={String(entity.id)}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="dlg-document">Documento del deudor</FieldLabel>
                  <Input
                    id="dlg-document"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    maxLength={20}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dlg-amount">Monto</FieldLabel>
                  <Input
                    id="dlg-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dlg-currency">Moneda</FieldLabel>
                  <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                    <SelectTrigger id="dlg-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="PEN">PEN</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="dlg-reason">Motivo</FieldLabel>
                <Textarea
                  id="dlg-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <FieldDescription>No incluyas información sensible en el entorno académico.</FieldDescription>
              </Field>
            </FieldGroup>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button form="new-request-form" type="submit" disabled={loading || !entityId}>
                <Send data-icon="inline-start" />
                {loading ? "Registrando..." : "Registrar solicitud"}
              </Button>
            </div>
          </form>
        )}

        {created && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={reset}>
              Registrar otra
            </Button>
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
