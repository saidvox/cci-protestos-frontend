import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { getHomeRoute } from "@/lib/role-redirect"

/** @deprecated — Redirige a la ruta correcta según rol. Mantenido para compatibilidad. */
export function AppLayout() {
  const { session } = useAuth()
  return <Navigate to={getHomeRoute(session?.user.roles ?? [])} replace />
}
