import { useCallback, useEffect, useState } from "react"
import { Bell, Building2, CheckCheck, FileSpreadsheet, FileText, LoaderCircle, RefreshCw, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { useAuth } from "@/features/auth/auth-context"
import { appService } from "@/shared/services/service-factory"
import type { ErpNotification } from "@/shared/types/domain"

const routesByResource: Record<string, string> = {
  SOLICITUD: "/erp/solicitudes",
  CARGA_EXCEL: "/erp/protestos",
  DOCUMENTO_TRAMITE: "/erp/solicitudes",
  ENTIDAD: "/erp/entidades",
  ANALISTA: "/erp/entidades",
}

function relativeDate(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" })
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second")
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour")
  return formatter.format(Math.round(hours / 24), "day")
}

function notificationMeta(item: ErpNotification) {
  const action = ({
    CREAR: "Creación",
    CORREGIR: "Corrección",
    ACTUALIZAR: "Actualización",
    CAMBIAR_ESTADO: "Cambio de estado",
    IMPORTAR: "Importación",
    ELIMINAR: "Eliminación",
    RESTABLECER_PASSWORD: "Contraseña restablecida",
    REINICIAR_ACTIVACION: "Activación reiniciada",
  } as Record<string, string>)[item.action] ?? "Actividad"
  if (item.resource === "SOLICITUD") return { title: `${action}: solicitud`, icon: FileText }
  if (item.resource === "CARGA_EXCEL") return { title: `${action}: Excel`, icon: FileSpreadsheet }
  if (item.resource === "DOCUMENTO_TRAMITE") return { title: `${action}: documento`, icon: FileText }
  if (item.resource === "ENTIDAD") return { title: `${action}: entidad`, icon: Building2 }
  return { title: `${action}: analista`, icon: UserRound }
}

export function NotificationCenter() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ErpNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const isErp = session?.user.roles.some((role) => role === "CCI_ADMIN" || role === "CCI_STAFF") ?? false

  const load = useCallback(async (showLoading = false) => {
    if (!isErp) return
    if (showLoading) setLoading(true)
    try {
      const feed = await appService.getNotifications(10)
      setItems(feed.items)
      setUnreadCount(feed.unreadCount)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [isErp])

  useEffect(() => {
    if (!isErp) return
    void load()
    const intervalId = window.setInterval(() => void load(), 60_000)
    const handleFocus = () => void load()
    window.addEventListener("focus", handleFocus)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
    }
  }, [isErp, load])

  if (!isErp) return null

  async function markRead(throughId: number) {
    try {
      await appService.markNotificationsRead(throughId)
      setItems((current) => current.map((item) => item.id <= throughId ? { ...item, read: true } : item))
      await load()
    } catch {
      setError(true)
    }
  }

  function selectItem(item: ErpNotification) {
    if (!item.read) void markRead(item.id)
    setOpen(false)
    navigate(routesByResource[item.resource] ?? "/erp/dashboard")
  }

  const newestId = items[0]?.id

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) void load(true) }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && <Badge className="absolute -right-1 -top-1 min-w-4 justify-center rounded-full bg-slate-950 px-1 py-0 text-[9px] leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-[400px] overflow-hidden p-0">
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div><h2 className="text-sm font-semibold text-slate-950">Actividad reciente</h2><p className="mt-0.5 text-xs text-slate-500">Cambios importantes del sistema.</p></div>
          {unreadCount > 0 && newestId && <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={() => void markRead(newestId)}><CheckCheck className="mr-1 size-3.5" />Leídas</Button>}
        </div>
        <div className="max-h-[min(65vh,520px)] overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-slate-500"><LoaderCircle className="size-5 animate-spin" /></div>
          ) : error && items.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center gap-2 px-4 text-center"><p className="text-xs text-slate-600">No se pudo cargar la actividad.</p><Button variant="outline" size="sm" onClick={() => void load(true)}><RefreshCw className="mr-1 size-3.5" />Reintentar</Button></div>
          ) : items.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-slate-500"><Bell className="size-5" /><p className="text-xs">No hay actividad reciente.</p></div>
          ) : items.map((item) => {
            const meta = notificationMeta(item)
            const Icon = meta.icon
            return (
              <button key={item.id} type="button" onClick={() => selectItem(item)} className="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50">
                <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-white text-slate-700"><Icon className="size-4" />{!item.read && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-slate-950" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2"><span className="text-xs font-semibold text-slate-950">{meta.title}</span><span className="shrink-0 text-[10px] text-slate-400">{relativeDate(item.occurredAt)}</span></span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-4 text-slate-600">{item.detail}</span>
                  <span className="mt-1 block truncate text-[10px] text-slate-400">{item.actor}</span>
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
