import { useEffect, useState, type FormEvent } from "react"
import { CheckCircle2, Send } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { FinancialEntity } from "@/types/domain"

export function NewRequestPage() {
  const [type, setType] = useState("Registro de protesto")
  const [entityId, setEntityId] = useState("")
  const [entities, setEntities] = useState<FinancialEntity[]>([])
  const [detail, setDetail] = useState("")
  const [documentoDeudor, setDocumentoDeudor] = useState("")
  const [montoProtestado, setMontoProtestado] = useState("")
  const [created, setCreated] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    appService.getEntities()
      .then((items) => { setEntities(items); setEntityId((current) => current || String(items[0]?.id ?? "")) })
      .catch(() => toast.error("No fue posible cargar las entidades."))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true)
    try {
      const result = await appService.createRequest({ type, entityId: Number(entityId), detail, documentoDeudor, montoProtestado: Number(montoProtestado) })
      setCreated(result.code); setDetail(""); setDocumentoDeudor(""); setMontoProtestado(""); toast.success("Solicitud registrada correctamente.")
    } catch { toast.error("No fue posible registrar la solicitud.") 
    } finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader title="Registro de solicitud" description="Inicia un trámite para registrar, regularizar o rectificar un protesto." />
      {created ? <Alert><CheckCircle2 /><AlertTitle>Solicitud registrada</AlertTitle><AlertDescription>El código de seguimiento es {created}.</AlertDescription></Alert> : null}
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Datos de la solicitud</CardTitle><CardDescription>Completa la información básica. Podrás adjuntar documentos en el siguiente módulo.</CardDescription></CardHeader>
        <CardContent>
          <form id="request-form" onSubmit={submit}>
            <FieldGroup>
              <div className="grid gap-5 md:grid-cols-2">
                <Field><FieldLabel>Tipo de trámite</FieldLabel><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="Registro de protesto">Registro de protesto</SelectItem><SelectItem value="Regularización">Regularización</SelectItem><SelectItem value="Rectificación">Rectificación</SelectItem></SelectGroup></SelectContent></Select></Field>
                <Field><FieldLabel>Entidad financiera</FieldLabel><Select value={entityId} onValueChange={setEntityId}><SelectTrigger><SelectValue placeholder="Selecciona una entidad" /></SelectTrigger><SelectContent><SelectGroup>{entities.map((entity) => <SelectItem key={entity.id} value={String(entity.id)}>{entity.name}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field><FieldLabel htmlFor="document">Documento del deudor</FieldLabel><Input id="document" value={documentoDeudor} onChange={(event) => setDocumentoDeudor(event.target.value)} placeholder="RUC o DNI" required /></Field>
                <Field><FieldLabel htmlFor="amount">Monto protestado</FieldLabel><Input id="amount" type="number" min="1" step="0.01" value={montoProtestado} onChange={(event) => setMontoProtestado(event.target.value)} placeholder="0.00" required /></Field>
              </div>
              <Field><FieldLabel htmlFor="detail">Detalle</FieldLabel><Textarea id="detail" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Describe brevemente el motivo de la solicitud." required /><FieldDescription>No incluyas información sensible en este entorno académico.</FieldDescription></Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="justify-end"><Button form="request-form" type="submit" disabled={loading || !entityId}><Send data-icon="inline-start" />{loading ? "Registrando..." : "Registrar solicitud"}</Button></CardFooter>
      </Card>
    </>
  )
}
