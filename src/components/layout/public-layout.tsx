import { Link, Outlet } from "react-router-dom"
import { Landmark, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getHomeRoute } from "@/lib/role-redirect"

export function PublicLayout() {
  const { session, isAuthenticated, logout } = useAuth()
  const initials = session?.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") ?? "US"

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </span>
            <span className="hidden font-semibold sm:inline">Cámara de Comercio de Ica</span>
          </Link>
          <nav className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild className="cursor-pointer">
                  <Link to={getHomeRoute(session?.user.roles ?? [])}>
                    <LayoutDashboard className="size-4 mr-1.5" />
                    Ir al Panel
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto gap-2 p-1 rounded-full cursor-pointer">
                      <Avatar className="size-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        <span className="flex flex-col gap-1 text-left">
                          <span>{session?.user.name}</span>
                          <span className="font-normal text-xs text-muted-foreground">{session?.user.email}</span>
                          <span className="font-semibold text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 mt-1 self-start uppercase tracking-wider">
                            {session?.user.roles[0]?.replace("_", " ")}
                          </span>
                        </span>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={logout} className="text-red-600 hover:text-red-700 cursor-pointer">
                        <LogOut className="size-4 mr-2" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          <p>© 2026 Cámara de Comercio, Industria y Turismo de Ica</p>
          <p className="mt-1">Proyecto académico · Datos simulados</p>
        </div>
      </footer>
      <Toaster richColors />
    </div>
  )
}
