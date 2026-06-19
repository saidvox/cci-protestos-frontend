import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Building2, CheckCircle2, FileText, Landmark, ShieldCheck, UserCheck, HelpCircle, ArrowUpRight, ShieldAlert, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { appService } from "@/services/service-factory"
import type { Protest } from "@/types/domain"

export function LandingPage() {
  const { session, isAuthenticated } = useAuth()

  const downloadMockPDF = (filename: string, docTitle: string) => {
    const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 150 >>\nstream\nBT\n/F1 16 Tf\n50 780 Td\n(CAMARA DE COMERCIO DE ICA) Tj\n/F1 12 Tf\n0 -30 Td\n(${docTitle}) Tj\n0 -30 Td\n(Este documento es un formato oficial de simulacion para el levantamiento de protestos.) Tj\n0 -20 Td\n(Complete los datos del deudor y firme el documento antes de cargarlo.) Tj\n0 -30 Td\n(Fecha de descarga: ${new Date().toLocaleDateString()}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000062 00000 n \n0000000121 00000 n \n0000000281 00000 n \n0000000378 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n579\n%%EOF`;
    const blob = new Blob([pdfContent], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Descargando plantilla: ${filename}`)
  }

  // Real user debts state
  const [userDebts, setUserDebts] = useState<Protest[]>([])
  const [loadingDebts, setLoadingDebts] = useState(false)

  const isDebtorRole = session?.user.roles.includes("USER_DEBTOR")
  const isAnalystRole = session?.user.roles.includes("BANK_ANALYST")
  const isErpRole = session?.user.roles.includes("CCI_ADMIN") || session?.user.roles.includes("CCI_STAFF")

  useEffect(() => {
    if (isAuthenticated && session?.user.numeroDocumento && isDebtorRole) {
      Promise.resolve().then(() => setLoadingDebts(true))
      appService.getProtests({ documento: session.user.numeroDocumento })
        .then((data) => {
          setUserDebts(data)
        })
        .catch(() => {
          toast.error("Error al recuperar su estado de deudor.")
        })
        .finally(() => {
          setLoadingDebts(false)
        })
    }
  }, [isAuthenticated, session, isDebtorRole])

  // Get only active debts (VIGENTE)
  const activeDebts = userDebts.filter((d) => d.status === "VIGENTE")

  return (
    <div className="flex-1 bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-white py-20 sm:py-32">
        {/* Decorative background grid and gradient */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent opacity-70" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left Column: Text and CTAs */}
            <div className="flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 self-start">
                <Landmark className="size-3.5" />
                <span>Canal Institucional Oficial</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Gestión Digital de <span className="bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">Protestos y Moras</span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">
                La Cámara de Comercio de Ica pone a su disposición la plataforma digital oficial para la consulta, registro y regularización de protestos y títulos valores morosos de forma ágil y segura.
              </p>
              
              {/* Dynamic CTAs based on login state and roles */}
              <div className="flex flex-wrap gap-4 pt-2">
                {!isAuthenticated && (
                  <>
                    <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer" asChild>
                      <Link to="/register">
                        Crear Cuenta <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer" asChild>
                      <Link to="/login">
                        Iniciar Sesión
                      </Link>
                    </Button>
                  </>
                )}

                {isAuthenticated && isDebtorRole && (
                  <>
                    <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer" asChild>
                      <Link to="/usuario/solicitudes">
                        Mis Solicitudes <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer" asChild>
                      <Link to="/usuario/dashboard">
                        Mi Panel de Deudor
                      </Link>
                    </Button>
                  </>
                )}

                {isAuthenticated && isAnalystRole && (
                  <>
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer" asChild>
                      <Link to="/analista/cargar-excel">
                        Cargar Excel de Protestos <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer" asChild>
                      <Link to="/analista/dashboard">
                        Panel de Analista
                      </Link>
                    </Button>
                  </>
                )}

                {isAuthenticated && isErpRole && (
                  <>
                    <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer" asChild>
                      <Link to="/erp/solicitudes">
                        Bandeja de Solicitudes <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer" asChild>
                      <Link to="/erp/dashboard">
                        Dashboard ERP
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Session Card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-20 blur-lg" />
              
              {!isAuthenticated ? (
                /* Unauthenticated Default Mock Card */
                <Card className="relative overflow-hidden border border-slate-200 bg-white shadow-xl">
                  <div className="border-b bg-slate-50 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-red-500" />
                      <span className="size-2.5 rounded-full bg-yellow-500" />
                      <span className="size-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">CCI Ica · Vista de Consulta</span>
                  </div>
                  <CardContent className="p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Demostración</p>
                        <h4 className="text-xl font-bold text-slate-800">Regularizaciones en Curso</h4>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-100">DNI 10xxxxx5</span>
                    </div>
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                        <div className="flex items-center gap-2.5">
                          <FileText className="size-4 text-amber-600" />
                          <div>
                            <p className="font-semibold text-slate-800">Pagaré Nº 4022</p>
                            <p className="text-xs text-slate-400">Banco del Progreso</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">S/. 4,500.00</p>
                          <p className="text-xs font-semibold text-amber-600">En revisión CCI</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-800">Letra Nº 8902</p>
                            <p className="text-xs text-slate-400">Caja Rural Ica</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">S/. 1,200.00</p>
                          <p className="text-xs font-semibold text-emerald-600">Aprobada</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-emerald-800 flex items-start gap-2">
                      <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>Los trámites ingresados antes de las 13:00 hrs son procesados el mismo día hábil.</span>
                    </div>
                  </CardContent>
                </Card>
              ) : isDebtorRole ? (
                /* Authenticated Debtor Real-time Status Card */
                <Card className="relative overflow-hidden border border-slate-200 bg-white shadow-xl">
                  <div className="border-b bg-slate-50 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-xs font-semibold text-indigo-700">Sesión Activa</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {session?.user.tipoDocumento}: {session?.user.numeroDocumento}
                    </span>
                  </div>
                  <CardContent className="p-6 flex flex-col gap-5">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Usuario Conectado</p>
                      <h4 className="text-xl font-bold text-slate-800 truncate">{session?.user.name}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{session?.user.email}</p>
                    </div>

                    {loadingDebts ? (
                      <div className="space-y-2 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                      </div>
                    ) : activeDebts.length === 0 ? (
                      /* Clean Status View */
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 text-center flex flex-col items-center gap-2.5">
                        <CheckCircle2 className="size-8 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-emerald-950 text-sm">Estado Saneado</p>
                          <p className="text-xs text-emerald-800 mt-1">
                            Usted no registra protestos vigentes reportados ante la Cámara de Comercio de Ica.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Active Debts List View */
                      <div className="space-y-3.5">
                        <div className="rounded-lg border border-red-100 bg-red-50/40 p-3 flex items-start gap-2.5">
                          <ShieldAlert className="size-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-red-950">Atención: Protestos Registrados</p>
                            <p className="text-[11px] text-red-800 mt-0.5">
                              Posee {activeDebts.length} protesto(s) vigente(s) en la provincia de Ica.
                            </p>
                          </div>
                        </div>
                        <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                          {activeDebts.map((item) => (
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs" key={item.id}>
                              <div className="flex items-center gap-2">
                                <FileText className="size-3.5 text-amber-600 shrink-0" />
                                <div className="text-left">
                                  <p className="font-semibold text-slate-800 truncate max-w-[120px]">Protesto #{item.id}</p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.financialEntity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-slate-800">S/. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 cursor-pointer h-9" asChild>
                          <Link to="/usuario/dashboard">
                            Regularizar con Carta de Pago <ArrowRight className="ml-1.5 size-3" />
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* Formatos descargables requeridos */}
                    <div className="border-t border-slate-100 pt-4 mt-1 text-left">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Formatos Oficiales Requeridos</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadMockPDF("FUT_Levantamiento_Protesto.pdf", "FORMULARIO UNICO DE TRAMITE (FUT) - SOLICITUD DE LEVANTAMIENTO")}
                          className="h-8 text-[10px] font-semibold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download className="size-3 text-slate-500" />
                          Descargar FUT
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadMockPDF("Declaracion_Jurada_Pago_Deuda.pdf", "DECLARACION JURADA DE PAGO TOTAL DE DEUDA")}
                          className="h-8 text-[10px] font-semibold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download className="size-3 text-slate-500" />
                          Descargar DD.JJ.
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Authenticated Analyst / ERP Administrative User View */
                <Card className="relative overflow-hidden border border-slate-200 bg-white shadow-xl">
                  <div className="border-b bg-slate-50 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-700">Sesión Administrativa</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">CCI Ica</span>
                  </div>
                  <CardContent className="p-6 flex flex-col gap-6">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Usuario Activo</p>
                      <h4 className="text-xl font-bold text-slate-800 truncate">{session?.user.name}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{session?.user.email}</p>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Rol principal:</span>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 border border-indigo-100 uppercase tracking-wide text-[10px]">
                          {session?.user.roles[0]?.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Acceso:</span>
                        <span className="text-slate-700 font-medium">Permitido</span>
                      </div>
                    </div>

                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 cursor-pointer" asChild>
                      <Link to={isAnalystRole ? "/analista/dashboard" : "/erp/dashboard"}>
                        Ingresar al Panel de Gestión <ArrowUpRight className="ml-1.5 size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Benefits Section */}
      <section className="py-20 bg-slate-100/50 border-y">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center flex flex-col gap-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Un ecosistema conectado y confiable</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Nuestra plataforma conecta eficientemente a las partes implicadas para reducir los tiempos de trámite de semanas a pocas horas.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="p-6 pb-2">
                <div className="size-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <UserCheck className="size-5" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">Para Deudores y Firmantes</CardTitle>
              </div>
              <CardContent className="text-sm text-slate-600 leading-relaxed flex flex-col gap-2">
                <p>Realice consultas sobre su estado y presente sus solicitudes de levantamiento adjuntando cartas de pago en formato digital.</p>
                <p>Reciba alertas automáticas ante cambios en el estado de su trámite y mantenga su historial crediticio saneado.</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="p-6 pb-2">
                <div className="size-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                  <Building2 className="size-5" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">Para Entidades Financieras</CardTitle>
              </div>
              <CardContent className="text-sm text-slate-600 leading-relaxed flex flex-col gap-2">
                <p>Cargue reportes de protestos y moras mediante archivos Excel estructurados en segundos, eliminando papeleo físico.</p>
                <p>Verifique las solicitudes de levantamiento enviadas por deudores con acceso a los documentos digitalizados aportados.</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="p-6 pb-2">
                <div className="size-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <ShieldCheck className="size-5" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">Seguridad e Integridad</CardTitle>
              </div>
              <CardContent className="text-sm text-slate-600 leading-relaxed flex flex-col gap-2">
                <p>Toda acción cuenta con firmas y un registro de auditoría completo inmutable que garantiza la trazabilidad del proceso.</p>
                <p>Nuestra base de datos cumple con las regulaciones de la SBS y leyes de protección de datos personales vigentes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center flex flex-col gap-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">El Proceso de Levantamiento Digital</h2>
            <p className="text-slate-600">Siga estos sencillos pasos para regularizar su protesto en la Cámara de Comercio de Ica.</p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block" />
            <div className="grid gap-10 md:grid-cols-3 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-4 bg-white p-4">
                <div className="size-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold border-4 border-slate-50 relative z-10">
                  1
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Cree su Cuenta</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Regístrese de manera pública con su DNI, RUC o Carné de extranjería y complete su información básica.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-4 bg-white p-4">
                <div className="size-12 rounded-full bg-amber-600 text-white flex items-center justify-center text-lg font-bold border-4 border-amber-50 relative z-10">
                  2
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Adjunte Sustentos</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Seleccione el protesto detectado e ingrese la constancia de pago o carta de no adeudo en formato PDF o imagen.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-4 bg-white p-4">
                <div className="size-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold border-4 border-emerald-50 relative z-10">
                  3
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Validación Oficial</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  El personal de la Cámara y el banco validarán el sustento. Una vez aprobado, el protesto se levantará de inmediato.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-slate-50 border-t">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center flex flex-col gap-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Preguntas Frecuentes</h2>
            <p className="text-slate-600">Resolviendo sus dudas sobre la gestión de títulos valores y protestos en Ica.</p>
          </div>

          <div className="grid gap-6">
            <Card className="border border-slate-200">
              <div className="p-6 pb-2">
                <CardTitle className="text-base font-semibold flex items-start gap-2.5 text-slate-800">
                  <HelpCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  ¿Qué es un protesto y por qué aparece en el sistema?
                </CardTitle>
              </div>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                El protesto es un acto formal que acredita la falta de pago de un título valor (como un pagaré, letra de cambio o cheque). Las entidades bancarias y comerciales reportan estos eventos a la Cámara de Comercio de Ica para su registro en el Registro Nacional de Protestos y Moras.
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <div className="p-6 pb-2">
                <CardTitle className="text-base font-semibold flex items-start gap-2.5 text-slate-800">
                  <HelpCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  ¿Tiene algún costo realizar el levantamiento?
                </CardTitle>
              </div>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                La creación de su cuenta y el registro de la solicitud de levantamiento digital son servicios gratuitos. No obstante, las tasas administrativas de levantamiento de la Cámara de Comercio de Ica y posibles cobros bancarios aplican conforme al tarifario institucional vigente.
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <div className="p-6 pb-2">
                <CardTitle className="text-base font-semibold flex items-start gap-2.5 text-slate-800">
                  <HelpCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  ¿Cuánto tiempo tarda en reflejarse la regularización?
                </CardTitle>
              </div>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                Una vez cargada la solicitud con el comprobante de pago válido, el personal de la Cámara lo procesa y deriva a la entidad financiera en un plazo máximo de 24 horas hábiles. La entidad financiera tiene hasta 48 horas adicionales para validar el sustento en su sistema.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
