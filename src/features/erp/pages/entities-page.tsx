import { useEffect, useState, type FormEvent } from "react"
import { Plus, Building2, UsersRound, Search, Edit, Landmark, User } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { PageHeader } from "@/shared/components/shared/page-header"
import { appService } from "@/shared/services/service-factory"
import type { FinancialEntity, Analyst } from "@/shared/types/domain"

export function EntitiesPage() {
  const [entities, setEntities] = useState<FinancialEntity[]>([])
  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [loading, setLoading] = useState(true)

  // Search terms
  const [entitySearch, setEntitySearch] = useState("")
  const [analystSearch, setAnalystSearch] = useState("")

  // Modal open states
  const [openEntityModal, setOpenEntityModal] = useState(false)
  const [openAnalystModal, setOpenAnalystModal] = useState(false)

  // Edit item states
  const [editingEntity, setEditingEntity] = useState<FinancialEntity | null>(null)
  const [editingAnalyst, setEditingAnalyst] = useState<Analyst | null>(null)

  // Load data
  const loadData = async () => {
    setLoading(true)
    try {
      const [entitiesList, analystsList] = await Promise.all([
        appService.getEntities(),
        appService.getAnalysts()
      ])
      setEntities(entitiesList)
      setAnalysts(analystsList)
    } catch {
      toast.error("No fue posible cargar la información.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Create Entity
  async function handleCreateEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const item = await appService.createEntity({
        ruc: String(form.get("ruc")),
        name: String(form.get("name")),
        contact: String(form.get("contact")),
        email: String(form.get("email"))
      })
      setEntities((current) => [...current, item])
      setOpenEntityModal(false)
      toast.success("Entidad registrada correctamente.")
    } catch {
      toast.error("No fue posible registrar la entidad.")
    }
  }

  // Update Entity
  async function handleUpdateEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingEntity) return
    const form = new FormData(event.currentTarget)
    try {
      const updated = await appService.updateEntity(editingEntity.id, {
        ruc: String(form.get("ruc")),
        name: String(form.get("name")),
        contact: String(form.get("contact")),
        email: String(form.get("email")),
        active: form.get("active") === "true"
      })
      setEntities((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditingEntity(null)
      toast.success("Entidad actualizada correctamente.")
    } catch {
      toast.error("No fue posible actualizar la entidad.")
    }
  }

  // Create Analyst
  async function handleCreateAnalyst(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entityId = Number(form.get("entityId"))
    if (!entityId) {
      toast.error("Seleccione una entidad financiera.")
      return
    }
    try {
      const item = await appService.createAnalyst({
        code: String(form.get("code")),
        name: String(form.get("name")),
        email: String(form.get("email")),
        entityId
      })
      setAnalysts((current) => [...current, item])
      setOpenAnalystModal(false)
      toast.success("Analista registrado correctamente.")
    } catch {
      toast.error("No fue posible registrar el analista.")
    }
  }

  // Update Analyst
  async function handleUpdateAnalyst(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingAnalyst) return
    const form = new FormData(event.currentTarget)
    const entityId = Number(form.get("entityId"))
    if (!entityId) {
      toast.error("Seleccione una entidad financiera.")
      return
    }
    try {
      const updated = await appService.updateAnalyst(editingAnalyst.id, {
        code: String(form.get("code")),
        name: String(form.get("name")),
        email: String(form.get("email")),
        entityId,
        active: form.get("active") === "true"
      })
      setAnalysts((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditingAnalyst(null)
      toast.success("Analista actualizado correctamente.")
    } catch {
      toast.error("No fue posible actualizar el analista.")
    }
  }

  // Helper count
  const getAnalystCount = (entityName: string) => {
    return analysts.filter(a => a.entityName === entityName).length
  }

  // Filter lists
  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
    e.ruc.includes(entitySearch) ||
    e.email.toLowerCase().includes(entitySearch.toLowerCase())
  )

  const filteredAnalysts = analysts.filter(a =>
    a.name.toLowerCase().includes(analystSearch.toLowerCase()) ||
    a.code.toLowerCase().includes(analystSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(analystSearch.toLowerCase()) ||
    (a.entityName && a.entityName.toLowerCase().includes(analystSearch.toLowerCase()))
  )

  return (
    <>
      <PageHeader 
        title="Socios Financieros" 
        description="Administración conjunta de entidades afiliadas y sus analistas autorizados."
      />

      <Tabs defaultValue="entities" className="w-full space-y-6" onValueChange={loadData}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="entities" className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs md:text-sm transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-650 data-[state=active]:text-indigo-950 cursor-pointer">
              <Building2 className="size-4" />
              Entidades Financieras
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 bg-slate-200/60 font-semibold">{entities.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="analysts" className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs md:text-sm transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-650 data-[state=active]:text-indigo-950 cursor-pointer">
              <UsersRound className="size-4" />
              Analistas Bancarios
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 bg-slate-200/60 font-semibold">{analysts.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <TabsContent value="entities" className="m-0">
              <Dialog open={openEntityModal} onOpenChange={setOpenEntityModal}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm">
                    <Plus className="mr-1.5 size-4" />Nueva entidad
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateEntity}>
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 font-bold">Registrar entidad</DialogTitle>
                      <DialogDescription className="text-xs">Completa los datos de la nueva entidad financiera afiliada.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="ruc">RUC de la entidad</FieldLabel>
                          <Input id="ruc" name="ruc" placeholder="Ej. 20111111111" required pattern="\\d{11}" maxLength={11} className="text-xs bg-white" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="entity-name">Razón social</FieldLabel>
                          <Input id="entity-name" name="name" required placeholder="Ej. Banco de la Nación" className="text-xs bg-white" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="contact">Persona de contacto</FieldLabel>
                          <Input id="contact" name="contact" required placeholder="Ej. Juan Pérez" className="text-xs bg-white" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="entity-email">Correo institucional</FieldLabel>
                          <Input id="entity-email" name="email" type="email" required placeholder="Ej. contacto@banco.com" className="text-xs bg-white" />
                        </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
                      <Button type="button" variant="outline" onClick={() => setOpenEntityModal(false)}>Cancelar</Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Registrar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="analysts" className="m-0">
              <Dialog open={openAnalystModal} onOpenChange={setOpenAnalystModal}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm">
                    <Plus className="mr-1.5 size-4" />Nuevo analista
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateAnalyst}>
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 font-bold">Registrar analista</DialogTitle>
                      <DialogDescription className="text-xs">Registra un perfil de analista y asócialo a una entidad financiera activa.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="analyst-code">Código interno</FieldLabel>
                          <Input id="analyst-code" name="code" placeholder="Ej. AN-002" required className="text-xs bg-white" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="analyst-name">Nombre completo</FieldLabel>
                          <Input id="analyst-name" name="name" placeholder="Ej. Carlos Ramos" required className="text-xs bg-white" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="analyst-email">Correo electrónico</FieldLabel>
                          <Input id="analyst-email" name="email" type="email" placeholder="Ej. carlos@banco.com" required className="text-xs bg-white" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="analyst-entity">Entidad Financiera</FieldLabel>
                          <select 
                            id="analyst-entity" 
                            name="entityId" 
                            required
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-indigo-500"
                          >
                            <option value="">Selecciona una entidad...</option>
                            {entities.filter(e => e.active).map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
                      <Button type="button" variant="outline" onClick={() => setOpenAnalystModal(false)}>Cancelar</Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Registrar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </div>
        </div>

        {/* Tab 1: Entidades Financieras */}
        <TabsContent value="entities" className="focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar entidad por RUC, nombre..."
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                className="w-full text-xs focus:outline-none bg-transparent"
              />
            </div>

            <Card className="overflow-hidden border-slate-200">
              <CardHeader className="bg-slate-50/50 pb-3 border-b">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">Directorio de Entidades</CardTitle>
                <CardDescription className="text-xs">Lista de instituciones autorizadas para reportar protestos y regularizaciones.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6"><Skeleton className="h-32 w-full" /></div>
                ) : filteredEntities.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs italic">No se encontraron entidades financieras.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                          <TableHead className="font-semibold text-slate-700 text-xs">RUC</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-xs">Razón social</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-xs">Persona de contacto</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-xs">Correo</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-xs">Analistas</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-xs">Estado</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-xs text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntities.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-mono text-xs font-semibold text-slate-800">{item.ruc}</TableCell>
                            <TableCell className="font-semibold text-slate-900 text-xs">{item.name}</TableCell>
                            <TableCell className="text-xs text-slate-650">{item.contact}</TableCell>
                            <TableCell className="text-xs text-slate-500 font-medium">{item.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 border text-slate-750">
                                {getAnalystCount(item.name)} analistas
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.active ? "default" : "secondary"} className={item.active ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "bg-slate-100 border text-slate-500"}>
                                {item.active ? "Activa" : "Inactiva"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                onClick={() => setEditingEntity(item)}
                              >
                                <Edit className="mr-1 size-3" />
                                Editar
                              </Button>
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
        </TabsContent>

        {/* Tab 2: Analistas Bancarios */}
        <TabsContent value="analysts" className="focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar analista por código, nombre, entidad..."
                value={analystSearch}
                onChange={(e) => setAnalystSearch(e.target.value)}
                className="w-full text-xs focus:outline-none bg-transparent"
              />
            </div>

            {loading ? (
              <div className="p-4"><Skeleton className="h-48 w-full" /></div>
            ) : filteredAnalysts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">No se encontraron analistas registrados.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnalysts.map((item) => (
                  <Card key={item.id} className="hover:shadow-sm transition-all duration-200 border-slate-200">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 text-left">
                      <div className="flex gap-2.5 min-w-0">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <User className="size-4.5" />
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-semibold truncate text-slate-900">{item.name}</CardTitle>
                          <CardDescription className="text-[10px] text-slate-450 font-mono font-medium">{item.code}</CardDescription>
                          <CardDescription className="text-xs text-slate-500 mt-0.5 truncate">{item.email}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={item.active ? "default" : "secondary"} className={item.active ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[10px] py-0" : "bg-slate-100 border text-slate-500 text-[10px] py-0"}>
                          {item.active ? "Disponible" : "Inactivo"}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-7 cursor-pointer text-slate-500 hover:bg-slate-100"
                          onClick={() => setEditingAnalyst(item)}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="text-left border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div className="min-w-0 flex-1 mr-2">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Entidad Financiera</span>
                        <span className="text-xs font-semibold text-slate-800 truncate block flex items-center gap-1">
                          <Landmark className="size-3 text-indigo-500 shrink-0" />
                          {item.entityName || "Sin asociación"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                        {item.assigned} asignadas
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO DE EDICIÓN: ENTIDAD */}
      <Dialog open={Boolean(editingEntity)} onOpenChange={(val) => { if (!val) setEditingEntity(null) }}>
        <DialogContent className="sm:max-w-md">
          {editingEntity && (
            <form onSubmit={handleUpdateEntity}>
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-bold">Editar entidad</DialogTitle>
                <DialogDescription className="text-xs">Modifica los datos generales y estado de la entidad financiera.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-ruc">RUC de la entidad</FieldLabel>
                    <Input id="edit-ruc" name="ruc" defaultValue={editingEntity.ruc} required pattern="\\d{11}" maxLength={11} className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-name">Razón social</FieldLabel>
                    <Input id="edit-name" name="name" defaultValue={editingEntity.name} required className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-contact">Persona de contacto</FieldLabel>
                    <Input id="edit-contact" name="contact" defaultValue={editingEntity.contact} required className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-email">Correo institucional</FieldLabel>
                    <Input id="edit-email" name="email" type="email" defaultValue={editingEntity.email} required className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-active">Estado operativo</FieldLabel>
                    <select 
                      id="edit-active" 
                      name="active" 
                      defaultValue={String(editingEntity.active)} 
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      <option value="true">Activa / Recibe trámites</option>
                      <option value="false">Inactiva / Suspendida</option>
                    </select>
                  </Field>
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setEditingEntity(null)}>Cancelar</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Guardar cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE EDICIÓN: ANALISTA */}
      <Dialog open={Boolean(editingAnalyst)} onOpenChange={(val) => { if (!val) setEditingAnalyst(null) }}>
        <DialogContent className="sm:max-w-md">
          {editingAnalyst && (
            <form onSubmit={handleUpdateAnalyst}>
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-bold">Editar analista</DialogTitle>
                <DialogDescription className="text-xs">Modifica los detalles profesionales y disponibilidad del analista.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-code">Código interno</FieldLabel>
                    <Input id="edit-analyst-code" name="code" defaultValue={editingAnalyst.code} required className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-name">Nombre completo</FieldLabel>
                    <Input id="edit-analyst-name" name="name" defaultValue={editingAnalyst.name} required className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-email">Correo electrónico</FieldLabel>
                    <Input id="edit-analyst-email" name="email" type="email" defaultValue={editingAnalyst.email} required className="text-xs bg-white" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-entity">Entidad Financiera</FieldLabel>
                    <select 
                      id="edit-analyst-entity" 
                      name="entityId" 
                      defaultValue={String(entities.find(e => e.name === editingAnalyst.entityName)?.id ?? "")}
                      required
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      <option value="">Selecciona una entidad...</option>
                      {entities.filter(e => e.active || e.name === editingAnalyst.entityName).map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-active">Disponibilidad</FieldLabel>
                    <select 
                      id="edit-analyst-active" 
                      name="active" 
                      defaultValue={String(editingAnalyst.active)} 
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      <option value="true">Disponible / Recibe asignaciones</option>
                      <option value="false">No disponible</option>
                    </select>
                  </Field>
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setEditingAnalyst(null)}>Cancelar</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Guardar cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
