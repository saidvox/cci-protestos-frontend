import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { ProtectedRoute } from "@/routes/protected-route"

const AccessDeniedPage = lazy(() => import("@/pages/access-denied-page").then((module) => ({ default: module.AccessDeniedPage })))
const AnalystsPage = lazy(() => import("@/pages/analysts-page").then((module) => ({ default: module.AnalystsPage })))
const AuditPage = lazy(() => import("@/pages/audit-page").then((module) => ({ default: module.AuditPage })))
const DashboardPage = lazy(() => import("@/pages/dashboard-page").then((module) => ({ default: module.DashboardPage })))
const DocumentsPage = lazy(() => import("@/pages/documents-page").then((module) => ({ default: module.DocumentsPage })))
const EntitiesPage = lazy(() => import("@/pages/entities-page").then((module) => ({ default: module.EntitiesPage })))
const ExcelPage = lazy(() => import("@/pages/excel-page").then((module) => ({ default: module.ExcelPage })))
const LoginPage = lazy(() => import("@/pages/login-page").then((module) => ({ default: module.LoginPage })))
const NewRequestPage = lazy(() => import("@/pages/new-request-page").then((module) => ({ default: module.NewRequestPage })))
const NotFoundPage = lazy(() => import("@/pages/not-found-page").then((module) => ({ default: module.NotFoundPage })))
const ProtestQueryPage = lazy(() => import("@/pages/protest-query-page").then((module) => ({ default: module.ProtestQueryPage })))
const ReportsPage = lazy(() => import("@/pages/reports-page").then((module) => ({ default: module.ReportsPage })))
const RequestsPage = lazy(() => import("@/pages/requests-page").then((module) => ({ default: module.RequestsPage })))
const ReviewPage = lazy(() => import("@/pages/review-page").then((module) => ({ default: module.ReviewPage })))

export function AppRoutes() {
  return <Suspense fallback={<RouteFallback />}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="protestos" element={<ProtestQueryPage />} />
        <Route path="solicitudes/nueva" element={<NewRequestPage />} />
        <Route path="solicitudes" element={<RequestsPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="sin-acceso" element={<AccessDeniedPage />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={["ADMIN", "ANALISTA"]} />}>
      <Route element={<AppLayout />}>
        <Route path="excel" element={<ExcelPage />} />
        <Route path="revision" element={<ReviewPage />} />
        <Route path="reportes" element={<ReportsPage />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
      <Route element={<AppLayout />}>
        <Route path="entidades" element={<EntitiesPage />} />
        <Route path="analistas" element={<AnalystsPage />} />
        <Route path="auditoria" element={<AuditPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense>
}

function RouteFallback() {
  return <main className="flex min-h-svh flex-col gap-4 p-6"><Skeleton className="h-9 w-64" /><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></main>
}
