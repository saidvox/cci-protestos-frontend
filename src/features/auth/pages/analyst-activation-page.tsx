import { useEffect, useState, type FormEvent } from "react"
import { CircleCheck, Eye, EyeOff, KeyRound, Landmark, Link2, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { appService } from "@/shared/services/service-factory"
import { getErrorMessage } from "@/shared/lib/utils"
import type { AnalystActivationInfo } from "@/shared/types/domain"

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

export function AnalystActivationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryToken = searchParams.get("token")?.trim() ?? ""
  const [tokenInput, setTokenInput] = useState(queryToken)
  const [info, setInfo] = useState<AnalystActivationInfo | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "invalid" | "submitting" | "success">(queryToken ? "loading" : "idle")
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!queryToken) {
      setInfo(null)
      setStatus("idle")
      return
    }
    let current = true
    setTokenInput(queryToken)
    setStatus("loading")
    setError("")
    void appService.validateAnalystInvitation(queryToken)
      .then((result) => {
        if (!current) return
        setInfo(result)
        setStatus("ready")
      })
      .catch((reason) => {
        if (!current) return
        setInfo(null)
        setError(getErrorMessage(reason, "La invitación es inválida, venció o ya fue utilizada."))
        setStatus("invalid")
      })
    return () => { current = false }
  }, [queryToken])

  function handleValidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = extractToken(tokenInput)
    if (!token) {
      setError("Ingrese el enlace o token entregado por la Cámara.")
      setStatus("invalid")
      return
    }
    setSearchParams({ token })
  }

  async function handleActivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!info || !queryToken) return
    if (!STRONG_PASSWORD.test(password)) {
      setError("La contraseña debe incluir mayúscula, minúscula, número y símbolo; mínimo 8 caracteres.")
      return
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setStatus("submitting")
    setError("")
    try {
      await appService.activateAnalyst(queryToken, password)
      setStatus("success")
    } catch (reason) {
      setError(getErrorMessage(reason, "No fue posible activar la cuenta."))
      setStatus("ready")
    }
  }

  if (status === "success" && info) {
    return (
      <ActivationShell>
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CircleCheck className="size-6" /></span>
            <CardTitle>Cuenta activada</CardTitle>
            <CardDescription>Tu acceso de analista quedó habilitado para {info.entity}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/login", { state: { activationEmail: info.email, activationSuccess: true } })}>
              Ir a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </ActivationShell>
    )
  }

  return (
    <ActivationShell>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldCheck className="size-4" />Activación de analista</div>
          <CardTitle className="text-2xl">Configura tu acceso</CardTitle>
          <CardDescription>Utiliza la invitación entregada por la Cámara de Comercio de Ica.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "idle" || status === "invalid" ? (
            <form className="space-y-4" onSubmit={handleValidate}>
              {error ? <Alert variant="destructive"><TriangleAlert /><AlertTitle>Invitación no disponible</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
              <Field>
                <FieldLabel htmlFor="activation-token">Enlace o token de invitación</FieldLabel>
                <Input id="activation-token" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} placeholder="Pega aquí el enlace recibido" autoComplete="off" required />
                <FieldDescription>Solo puede utilizarse una vez y vence después de 72 horas.</FieldDescription>
              </Field>
              <Button type="submit" className="w-full"><Link2 />Validar invitación</Button>
            </form>
          ) : null}

          {status === "loading" ? (
            <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-6 animate-spin" />Validando invitación...</div>
          ) : null}

          {(status === "ready" || status === "submitting") && info ? (
            <form className="space-y-5" onSubmit={handleActivate}>
              {error ? <Alert variant="destructive"><KeyRound /><AlertTitle>No se pudo activar</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
              <div className="grid gap-3 rounded-md border bg-slate-50 p-3 text-sm sm:grid-cols-2">
                <div className="min-w-0"><span className="block text-xs text-muted-foreground">Analista</span><strong className="block truncate">{info.name}</strong></div>
                <div className="min-w-0"><span className="block text-xs text-muted-foreground">Correo</span><strong className="block truncate">{info.email}</strong></div>
                <div className="min-w-0 sm:col-span-2"><span className="block text-xs text-muted-foreground">Entidad financiera</span><strong className="block truncate">{info.entity}</strong></div>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="analyst-new-password">Nueva contraseña</FieldLabel>
                  <div className="relative">
                    <Input id="analyst-new-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" className="pr-10" required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 size-9" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword((value) => !value)}>
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  <FieldDescription>8 caracteres como mínimo, con mayúscula, minúscula, número y símbolo.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="analyst-confirm-password">Confirmar contraseña</FieldLabel>
                  <Input id="analyst-confirm-password" type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full" disabled={status === "submitting"}>
                {status === "submitting" ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}
                {status === "submitting" ? "Activando..." : "Activar mi cuenta"}
              </Button>
            </form>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <Separator />
          <Button variant="ghost" asChild><Link to="/login">Volver al inicio de sesión</Link></Button>
        </CardFooter>
      </Card>
    </ActivationShell>
  )
}

function ActivationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-950"><span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white"><Landmark className="size-5" /></span>Cámara de Comercio de Ica</Link>
        </div>
      </header>
      <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center justify-center p-4 sm:p-8">{children}</section>
    </main>
  )
}

function extractToken(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  try {
    return new URL(trimmed).searchParams.get("token")?.trim() ?? trimmed
  } catch {
    return trimmed
  }
}
