import { useState, type FormEvent } from "react"
import { Landmark, LoaderCircle, LockKeyhole } from "lucide-react"
import { Navigate } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { useAuth } from "@/features/auth/auth-context"
import { DEMO_ERP_ACCOUNTS, ERP_LOGIN_ROLES, sessionHasAnyRole } from "@/features/auth/auth-entrypoints"
import { getHomeRoute } from "@/shared/lib/role-redirect"
import { getErrorMessage } from "@/shared/lib/utils"
import type { LoginCredentials } from "@/shared/types/domain"

const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO === "true"

export function ErpLoginPage() {
  const { session, isAuthenticated, authenticate, acceptSession, loading: authLoading } = useAuth()
  const [email, setEmail] = useState(DEMO_ENABLED ? DEMO_ERP_ACCOUNTS.admin.email : "")
  const [password, setPassword] = useState(DEMO_ENABLED ? DEMO_ERP_ACCOUNTS.admin.password : "")
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

  async function loginWithCredentials(credentials: LoginCredentials) {
    setError("")
    setLoading(true)
    try {
      const response = await authenticate({ email: credentials.email.trim(), password: credentials.password })

      if (!sessionHasAnyRole(response, ERP_LOGIN_ROLES)) {
        setError("Esta cuenta no tiene permisos para acceder al ERP Administrativo.")
        return
      }

      acceptSession(response)
    } catch (reason) {
      setError(getErrorMessage(reason, "No fue posible iniciar sesión en el ERP."))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await loginWithCredentials({ email, password })
  }

  async function loginWithDemoAccount(credentials: LoginCredentials) {
    setEmail(credentials.email)
    setPassword(credentials.password)
    await loginWithCredentials(credentials)
  }

  return (
    <main className="grid min-h-svh bg-muted/30 lg:grid-cols-[1.1fr_0.9fr]">
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
        <p className="text-sm text-slate-400">Plataforma institucional de gestión interna</p>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-amber-600 text-white lg:hidden"><Landmark /></div>
            <CardTitle className="text-2xl">Iniciar Sesión · ERP</CardTitle>
            <CardDescription>Ingrese sus credenciales administrativas para acceder al ERP.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
              <Button type="submit" disabled={loading} className="cursor-pointer bg-amber-600 text-white hover:bg-amber-700">
                {loading ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
                {loading ? "Ingresando al ERP..." : "Ingresar al ERP"}
              </Button>

              {DEMO_ENABLED ? <div className="flex flex-col gap-2 border-t pt-2">
                <p className="text-center text-xs font-semibold text-muted-foreground">Accesos rápidos para demostración:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer border-amber-200 text-xs hover:bg-amber-50 hover:text-amber-800" disabled={loading} onClick={() => void loginWithDemoAccount(DEMO_ERP_ACCOUNTS.admin)}>
                    Admin CCI
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer border-amber-200 text-xs hover:bg-amber-50 hover:text-amber-800" disabled={loading} onClick={() => void loginWithDemoAccount(DEMO_ERP_ACCOUNTS.staff)}>
                    Staff CCI
                  </Button>
                </div>
              </div> : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <Separator />
            <FieldDescription>Acceso exclusivo para personal autorizado de la Cámara de Comercio de Ica.</FieldDescription>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
