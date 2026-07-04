import { Outlet } from "react-router-dom"
import { AppNavbar } from "@/shared/components/layout/app-navbar"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { BottomNav } from "@/shared/components/layout/bottom-nav"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Toaster } from "@/shared/components/ui/sonner"
import { erpNavigation } from "@/shared/config/navigation"

export function ErpLayout() {
  return (
    <SidebarProvider>
      <div className="hide-sidebar-on-mobile">
        <AppSidebar items={erpNavigation} homePath="/erp/dashboard" subtitle="ERP · Gestión interna" badge="ERP Interno" />
      </div>
      <SidebarInset>
        <AppNavbar />
        <main className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6 md:pb-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
      <BottomNav items={erpNavigation} />
      <Toaster richColors />
    </SidebarProvider>
  )
}
