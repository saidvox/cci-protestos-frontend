import { useEffect, useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { FinancialEntity } from "@/types/domain"

export function EntitiesPage() {
  const [items, setItems] = useState<FinancialEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  useEffect(() => { appService.getEntities().then(setItems).catch(() => toast.error("No fue posible cargar las entidades.")).finally(() => setLoading(false)) }, [])
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    try { const item = await appService.createEntity({ ruc: String(form.get("ruc")), name: String(form.get("name")), contact: String(form.get("contact")), email: String(form.get("email")) })
    setItems((current) => [...current, item]); setOpen(false); toast.success("Entidad registrada.") } catch { toast.error("No fue posible registrar la entidad.") }
  }
  return <>
    <PageHeader title="Entidades financieras" description="Administra las instituciones que reportan protestos." actions={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus data-icon="inline-start" />Nueva entidad</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Registrar entidad</DialogTitle><DialogDescription>Completa los datos institucionales de demostración.</DialogDescription></DialogHeader><form id="entity-form" onSubmit={create}><FieldGroup><Field><FieldLabel htmlFor="ruc">RUC</FieldLabel><Input id="ruc" name="ruc" required /></Field><Field><FieldLabel htmlFor="entity-name">Razón social</FieldLabel><Input id="entity-name" name="name" required /></Field><Field><FieldLabel htmlFor="contact">Persona de contacto</FieldLabel><Input id="contact" name="contact" required /></Field><Field><FieldLabel htmlFor="entity-email">Correo</FieldLabel><Input id="entity-email" name="email" type="email" required /></Field></FieldGroup></form><DialogFooter><Button form="entity-form" type="submit">Registrar</Button></DialogFooter></DialogContent></Dialog>} />
    <Card><CardHeader><CardTitle>Directorio institucional</CardTitle><CardDescription>{items.length} entidades registradas.</CardDescription></CardHeader><CardContent>{loading ? <Skeleton className="h-48 w-full" /> : <Table><TableHeader><TableRow><TableHead>RUC</TableHead><TableHead>Entidad</TableHead><TableHead>Contacto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.id}><TableCell>{item.ruc}</TableCell><TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.contact}</TableCell><TableCell><Badge variant={item.active ? "default" : "secondary"}>{item.active ? "Activa" : "Inactiva"}</Badge></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
  </>
}
