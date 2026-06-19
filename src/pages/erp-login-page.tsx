import { useState, type FormEvent } from "react"
import { Landmark, LoaderCircle, LockKeyhole } from "lucide-react"
import { Navigate } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { getHomeRoute } from "@/lib/role-redirect"
import { getErrorMessage } from "@/lib/utils"
import { appService } from "@/services/service-factory"

export function ErpLoginPage() {
  const { session, isAuthenticated, login, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("admin@demo.local")
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) return <Navigate to={getHomeRoute(session?.user.roles ?? [])} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      // 1. Call appService.login directly first to check roles
      const response = await appService.login({ email: email.trim(), password })
      const roles = response.user.roles

      if (!roles.includes("CCI_ADMIN") && !roles.includes("CCI_STAFF")) {
        setError("Esta cuenta no tiene permisos para acceder al ERP Administrativo.")
        setLoading(false)
        return
      }

      // 2. If valid administrative role, perform the login in auth-context
      await login({ email: email.trim(), password })
    } catch (reason) {
      setError(getErrorMessage(reason, "No fue posible iniciar sesión en el ERP."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-muted/30 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Column (Administrative Brand Panel) */}
      <section className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-600 text-white"><Landmark /></span>
          <span className="font-semibold">Cámara de Comercio de Ica · ERP</span>
        </div>
        <div className="flex max-w-xl flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-500">Área Administrativa</p>
          <h1 className="text-4xl font-semibold leading-tight">Sistema de Gestión de Protestos y Moras</h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Acceso restringido para el personal administrativo y auditoría institucional. Gestione entidades financieras, analistas de protestos, solicitudes de regularización y auditoría inmutable de la Cámara.
          </p>
        </div>
        <p className="text-sm text-slate-400">Proyecto académico · Datos exclusivamente simulados</p>
      </section>

      {/* Right Column (LoginForm Card) */}
      <section className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-amber-600 text-white lg:hidden"><Landmark /></div>
            <CardTitle className="text-2xl">Iniciar Sesión · ERP</CardTitle>
            <CardDescription>Ingrese sus credenciales administrativas para acceder al ERP.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="erp-login-form" className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error ? <Alert variant="destructive"><LockKeyhole /><AlertTitle>Acceso denegado</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Correo institucional</FieldLabel>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer">
                {loading ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
                {loading ? "Ingresando al ERP..." : "Ingresar al ERP"}
              </Button>

              <div className="flex flex-col gap-2 pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground text-center">Acceso rápido para demostración:</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-xs cursor-pointer border-amber-200 hover:bg-amber-50 hover:text-amber-800"
                  onClick={() => {
                    setEmail("admin@demo.local")
                    setPassword("password")
                    setTimeout(() => {
                      const el = document.getElementById("erp-login-form") as HTMLFormElement
                      el?.requestSubmit()
                    }, 50)
                  }}
                >
                  Administrador de prueba (CCI)
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <Separator />
            <FieldDescription>Demo: usa admin@demo.local o staff@demo.local con la contraseña "password".</FieldDescription>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
