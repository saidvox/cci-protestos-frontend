import { useState, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Landmark, LoaderCircle, LockKeyhole, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { appService } from "@/services/service-factory"
import { useAuth } from "@/contexts/auth-context"
import { getErrorMessage } from "@/lib/utils"

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [email, setEmail] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState<"DNI" | "RUC" | "CE">("DNI")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Validation function
  const validate = (): string | null => {
    if (!nombreCompleto.trim()) return "El nombre completo es requerido."
    if (!email.trim() || !email.includes("@")) return "Ingrese un correo electrónico válido."
    
    // Document validation
    if (tipoDocumento === "DNI") {
      if (numeroDocumento.length !== 8) return "El DNI debe tener exactamente 8 dígitos."
    } else if (tipoDocumento === "RUC") {
      if (numeroDocumento.length !== 11) return "El RUC debe tener exactamente 11 dígitos."
    } else if (tipoDocumento === "CE") {
      if (numeroDocumento.length < 8 || numeroDocumento.length > 12) {
        return "El Carné de Extranjería debe tener entre 8 y 12 caracteres."
      }
    }

    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres."
    if (password !== confirmPassword) return "Las contraseñas ingresadas no coinciden."

    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      await appService.register({
        nombreCompleto: nombreCompleto.trim(),
        email: email.trim(),
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        password,
      })
      toast.success("Cuenta registrada con éxito. Iniciando sesión...")
      await login({ email: email.trim(), password })
      navigate("/")
    } catch (reason) {
      const errMsg = getErrorMessage(reason, "No fue posible completar el registro.")
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-muted/30 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Brand Column (Left) */}
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground text-primary"><Landmark /></span>
          <span className="font-semibold">Cámara de Comercio de Ica</span>
        </div>
        <div className="flex max-w-xl flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-80">Portal del Ciudadano Deudor</p>
          <h1 className="text-4xl font-semibold leading-tight">Registre su cuenta de regularización</h1>
          <p className="text-lg leading-relaxed opacity-80">
            Obtenga acceso al panel de deudor público para consultar detalladamente sus protestos y tramitar levantamientos digitales adjuntando sus constancias de pago de forma oficial.
          </p>
        </div>
        <p className="text-sm opacity-70">Proyecto académico · Datos exclusivamente simulados</p>
      </section>

      {/* Form Column (Right) */}
      <section className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Landmark /></div>
            </div>
            <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
            <CardDescription>Regístrese ingresando sus datos personales y documento de identidad.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="register-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error ? (
                <Alert variant="destructive">
                  <LockKeyhole />
                  <AlertTitle>Registro no disponible</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="nombreCompleto">Nombre completo o Razón Social</FieldLabel>
                  <Input 
                    id="nombreCompleto" 
                    value={nombreCompleto} 
                    onChange={(e) => setNombreCompleto(e.target.value)} 
                    placeholder="Juan Pérez o Ica Retail S.A.C." 
                    required 
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="nombre@ejemplo.com" 
                    required 
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
                  <Field>
                    <FieldLabel htmlFor="tipoDocumento">Tipo Doc.</FieldLabel>
                    <Select 
                      value={tipoDocumento} 
                      onValueChange={(value) => {
                        setTipoDocumento(value as "DNI" | "RUC" | "CE")
                        setNumeroDocumento("")
                      }}
                    >
                      <SelectTrigger id="tipoDocumento">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="RUC">RUC</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="numeroDocumento">Número de Documento</FieldLabel>
                    <Input 
                      id="numeroDocumento" 
                      value={numeroDocumento} 
                      onChange={(e) => {
                        const val = e.target.value
                        if (tipoDocumento === "DNI" || tipoDocumento === "RUC") {
                          setNumeroDocumento(val.replace(/\D/g, "").slice(0, tipoDocumento === "DNI" ? 8 : 11))
                        } else {
                          setNumeroDocumento(val.slice(0, 12))
                        }
                      }} 
                      placeholder={tipoDocumento === "DNI" ? "8 dígitos" : tipoDocumento === "RUC" ? "11 dígitos" : "Entre 8 y 12 caracteres"} 
                      required 
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Mín. 8 caracteres" 
                      required 
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Repita la contraseña" 
                      required 
                    />
                  </Field>
                </div>
              </FieldGroup>

              <Button type="submit" disabled={loading} className="w-full mt-2 cursor-pointer">
                {loading ? <LoaderCircle className="animate-spin mr-2 size-4" /> : null}
                {loading ? "Registrando..." : "Crear cuenta"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Separator />
            <div className="flex flex-wrap w-full items-center justify-between text-sm gap-2">
              <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800">
                <ArrowLeft className="size-3.5" /> Volver al Inicio
              </Link>
              <span className="text-slate-500">
                ¿Ya tiene una cuenta?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Inicie sesión
                </Link>
              </span>
            </div>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
