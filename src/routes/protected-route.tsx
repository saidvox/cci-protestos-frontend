import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { canAccess } from "@/lib/access-control"
import type { Role } from "@/types/domain"

export function ProtectedRoute({ roles }: { roles?: readonly Role[] }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-950/5">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    const isErpRoute = location.pathname.startsWith("/erp")
    return <Navigate to={isErpRoute ? "/erp/login" : "/login"} replace state={{ from: location.pathname }} />
  }
  if (!canAccess(session.user.roles, roles)) return <Navigate to="/sin-acceso" replace />
  return <Outlet />
}
