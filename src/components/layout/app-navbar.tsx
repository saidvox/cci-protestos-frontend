import { Bell, ChevronsUpDown, LogOut, UserRound } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { titleByPath } from "@/config/navigation"

export function AppNavbar() {
  const location = useLocation()
  const { session, logout } = useAuth()
  const title = titleByPath.get(location.pathname) ?? "Sistema de gestión"
  const initials = session?.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") ?? "US"

  return (
    <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbPage>{title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notificaciones"><Bell /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-2 px-2">
              <Avatar className="size-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
              <span className="hidden max-w-40 truncate text-sm md:inline">{session?.user.name}</span>
              <ChevronsUpDown className="hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="flex flex-col gap-1">
                  <span>{session?.user.name}</span>
                  <span className="font-normal text-muted-foreground">{session?.user.email}</span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled><UserRound />Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}><LogOut />Cerrar sesión</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
