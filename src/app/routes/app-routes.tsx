import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/app/routes/protected-route"
import { Skeleton } from "@/shared/components/ui/skeleton"

const PublicLayout = lazy(() => import("@/shared/components/layout/public-layout").then((m) => ({ default: m.PublicLayout })))
const PortalLayout = lazy(() => import("@/shared/components/layout/portal-layout").then((m) => ({ default: m.PortalLayout })))
const ErpLayout = lazy(() => import("@/shared/components/layout/erp-layout").then((m) => ({ default: m.ErpLayout })))

const AccessDeniedPage = lazy(() => import("@/features/misc/pages/access-denied-page").then((m) => ({ default: m.AccessDeniedPage })))
const NotFoundPage = lazy(() => import("@/features/misc/pages/not-found-page").then((m) => ({ default: m.NotFoundPage })))

const LandingPage = lazy(() => import("@/features/public/pages/landing-page").then((m) => ({ default: m.LandingPage })))
const PlaceholderPage = lazy(() => import("@/features/public/pages/placeholder-page").then((m) => ({ default: m.PlaceholderPage })))

const LoginPage = lazy(() => import("@/features/auth/pages/login-page").then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/features/auth/pages/register-page").then((m) => ({ default: m.RegisterPage })))
const ErpLoginPage = lazy(() => import("@/features/auth/pages/erp-login-page").then((m) => ({ default: m.ErpLoginPage })))

const DebtorDashboard = lazy(() => import("@/features/debtor/pages/debtor-dashboard").then((m) => ({ default: m.DebtorDashboard })))

const AnalystDashboard = lazy(() => import("@/features/analyst/pages/analyst-dashboard").then((m) => ({ default: m.AnalystDashboard })))
const AnalystRequests = lazy(() => import("@/features/analyst/pages/analyst-requests").then((m) => ({ default: m.AnalystRequests })))
const AnalystHistory = lazy(() => import("@/features/analyst/pages/analyst-history").then((m) => ({ default: m.AnalystHistory })))

const DashboardPage = lazy(() => import("@/features/erp/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })))
const OperationsPage = lazy(() => import("@/features/erp/pages/operations-page").then((m) => ({ default: m.OperationsPage })))
const ProtestQueryPage = lazy(() => import("@/features/erp/pages/protest-query-page").then((m) => ({ default: m.ProtestQueryPage })))
const EntitiesPage = lazy(() => import("@/features/erp/pages/entities-page").then((m) => ({ default: m.EntitiesPage })))
const ReportsPage = lazy(() => import("@/features/erp/pages/reports-page").then((m) => ({ default: m.ReportsPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="consulta-protestos" element={<PlaceholderPage title="Consulta de protestos" description="Informacion sobre el proceso de consulta" />} />
          <Route path="servicios" element={<PlaceholderPage title="Servicios" description="Servicios de la Camara de Comercio" />} />
          <Route path="contacto" element={<PlaceholderPage title="Contacto" description="Informacion de contacto institucional" />} />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="erp/login" element={<ErpLoginPage />} />

        <Route element={<ProtectedRoute roles={["USER_DEBTOR"]} />}>
          <Route element={<PublicLayout />}>
            <Route path="usuario/dashboard" element={<DebtorDashboard />} />
            <Route path="usuario/consulta" element={<Navigate to="/usuario/dashboard" replace />} />
            <Route path="usuario/solicitudes" element={<Navigate to="/usuario/dashboard" replace />} />
            <Route path="usuario/solicitudes/:id" element={<Navigate to="/usuario/dashboard" replace />} />
            <Route path="usuario/documentos" element={<Navigate to="/usuario/dashboard" replace />} />
            <Route path="usuario/seguimiento" element={<Navigate to="/usuario/dashboard" replace />} />
            <Route path="usuario/notificaciones" element={<Navigate to="/usuario/dashboard" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["BANK_ANALYST"]} />}>
          <Route element={<PortalLayout />}>
            <Route path="analista/dashboard" element={<AnalystDashboard />} />
            <Route path="analista/cargar-excel" element={<Navigate to="/analista/historial-excel" replace />} />
            <Route path="analista/historial-excel" element={<AnalystHistory />} />
            <Route path="analista/cargas/:id" element={<Navigate to="/analista/historial-excel" replace />} />
            <Route path="analista/solicitudes" element={<AnalystRequests />} />
            <Route path="analista/solicitudes/:id" element={<Navigate to="/analista/solicitudes" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["CCI_ADMIN", "CCI_STAFF"]} />}>
          <Route element={<ErpLayout />}>
            <Route path="erp/dashboard" element={<DashboardPage />} />
            <Route path="erp/protestos" element={<ProtestQueryPage />} />
            <Route path="erp/solicitudes" element={<OperationsPage />} />
            <Route path="erp/solicitudes/:id" element={<PlaceholderPage title="Detalle de solicitud" />} />
            <Route path="erp/entidades" element={<EntitiesPage />} />
            <Route path="erp/analistas" element={<Navigate to="/erp/entidades" replace />} />
            <Route path="erp/reportes" element={<ReportsPage />} />
            <Route path="erp/auditoria" element={<Navigate to="/erp/dashboard" replace />} />
            <Route path="erp/configuracion" element={<Navigate to="/erp/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="gestion" element={<Navigate to="/erp/solicitudes" replace />} />
        <Route path="admin" element={<Navigate to="/erp/entidades" replace />} />
        <Route path="auditoria" element={<Navigate to="/erp/auditoria" replace />} />
        <Route path="protestos" element={<Navigate to="/erp/protestos" replace />} />
        <Route path="solicitudes" element={<Navigate to="/erp/solicitudes" replace />} />

        <Route path="sin-acceso" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <main className="flex min-h-svh flex-col gap-4 p-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </main>
  )
}
