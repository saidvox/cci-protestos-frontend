import { useEffect, useState } from "react"
import { Check, Eye, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { appService } from "@/services/service-factory"
import type { RequestRecord, RequestStatus } from "@/types/domain"

export function ReviewPage() {
  const [items, setItems] = useState<RequestRecord[]>([])
  const [selected, setSelected] = useState<RequestRecord | null>(null)
  const [observation, setObservation] = useState("")
  useEffect(() => { appService.getRequests().then((page) => setItems(page.content)).catch(() => toast.error("No fue posible cargar la bandeja.")) }, [])
  async function change(status: RequestStatus) {
    if (!selected) return
    try { const updated = await appService.updateRequestStatus(selected.id, status, observation)
    setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected(null); setObservation(""); toast.success("Estado actualizado.") } catch { toast.error("No fue posible actualizar el estado.") }
  }
  return <>
    <PageHeader title="Revisión de solicitudes" description="Evalúa documentos y actualiza el estado del trámite." />
    <Card><CardHeader><CardTitle>Bandeja de revisión</CardTitle><CardDescription>Solicitudes pendientes y observadas.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Entidad</TableHead><TableHead>Tipo</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>{items.filter((item) => ["REGISTRADA", "EN_REVISION", "OBSERVADA"].includes(item.status)).map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.code}</TableCell><TableCell>{item.financialEntity}</TableCell><TableCell>{item.type}</TableCell><TableCell><StatusBadge status={item.status} /></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => { setSelected(item); setObservation(item.observation ?? "") }}><Eye data-icon="inline-start" />Revisar</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}><DialogContent><DialogHeader><DialogTitle>Revisar {selected?.code}</DialogTitle><DialogDescription>{selected?.type} · {selected?.financialEntity}</DialogDescription></DialogHeader><Field><FieldLabel htmlFor="observation">Observación</FieldLabel><Textarea id="observation" value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Añade una observación si corresponde." /></Field><DialogFooter className="flex-wrap"><Button variant="destructive" onClick={() => change("RECHAZADA")}><X data-icon="inline-start" />Rechazar</Button><Button variant="outline" onClick={() => change("OBSERVADA")}>Observar</Button><Button onClick={() => change("APROBADA")}><Check data-icon="inline-start" />Aprobar</Button></DialogFooter></DialogContent></Dialog>
  </>
}
