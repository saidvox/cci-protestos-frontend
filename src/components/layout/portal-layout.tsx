import { Outlet } from "react-router-dom"
import { AppNavbar } from "@/components/layout/app-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/contexts/auth-context"
import { debtorNavigation, analystNavigation } from "@/config/navigation"
import { isAnalyst } from "@/lib/role-redirect"

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
