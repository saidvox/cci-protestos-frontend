import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { canAccess } from "@/lib/access-control"
import type { Role } from "@/types/domain"

export function ProtectedRoute({ roles }: { roles?: readonly Role[] }) {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!canAccess(session.user.roles, roles)) return <Navigate to="/sin-acceso" replace />
  return <Outlet />
}
