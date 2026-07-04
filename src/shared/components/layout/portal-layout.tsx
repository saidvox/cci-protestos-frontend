import { Outlet } from "react-router-dom"
import { AppNavbar } from "@/shared/components/layout/app-navbar"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { BottomNav } from "@/shared/components/layout/bottom-nav"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Toaster } from "@/shared/components/ui/sonner"
import { useAuth } from "@/features/auth/auth-context"
import { debtorNavigation, analystNavigation } from "@/shared/config/navigation"
import { isAnalyst } from "@/shared/lib/role-redirect"

export function PortalLayout() {
  const { session } = useAuth()
  const roles = session?.user.roles ?? []
  const analyst = isAnalyst(roles)
  const items = analyst ? analystNavigation : debtorNavigation
  const homePath = analyst ? "/analista/dashboard" : "/usuario/dashboard"
  const subtitle = analyst ? "Portal Analista" : "Portal Deudor"

  return (
    <SidebarProvider>
      <div className="hide-sidebar-on-mobile">
        <AppSidebar items={items} homePath={homePath} subtitle={subtitle} />
      </div>
      <SidebarInset>
        <AppNavbar />
        <main className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6 md:pb-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
      <BottomNav items={items} />
      <Toaster richColors />
    </SidebarProvider>
  )
}
