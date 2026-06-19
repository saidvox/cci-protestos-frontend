import { NavLink } from "react-router-dom"
import { Landmark } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { NavigationItem } from "@/config/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

interface AppSidebarProps {
  items: readonly NavigationItem[]
  title?: string
  subtitle?: string
  homePath?: string
  badge?: string
}

export function AppSidebar({ items, title = "Cámara de Comercio", subtitle = "Ica · Protestos y moras", homePath = "/", badge }: AppSidebarProps) {
  const { session } = useAuth()
  const userName = session?.user.name ?? ""

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to={homePath}>
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Landmark />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{title}</span>
                  <span className="truncate text-xs">{subtitle}</span>
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink to={item.path} end={item.path.endsWith("/dashboard")}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-1 px-2 text-xs text-muted-foreground">
          {badge ? (
            <Badge variant="outline" className="w-fit">{badge}</Badge>
          ) : (
            <Badge variant="outline" className="w-fit">Entorno académico</Badge>
          )}
          {userName ? <span className="truncate">{userName}</span> : null}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
