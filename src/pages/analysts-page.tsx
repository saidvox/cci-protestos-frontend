import { useEffect, useState, type FormEvent } from "react"
import { Plus, UsersRound } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { Analyst } from "@/types/domain"

export function AnalystsPage() {
  const [items, setItems] = useState<Analyst[]>([])
  const [open, setOpen] = useState(false)
  useEffect(() => { appService.getAnalysts().then(setItems).catch(() => toast.error("No fue posible cargar los analistas.")) }, [])
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const item = await appService.createAnalyst({ code: String(form.get("code")), name: String(form.get("name")), email: String(form.get("email")) }); setItems((current) => [...current, item]); setOpen(false); toast.success("Analista registrado.") } catch { toast.error("No fue posible registrar el analista.") } }
  return <>
    <PageHeader title="Gestión de analistas" description="Administra usuarios responsables de la revisión." actions={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus data-icon="inline-start" />Nuevo analista</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Registrar analista</DialogTitle><DialogDescription>Se creará un perfil de demostración.</DialogDescription></DialogHeader><form id="analyst-form" onSubmit={create}><FieldGroup><Field><FieldLabel htmlFor="analyst-code">Código</FieldLabel><Input id="analyst-code" name="code" required /></Field><Field><FieldLabel htmlFor="analyst-name">Nombre completo</FieldLabel><Input id="analyst-name" name="name" required /></Field><Field><FieldLabel htmlFor="analyst-email">Correo</FieldLabel><Input id="analyst-email" name="email" type="email" required /></Field></FieldGroup></form><DialogFooter><Button form="analyst-form" type="submit">Registrar</Button></DialogFooter></DialogContent></Dialog>} />
    <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <Card key={item.id}><CardHeader className="flex-row items-start justify-between"><div className="flex gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-muted"><UsersRound /></span><div><CardTitle>{item.name}</CardTitle><CardDescription>{item.email}</CardDescription></div></div><Badge variant={item.active ? "default" : "secondary"}>{item.active ? "Activo" : "Inactivo"}</Badge></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.assigned} solicitudes asignadas</p></CardContent></Card>)}</div>
  </>
}
