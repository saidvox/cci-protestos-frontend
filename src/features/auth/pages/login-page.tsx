import { useState, type FormEvent } from "react"
import { CircleCheck, Landmark, LoaderCircle, LockKeyhole } from "lucide-react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { useAuth } from "@/features/auth/auth-context"
import { DEMO_PUBLIC_ACCOUNTS, ERP_LOGIN_ROLES, PUBLIC_LOGIN_ROLES, sessionHasAnyRole } from "@/features/auth/auth-entrypoints"
import { getHomeRoute } from "@/shared/lib/role-redirect"
import { getErrorMessage } from "@/shared/lib/utils"
import type { LoginCredentials } from "@/shared/types/domain"

const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO === "true"

export function LoginPage() {
  const location = useLocation()
  const activationState = location.state as { activationEmail?: string; activationSuccess?: boolean } | null
  const { session, isAuthenticated, authenticate, acceptSession, loading: authLoading } = useAuth()
  const [identifier, setIdentifier] = useState(activationState?.activationEmail ?? (DEMO_ENABLED ? DEMO_PUBLIC_ACCOUNTS.debtor.email : ""))
  const [password, setPassword] = useState(DEMO_ENABLED ? DEMO_PUBLIC_ACCOUNTS.debtor.password : "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    const roles = session?.user.roles ?? []
    if (roles.includes("USER_DEBTOR")) {
      return <Navigate to="/" replace />
    }
    return <Navigate to={getHomeRoute(roles)} replace />
  }

  async function loginWithCredentials(credentials: LoginCredentials) {
    setError("")
    setLoading(true)
    try {
      const response = await authenticate({ email: credentials.email.trim(), password: credentials.password })

      if (sessionHasAnyRole(response, ERP_LOGIN_ROLES) || !sessionHasAnyRole(response, PUBLIC_LOGIN_ROLES)) {
        setError("Acceso denegado. Para ingresar al ERP use la ruta correspondiente.")
        return
      }

      acceptSession(response)
    } catch (reason) {
      setError(getErrorMessage(reason, "No fue posible iniciar sesión."))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await loginWithCredentials({ email: identifier, password })
  }

  async function loginWithDemoAccount(credentials: LoginCredentials) {
    setIdentifier(credentials.email)
    setPassword(credentials.password)
    await loginWithCredentials(credentials)
  }

  return (
    <main className="grid min-h-svh bg-muted/30 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground text-primary"><Landmark /></span>
          <span className="font-semibold">Cámara de Comercio de Ica</span>
        </Link>
        <div className="flex max-w-xl flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-80">Plataforma institucional</p>
          <h1 className="text-4xl font-semibold leading-tight">Gestión digital de protestos y moras</h1>
          <p className="text-lg leading-relaxed opacity-80">Centraliza solicitudes, documentos, revisiones y reportes en un flujo trazable y seguro.</p>
        </div>
        <p className="text-sm opacity-70">Plataforma institucional de gestión digital</p>
      </section>
      <section className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Link to="/" className="mb-2 flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Landmark /></span>
              <span className="text-sm font-semibold text-slate-900">Cámara de Comercio de Ica</span>
            </Link>
            <CardTitle className="text-2xl">Bienvenido</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {activationState?.activationSuccess ? <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900"><CircleCheck /><AlertTitle>Cuenta activada</AlertTitle><AlertDescription>Ya puedes ingresar con tu correo y la contraseña que acabas de crear.</AlertDescription></Alert> : null}
              {error ? <Alert variant="destructive"><LockKeyhole /><AlertTitle>Acceso no disponible</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="identifier">DNI, RUC o correo electrónico</FieldLabel>
                  <Input id="identifier" type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </p>
              <p className="text-center text-xs text-muted-foreground">
                ¿Recibiste una invitación como analista?{" "}
                <Link to="/analista/activar" className="font-semibold text-primary hover:underline">Activa tu cuenta</Link>
              </p>

              {DEMO_ENABLED ? <div className="flex flex-col gap-2 border-t pt-2">
                <p className="text-center text-xs font-semibold text-muted-foreground">Accesos rápidos para demostración:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer text-xs" disabled={loading} onClick={() => void loginWithDemoAccount(DEMO_PUBLIC_ACCOUNTS.debtor)}>
                    Deudor de prueba
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer text-xs" disabled={loading} onClick={() => void loginWithDemoAccount(DEMO_PUBLIC_ACCOUNTS.analyst)}>
                    Analista de prueba
                  </Button>
                </div>
              </div> : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <Separator />
            <FieldDescription>También puede ingresar con DNI/RUC/CE si su cuenta está asociada a ese documento.</FieldDescription>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
