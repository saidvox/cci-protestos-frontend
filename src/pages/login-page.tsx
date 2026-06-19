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

export function LoginPage() {
  const { session, isAuthenticated, login, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("deudor@demo.local")
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

  if (isAuthenticated) {
    const roles = session?.user.roles ?? []
    if (roles.includes("USER_DEBTOR")) {
      return <Navigate to="/" replace />
    }
    return <Navigate to={getHomeRoute(roles)} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      // 1. Call appService.login directly first to check roles
      const response = await appService.login({ email: email.trim(), password })
      const roles = response.user.roles

      if (roles.includes("CCI_ADMIN") || roles.includes("CCI_STAFF")) {
        setError("Acceso denegado. Para ingresar al ERP use la ruta correspondiente.")
        setLoading(false)
        return
      }

      // 2. If valid role, login in auth-context
      await login({ email: email.trim(), password })
    } catch (reason) {
      setError(getErrorMessage(reason, "No fue posible iniciar sesión."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-muted/30 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground text-primary"><Landmark /></span>
          <span className="font-semibold">Cámara de Comercio de Ica</span>
        </div>
        <div className="flex max-w-xl flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-80">Plataforma institucional</p>
          <h1 className="text-4xl font-semibold leading-tight">Gestión digital de protestos y moras</h1>
          <p className="text-lg leading-relaxed opacity-80">Centraliza solicitudes, documentos, revisiones y reportes en un flujo trazable y seguro.</p>
        </div>
        <p className="text-sm opacity-70">Proyecto académico · Datos exclusivamente simulados</p>
      </section>
      <section className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden"><Landmark /></div>
            <CardTitle className="text-2xl">Bienvenido</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error ? <Alert variant="destructive"><LockKeyhole /><AlertTitle>Acceso no disponible</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
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

              <div className="flex flex-col gap-2 pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground text-center">Accesos rápidos para demostración:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs cursor-pointer"
                    onClick={() => {
                      setEmail("deudor@demo.local")
                      setPassword("password")
                      setTimeout(() => {
                        const el = document.getElementById("login-form") as HTMLFormElement
                        el?.requestSubmit()
                      }, 50)
                    }}
                  >
                    Deudor de prueba
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs cursor-pointer"
                    onClick={() => {
                      setEmail("analista@demo.local")
                      setPassword("password")
                      setTimeout(() => {
                        const el = document.getElementById("login-form") as HTMLFormElement
                        el?.requestSubmit()
                      }, 50)
                    }}
                  >
                    Analista de prueba
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <Separator />
            <FieldDescription>Demo: usa deudor@demo.local o analista@demo.local con la contraseña "password".</FieldDescription>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
