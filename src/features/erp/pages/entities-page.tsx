import { useEffect, useState, type FormEvent } from "react"
import { Copy, Eye, EyeOff, KeyRound, Link2, RotateCcw } from "lucide-react"
import { Building2, Edit, Landmark, Plus, Power, PowerOff, Search, User, UsersRound } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/shared/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { PageHeader } from "@/shared/components/shared/page-header"
import { appService } from "@/shared/services/service-factory"
import type { Analyst, AnalystInvitation, FinancialEntity } from "@/shared/types/domain"
import { getErrorMessage } from "@/shared/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

export function EntitiesPage() {
  const { session } = useAuth()
  const [entities, setEntities] = useState<FinancialEntity[]>([])
  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [loading, setLoading] = useState(true)
  const [entitySearch, setEntitySearch] = useState("")
  const [analystSearch, setAnalystSearch] = useState("")
  const [openEntityModal, setOpenEntityModal] = useState(false)
  const [openAnalystModal, setOpenAnalystModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState<FinancialEntity | null>(null)
  const [editingAnalyst, setEditingAnalyst] = useState<Analyst | null>(null)
  const [createAnalystEntityId, setCreateAnalystEntityId] = useState("")
  const [editEntityActive, setEditEntityActive] = useState("true")
  const [editAnalystEntityId, setEditAnalystEntityId] = useState("")
  const [editAnalystActive, setEditAnalystActive] = useState("true")
  const [busyEntityId, setBusyEntityId] = useState<number | null>(null)
  const [busyAnalystId, setBusyAnalystId] = useState<number | null>(null)
  const [analystInvitation, setAnalystInvitation] = useState<AnalystInvitation | null>(null)
  const [resettingAnalyst, setResettingAnalyst] = useState<Analyst | null>(null)
  const [reactivatingAnalyst, setReactivatingAnalyst] = useState<Analyst | null>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const isAdmin = session?.user.roles.includes("CCI_ADMIN") ?? false

  const loadData = async () => {
    setLoading(true)
    try {
      const [entitiesList, analystsList] = await Promise.all([
        appService.getEntities(),
        appService.getAnalysts(),
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
    void loadData()
  }, [])

  useEffect(() => {
    if (!editingEntity) return
    setEditEntityActive(String(editingEntity.active))
  }, [editingEntity])

  useEffect(() => {
    if (!editingAnalyst) return
    setEditAnalystActive(String(editingAnalyst.active))
    setEditAnalystEntityId(String(editingAnalyst.entityId ?? entities.find((entity) => entity.name === editingAnalyst.entityName)?.id ?? ""))
  }, [editingAnalyst, entities])

  async function handleCreateEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const item = await appService.createEntity({
        ruc: String(form.get("ruc")).trim(),
        name: String(form.get("name")).trim(),
        contact: String(form.get("contact")).trim(),
        email: String(form.get("email")).trim(),
      })
      setEntities((current) => [...current, item])
      setOpenEntityModal(false)
      toast.success("Entidad registrada correctamente.")
    } catch {
      toast.error("No fue posible registrar la entidad.")
    }
  }

  async function handleUpdateEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingEntity) return
    const form = new FormData(event.currentTarget)
    try {
      const updated = await appService.updateEntity(editingEntity.id, {
        ruc: editingEntity.ruc,
        name: String(form.get("name")).trim(),
        contact: String(form.get("contact")).trim(),
        email: String(form.get("email")).trim(),
        active: editEntityActive === "true",
      })
      setEntities((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditingEntity(null)
      toast.success("Entidad actualizada correctamente.")
    } catch {
      toast.error("No fue posible actualizar la entidad.")
    }
  }

  async function handleToggleEntity(entity: FinancialEntity) {
    setBusyEntityId(entity.id)
    try {
      const updated = await appService.toggleEntityStatus(entity.id, !entity.active)
      setEntities((current) => current.map((item) => item.id === updated.id ? updated : item))
      toast.success(updated.active ? "Entidad habilitada." : "Entidad deshabilitada.")
    } catch {
      toast.error("No fue posible cambiar el estado de la entidad.")
    } finally {
      setBusyEntityId(null)
    }
  }

  async function handleCreateAnalyst(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entityId = Number(createAnalystEntityId)
    if (!entityId) {
      toast.error("Seleccione una entidad financiera.")
      return
    }
    try {
      const invitation = await appService.createAnalyst({
        code: String(form.get("code")).trim(),
        name: String(form.get("name")).trim(),
        email: String(form.get("email")).trim(),
        entityId,
      })
      setAnalysts((current) => [...current, invitation.analyst])
      setCreateAnalystEntityId("")
      setOpenAnalystModal(false)
      setAnalystInvitation(invitation)
      toast.success("Puesto de analista creado. Comparte su enlace de activación.")
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible registrar el analista."))
    }
  }

  async function handleRegenerateInvitation(analyst: Analyst) {
    setBusyAnalystId(analyst.id)
    try {
      const invitation = await appService.regenerateAnalystInvitation(analyst.id)
      setAnalysts((current) => current.map((item) => item.id === analyst.id ? invitation.analyst : item))
      setAnalystInvitation(invitation)
      toast.success("Se generó un nuevo enlace y se revocaron los anteriores.")
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible generar la invitación."))
    } finally {
      setBusyAnalystId(null)
    }
  }

  async function handleRestartActivation() {
    if (!reactivatingAnalyst) return
    setBusyAnalystId(reactivatingAnalyst.id)
    try {
      const invitation = await appService.restartAnalystActivation(reactivatingAnalyst.id)
      setAnalysts((current) => current.map((item) => item.id === reactivatingAnalyst.id ? invitation.analyst : item))
      setReactivatingAnalyst(null)
      setAnalystInvitation(invitation)
      toast.success("Activación reiniciada. El acceso anterior quedó invalidado.")
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible reiniciar la activación."))
    } finally {
      setBusyAnalystId(null)
    }
  }

  async function copyInvitationLink() {
    if (!analystInvitation) return
    try {
      await navigator.clipboard.writeText(buildActivationUrl(analystInvitation.activationToken))
      toast.success("Enlace de activación copiado.")
    } catch {
      toast.error("No fue posible copiar el enlace. Selecciónalo manualmente.")
    }
  }

  async function handleResetAnalystPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resettingAnalyst) return
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    const confirmation = String(form.get("passwordConfirmation"))
    if (!STRONG_PASSWORD.test(password)) {
      toast.error("La contraseña debe incluir mayúscula, minúscula, número y símbolo; mínimo 8 caracteres.")
      return
    }
    if (password !== confirmation) {
      toast.error("Las contraseñas no coinciden.")
      return
    }
    try {
      await appService.resetAnalystPassword(resettingAnalyst.id, password)
      setResettingAnalyst(null)
      setShowResetPassword(false)
      toast.success("Contraseña restablecida. Las sesiones anteriores fueron cerradas.")
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible restablecer la contraseña."))
    }
  }

  async function handleUpdateAnalyst(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingAnalyst) return
    const form = new FormData(event.currentTarget)
    const entityId = Number(editAnalystEntityId)
    if (!entityId) {
      toast.error("Seleccione una entidad financiera.")
      return
    }
    try {
      const updated = await appService.updateAnalyst(editingAnalyst.id, {
        code: String(form.get("code")).trim(),
        name: String(form.get("name")).trim(),
        email: String(form.get("email")).trim(),
        entityId,
        active: editAnalystActive === "true",
      })
      setAnalysts((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditingAnalyst(null)
      toast.success(updated.accessStatus === "PENDING_ACTIVATION" ? "Datos actualizados. Genera un nuevo enlace de activación." : "Analista actualizado correctamente.")
    } catch {
      toast.error("No fue posible actualizar el analista.")
    }
  }

  async function handleToggleAnalyst(analyst: Analyst) {
    setBusyAnalystId(analyst.id)
    try {
      const updated = await appService.toggleAnalystStatus(analyst.id, !analyst.active)
      setAnalysts((current) => current.map((item) => item.id === updated.id ? updated : item))
      toast.success(updated.active ? "Analista habilitado." : "Analista deshabilitado.")
    } catch {
      toast.error("No fue posible cambiar la disponibilidad del analista.")
    } finally {
      setBusyAnalystId(null)
    }
  }

  const getAnalystCount = (entityName: string) => analysts.filter((analyst) => analyst.entityName === entityName).length

  const filteredEntities = entities.filter((entity) => {
    const term = entitySearch.toLowerCase()
    return entity.name.toLowerCase().includes(term) || entity.ruc.includes(entitySearch) || entity.email.toLowerCase().includes(term)
  })

  const filteredAnalysts = analysts.filter((analyst) => {
    const term = analystSearch.toLowerCase()
    return analyst.name.toLowerCase().includes(term)
      || analyst.code.toLowerCase().includes(term)
      || analyst.email.toLowerCase().includes(term)
      || (analyst.entityName?.toLowerCase().includes(term) ?? false)
  })

  return (
    <>
      <PageHeader
        title="Socios Financieros"
        description="Administración conjunta de entidades afiliadas y sus analistas autorizados."
      />

      <Tabs defaultValue="entities" className="w-full space-y-6" onValueChange={() => void loadData()}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex h-auto w-full max-w-none flex-wrap justify-start gap-1 rounded-lg bg-slate-100 p-1 sm:w-auto">
            <TabsTrigger value="entities" className="min-w-fit justify-start gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-600 transition-all focus-visible:outline-none focus-visible:ring-0 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm md:text-sm">
              <Building2 className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Entidades Financieras</span>
              <Badge variant="secondary" className="ml-1 shrink-0 rounded-full bg-slate-200/70 px-1.5 py-0 text-[10px] font-semibold text-slate-700">{entities.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="analysts" className="min-w-fit justify-start gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-600 transition-all focus-visible:outline-none focus-visible:ring-0 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm md:text-sm">
              <UsersRound className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Analistas Bancarios</span>
              <Badge variant="secondary" className="ml-1 shrink-0 rounded-full bg-slate-200/70 px-1.5 py-0 text-[10px] font-semibold text-slate-700">{analysts.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <TabsContent value="entities" className="m-0">
              <Dialog open={openEntityModal} onOpenChange={setOpenEntityModal}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer bg-slate-950 text-xs font-semibold text-white hover:bg-slate-800 md:text-sm">
                    <Plus className="mr-1.5 size-4" />Nueva entidad
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
                  <form onSubmit={handleCreateEntity}>
                    <DialogHeader>
                      <DialogTitle className="font-bold text-slate-900">Registrar entidad</DialogTitle>
                      <DialogDescription className="text-xs">Completa los datos de la nueva entidad financiera afiliada.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="ruc">RUC de la entidad</FieldLabel>
                          <Input id="ruc" name="ruc" placeholder="Ej. 20111111111" required pattern="[0-9]{11}" inputMode="numeric" maxLength={11} className="bg-white text-xs" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="entity-name">Razón social</FieldLabel>
                          <Input id="entity-name" name="name" required placeholder="Ej. Banco de la Nación" className="bg-white text-xs" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="contact">Persona de contacto</FieldLabel>
                          <Input id="contact" name="contact" required placeholder="Ej. Juan Pérez" className="bg-white text-xs" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="entity-email">Correo institucional</FieldLabel>
                          <Input id="entity-email" name="email" type="email" required placeholder="Ej. contacto@banco.com" className="bg-white text-xs" />
                        </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter className="gap-2 border-t pt-3 sm:gap-0">
                      <Button type="button" variant="outline" onClick={() => setOpenEntityModal(false)}>Cancelar</Button>
                      <Button type="submit" className="bg-slate-950 font-semibold text-white hover:bg-slate-800">Registrar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="analysts" className="m-0">
              <Dialog open={openAnalystModal} onOpenChange={(open) => { setOpenAnalystModal(open); if (!open) setCreateAnalystEntityId("") }}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer bg-slate-950 text-xs font-semibold text-white hover:bg-slate-800 md:text-sm">
                    <Plus className="mr-1.5 size-4" />Nuevo analista
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
                  <form onSubmit={handleCreateAnalyst}>
                    <DialogHeader>
                      <DialogTitle className="font-bold text-slate-900">Registrar analista</DialogTitle>
                      <DialogDescription className="text-xs">Crea el puesto y genera un enlace para que el analista defina su propia contraseña.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="analyst-code">Código interno</FieldLabel>
                          <Input id="analyst-code" name="code" placeholder="Ej. AN-002" required className="bg-white text-xs" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="analyst-name">Nombre completo</FieldLabel>
                          <Input id="analyst-name" name="name" placeholder="Ej. Carlos Ramos" required className="bg-white text-xs" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="analyst-email">Correo electrónico</FieldLabel>
                          <Input id="analyst-email" name="email" type="email" placeholder="Ej. carlos@banco.com" required className="bg-white text-xs" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="analyst-entity">Entidad financiera</FieldLabel>
                          <Select value={createAnalystEntityId} onValueChange={setCreateAnalystEntityId} required>
                            <SelectTrigger id="analyst-entity" className="h-9 w-full bg-white text-xs">
                              <SelectValue placeholder="Selecciona una entidad..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {entities.filter((entity) => entity.active).map((entity) => (
                                  <SelectItem key={entity.id} value={String(entity.id)}>{entity.name}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter className="gap-2 border-t pt-3 sm:gap-0">
                      <Button type="button" variant="outline" onClick={() => setOpenAnalystModal(false)}>Cancelar</Button>
                      <Button type="submit" className="bg-slate-950 font-semibold text-white hover:bg-slate-800"><Link2 className="mr-1.5 size-4" />Crear invitación</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="entities" className="focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs sm:w-[380px]">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar entidad por RUC, nombre..."
                value={entitySearch}
                onChange={(event) => setEntitySearch(event.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none"
              />
            </div>

            <Card className="overflow-hidden border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900">Directorio de entidades</CardTitle>
                <CardDescription className="text-xs">Lista de instituciones autorizadas para reportar protestos y regularizaciones.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6"><Skeleton className="h-32 w-full" /></div>
                ) : filteredEntities.length === 0 ? (
                  <div className="py-10 text-center text-xs italic text-slate-400">No se encontraron entidades financieras.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                          <TableHead className="text-xs font-semibold text-slate-700">RUC</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Razón social</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Persona de contacto</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Correo</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Analistas</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Estado</TableHead>
                          <TableHead className="text-right text-xs font-semibold text-slate-700">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntities.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-mono text-xs font-semibold text-slate-800">{item.ruc}</TableCell>
                            <TableCell className="text-xs font-semibold text-slate-900">{item.name}</TableCell>
                            <TableCell className="text-xs text-slate-600">{item.contact}</TableCell>
                            <TableCell className="text-xs font-medium text-slate-500">{item.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="border bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                {getAnalystCount(item.name)} analistas
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.active ? "default" : "secondary"} className={item.active ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "border bg-slate-100 text-slate-500"}>
                                {item.active ? "Activa" : "Inactiva"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  onClick={() => setEditingEntity(item)}
                                >
                                  <Edit className="mr-1 size-3" />
                                  Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={busyEntityId === item.id}
                                  className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  onClick={() => void handleToggleEntity(item)}
                                >
                                  {item.active ? <PowerOff className="mr-1 size-3" /> : <Power className="mr-1 size-3" />}
                                  {item.active ? "Deshabilitar" : "Habilitar"}
                                </Button>
                              </div>
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

        <TabsContent value="analysts" className="focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs sm:w-[420px]">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar analista por código, nombre, entidad..."
                value={analystSearch}
                onChange={(event) => setAnalystSearch(event.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="p-4"><Skeleton className="h-48 w-full" /></div>
            ) : filteredAnalysts.length === 0 ? (
              <div className="py-10 text-center text-xs italic text-slate-400">No se encontraron analistas registrados.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAnalysts.map((item) => (
                  <Card key={item.id} className="border-slate-200 transition-all duration-200 hover:shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 text-left">
                      <div className="flex min-w-0 gap-2.5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                          <User className="size-4.5" />
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-sm font-semibold text-slate-900">{item.name}</CardTitle>
                          <CardDescription className="font-mono text-[10px] font-medium text-slate-500">{item.code}</CardDescription>
                          <CardDescription className="mt-0.5 truncate text-xs text-slate-500">{item.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className={analystStatusClass(item.accessStatus)}>
                        {analystStatusLabel(item.accessStatus)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 border-t border-slate-100 pt-3 text-left">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Entidad financiera</span>
                          <span className="flex items-center gap-1 truncate text-xs font-semibold text-slate-800">
                            <Landmark className="size-3 shrink-0 text-slate-500" />
                            {item.entityName || "Sin asociación"}
                          </span>
                        </div>
                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {item.assigned} asignadas
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        {isAdmin && item.accessStatus === "PENDING_ACTIVATION" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyAnalystId === item.id}
                            className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => void handleRegenerateInvitation(item)}
                          >
                            <Link2 className="mr-1 size-3" />
                            Generar enlace
                          </Button>
                        ) : null}
                        {isAdmin && item.accessStatus !== "PENDING_ACTIVATION" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setResettingAnalyst(item)}
                          >
                            <KeyRound className="mr-1 size-3" />
                            Contraseña
                          </Button>
                        )}
                        {isAdmin && item.accessStatus !== "PENDING_ACTIVATION" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyAnalystId === item.id}
                            className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setReactivatingAnalyst(item)}
                          >
                            <RotateCcw className="mr-1 size-3" />
                            Reiniciar activación
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => setEditingAnalyst(item)}
                        >
                          <Edit className="mr-1 size-3" />
                          Editar
                        </Button>
                        {item.accessStatus !== "PENDING_ACTIVATION" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyAnalystId === item.id}
                            className="h-7 cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => void handleToggleAnalyst(item)}
                          >
                            {item.active ? <PowerOff className="mr-1 size-3" /> : <Power className="mr-1 size-3" />}
                            {item.active ? "Deshabilitar" : "Habilitar"}
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(analystInvitation)} onOpenChange={(open) => { if (!open) setAnalystInvitation(null) }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          {analystInvitation ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-900">Invitación de analista</DialogTitle>
                <DialogDescription className="text-xs">Comparte este enlace con {analystInvitation.analyst.name}. Por seguridad, no volverá a mostrarse después de cerrar.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="block text-slate-500">Entidad financiera</span>
                  <strong className="text-slate-900">{analystInvitation.analyst.entityName}</strong>
                </div>
                <Field>
                  <FieldLabel htmlFor="analyst-activation-link">Enlace de activación</FieldLabel>
                  <div className="flex min-w-0 gap-2">
                    <Input id="analyst-activation-link" value={buildActivationUrl(analystInvitation.activationToken)} readOnly className="min-w-0 bg-white font-mono text-[11px]" onFocus={(event) => event.currentTarget.select()} />
                    <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label="Copiar enlace de activación" onClick={() => void copyInvitationLink()}><Copy className="size-4" /></Button>
                  </div>
                </Field>
                <p className="text-xs text-slate-500">Vence el {new Date(analystInvitation.expiresAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}. Generar otro enlace revocará este inmediatamente.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAnalystInvitation(null)}>Cerrar</Button>
                <Button type="button" className="bg-slate-950 text-white hover:bg-slate-800" onClick={() => void copyInvitationLink()}><Copy className="mr-1.5 size-4" />Copiar enlace</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(reactivatingAnalyst)} onOpenChange={(open) => { if (!open && busyAnalystId === null) setReactivatingAnalyst(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar activación del analista</AlertDialogTitle>
            <AlertDialogDescription>
              {reactivatingAnalyst ? `${reactivatingAnalyst.name} perderá el acceso actual.` : "El analista perderá el acceso actual."} Su contraseña y sesiones dejarán de funcionar, y deberás compartirle un nuevo enlace de activación. Sus datos e historial se conservarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyAnalystId !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busyAnalystId !== null}
              className="bg-slate-950 text-white hover:bg-slate-800"
              onClick={(event) => {
                event.preventDefault()
                void handleRestartActivation()
              }}
            >
              <RotateCcw className="mr-1.5 size-4" />
              {busyAnalystId !== null ? "Reiniciando..." : "Reiniciar activación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(editingEntity)} onOpenChange={(open) => { if (!open) setEditingEntity(null) }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          {editingEntity && (
            <form onSubmit={handleUpdateEntity}>
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-900">Editar entidad</DialogTitle>
                <DialogDescription className="text-xs">Modifica los datos generales y estado de la entidad financiera.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-ruc">RUC de la entidad</FieldLabel>
                    <Input id="edit-ruc" name="ruc" value={editingEntity.ruc} readOnly className="bg-slate-50 text-xs text-slate-500" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-name">Razón social</FieldLabel>
                    <Input id="edit-name" name="name" defaultValue={editingEntity.name} required className="bg-white text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-contact">Persona de contacto</FieldLabel>
                    <Input id="edit-contact" name="contact" defaultValue={editingEntity.contact} required className="bg-white text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-email">Correo institucional</FieldLabel>
                    <Input id="edit-email" name="email" type="email" defaultValue={editingEntity.email} required className="bg-white text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-active">Estado operativo</FieldLabel>
                    <Select value={editEntityActive} onValueChange={setEditEntityActive}>
                      <SelectTrigger id="edit-active" className="h-9 w-full bg-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="true">Activa / Recibe trámites</SelectItem>
                          <SelectItem value="false">Inactiva / Suspendida</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 border-t pt-3 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditingEntity(null)}>Cancelar</Button>
                <Button type="submit" className="bg-slate-950 font-semibold text-white hover:bg-slate-800">Guardar cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingAnalyst)} onOpenChange={(open) => { if (!open) setEditingAnalyst(null) }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          {editingAnalyst && (
            <form onSubmit={handleUpdateAnalyst}>
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-900">Editar analista</DialogTitle>
                <DialogDescription className="text-xs">Modifica los detalles profesionales y disponibilidad del analista.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-code">Código interno</FieldLabel>
                    <Input id="edit-analyst-code" name="code" defaultValue={editingAnalyst.code} required className="bg-white text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-name">Nombre completo</FieldLabel>
                    <Input id="edit-analyst-name" name="name" defaultValue={editingAnalyst.name} required className="bg-white text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-email">Correo electrónico</FieldLabel>
                    <Input id="edit-analyst-email" name="email" type="email" defaultValue={editingAnalyst.email} required className="bg-white text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-analyst-entity">Entidad financiera</FieldLabel>
                    <Select value={editAnalystEntityId} onValueChange={setEditAnalystEntityId} required>
                      <SelectTrigger id="edit-analyst-entity" className="h-9 w-full bg-white text-xs">
                        <SelectValue placeholder="Selecciona una entidad..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {entities.filter((entity) => entity.active || entity.id === Number(editAnalystEntityId)).map((entity) => (
                            <SelectItem key={entity.id} value={String(entity.id)}>{entity.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  {editingAnalyst.accessStatus === "PENDING_ACTIVATION" ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">La disponibilidad se habilitará automáticamente cuando el analista active su cuenta.</div>
                  ) : (
                    <Field>
                      <FieldLabel htmlFor="edit-analyst-active">Disponibilidad</FieldLabel>
                      <Select value={editAnalystActive} onValueChange={setEditAnalystActive}>
                        <SelectTrigger id="edit-analyst-active" className="h-9 w-full bg-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">Disponible / Recibe asignaciones</SelectItem>
                            <SelectItem value="false">No disponible</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 border-t pt-3 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditingAnalyst(null)}>Cancelar</Button>
                <Button type="submit" className="bg-slate-950 font-semibold text-white hover:bg-slate-800">Guardar cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resettingAnalyst)} onOpenChange={(open) => { if (!open) { setResettingAnalyst(null); setShowResetPassword(false) } }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          {resettingAnalyst && (
            <form onSubmit={handleResetAnalystPassword}>
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-900">Restablecer contraseña</DialogTitle>
                <DialogDescription className="text-xs">Define una nueva contraseña para {resettingAnalyst.name}. Sus sesiones abiertas se cerrarán.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="reset-analyst-password">Nueva contraseña</FieldLabel>
                    <div className="relative">
                      <Input id="reset-analyst-password" name="password" type={showResetPassword ? "text" : "password"} minLength={8} maxLength={128} autoComplete="new-password" required className="bg-white pr-10 text-xs" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 size-9" aria-label={showResetPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowResetPassword((value) => !value)}>
                        {showResetPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    <p className="text-[11px] leading-4 text-slate-500">8 caracteres como mínimo, con mayúscula, minúscula, número y símbolo.</p>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="reset-analyst-password-confirmation">Confirmar contraseña</FieldLabel>
                    <Input id="reset-analyst-password-confirmation" name="passwordConfirmation" type={showResetPassword ? "text" : "password"} minLength={8} maxLength={128} autoComplete="new-password" required className="bg-white text-xs" />
                  </Field>
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 border-t pt-3 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setResettingAnalyst(null)}>Cancelar</Button>
                <Button type="submit" className="bg-slate-950 font-semibold text-white hover:bg-slate-800">Restablecer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function buildActivationUrl(token: string) {
  return `${window.location.origin}/analista/activar?token=${encodeURIComponent(token)}`
}

function analystStatusLabel(status: Analyst["accessStatus"]) {
  if (status === "PENDING_ACTIVATION") return "Pendiente de activación"
  return status === "ACTIVE" ? "Disponible" : "Inactivo"
}

function analystStatusClass(status: Analyst["accessStatus"]) {
  if (status === "PENDING_ACTIVATION") return "border border-amber-200 bg-amber-50 py-0 text-[10px] text-amber-800 hover:bg-amber-50"
  return status === "ACTIVE"
    ? "border bg-slate-100 py-0 text-[10px] text-slate-700 hover:bg-slate-100"
    : "border bg-slate-100 py-0 text-[10px] text-slate-500"
}
