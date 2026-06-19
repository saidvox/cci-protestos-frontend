import { useEffect, useState, type FormEvent } from "react"
import { Building2, Plus, UsersRound } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { Analyst, FinancialEntity } from "@/types/domain"

export function AdministrationPage() {
  return (
    <>
      <PageHeader
        title="Administración"
        description="Gestiona las entidades financieras y los analistas del sistema."
      />
      <Tabs defaultValue="entidades">
        <TabsList>
          <TabsTrigger value="entidades">Entidades financieras</TabsTrigger>
          <TabsTrigger value="analistas">Analistas</TabsTrigger>
        </TabsList>
        <TabsContent value="entidades" className="mt-4">
          <EntidadesTab />
        </TabsContent>
        <TabsContent value="analistas" className="mt-4">
          <AnalistasTab />
        </TabsContent>
      </Tabs>
    </>
  )
}

/* ── Entidades ── */
function EntidadesTab() {
  const [items, setItems] = useState<FinancialEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    appService
      .getEntities()
      .then(setItems)
      .catch(() => toast.error("No fue posible cargar las entidades."))
      .finally(() => setLoading(false))
  }, [])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const item = await appService.createEntity({
        ruc: String(form.get("ruc")),
        name: String(form.get("name")),
        contact: String(form.get("contact")),
        email: String(form.get("email")),
      })
      setItems((current) => [...current, item])
      setOpen(false)
      toast.success("Entidad registrada.")
    } catch {
      toast.error("No fue posible registrar la entidad.")
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-5" />
          </div>
          <CardTitle>Directorio institucional</CardTitle>
          <CardDescription>{items.length} entidades registradas.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="btn-nueva-entidad">
              <Plus data-icon="inline-start" />
              Nueva entidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar entidad</DialogTitle>
              <DialogDescription>Completa los datos institucionales de demostración.</DialogDescription>
            </DialogHeader>
            <form id="entity-form" onSubmit={create}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ruc">RUC</FieldLabel>
                  <Input id="ruc" name="ruc" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="entity-name">Razón social</FieldLabel>
                  <Input id="entity-name" name="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contact">Persona de contacto</FieldLabel>
                  <Input id="contact" name="contact" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="entity-email">Correo</FieldLabel>
                  <Input id="entity-email" name="email" type="email" required />
                </Field>
              </FieldGroup>
            </form>
            <DialogFooter>
              <Button form="entity-form" type="submit">
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RUC</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.ruc}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.contact}</TableCell>
                    <TableCell>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Analistas ── */
function AnalistasTab() {
  const [items, setItems] = useState<Analyst[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    appService.getAnalysts().then(setItems).catch(() => toast.error("No fue posible cargar los analistas."))
  }, [])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const item = await appService.createAnalyst({
        code: String(form.get("code")),
        name: String(form.get("name")),
        email: String(form.get("email")),
      })
      setItems((current) => [...current, item])
      setOpen(false)
      toast.success("Analista registrado.")
    } catch {
      toast.error("No fue posible registrar el analista.")
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <UsersRound className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Analistas del sistema</p>
            <p className="text-sm text-muted-foreground">{items.length} usuarios registrados</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="btn-nuevo-analista">
              <Plus data-icon="inline-start" />
              Nuevo analista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar analista</DialogTitle>
              <DialogDescription>Se creará un perfil de demostración.</DialogDescription>
            </DialogHeader>
            <form id="analyst-form" onSubmit={create}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="analyst-code">Código</FieldLabel>
                  <Input id="analyst-code" name="code" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="analyst-name">Nombre completo</FieldLabel>
                  <Input id="analyst-name" name="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="analyst-email">Correo</FieldLabel>
                  <Input id="analyst-email" name="email" type="email" required />
                </Field>
              </FieldGroup>
            </form>
            <DialogFooter>
              <Button form="analyst-form" type="submit">
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div className="flex gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <UsersRound />
                </span>
                <div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription>{item.email}</CardDescription>
                </div>
              </div>
              <Badge variant={item.active ? "default" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.assigned} solicitudes asignadas</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
