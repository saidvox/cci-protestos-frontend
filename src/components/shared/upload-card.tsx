import { useState, type FormEvent } from "react"
import { FileCheck2, FileUp, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export function UploadCard({ title, description, accept, onUpload, requestId }: { title: string; description: string; accept: string; onUpload: (file: File, requestId?: number) => Promise<void>; requestId?: boolean }) {
  const [file, setFile] = useState<File | null>(null); const [id, setId] = useState("1"); const [loading, setLoading] = useState(false); const [done, setDone] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); if (!file) return; if (file.size > MAX_UPLOAD_BYTES) { toast.error("El archivo supera el límite de 10 MB."); return } setLoading(true); setDone(false); try { await onUpload(file, requestId ? Number(id) : undefined); setDone(true); toast.success("Archivo recibido correctamente.") } catch { toast.error("No fue posible cargar el archivo.") } finally { setLoading(false) } }
  return <Card className="max-w-3xl"><CardHeader><div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-muted"><UploadCloud /></div><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><form id="upload-form" onSubmit={submit}><FieldGroup>{requestId ? <Field><FieldLabel htmlFor="request-id">ID de solicitud</FieldLabel><Input id="request-id" type="number" min="1" value={id} onChange={(event) => setId(event.target.value)} required /></Field> : null}<Field><FieldLabel htmlFor="file">Seleccionar archivo</FieldLabel><Input id="file" type="file" accept={accept} onChange={(event) => { setFile(event.target.files?.[0] ?? null); setDone(false) }} required aria-describedby="file-help" /><FieldDescription id="file-help">Tamaño máximo: 10 MB. No cargues información real.</FieldDescription></Field></FieldGroup>{done ? <Alert className="mt-5"><FileCheck2 /><AlertTitle>Archivo validado</AlertTitle><AlertDescription>{file?.name} fue registrado correctamente.</AlertDescription></Alert> : null}</form></CardContent><CardFooter className="justify-end"><Button form="upload-form" type="submit" disabled={!file || loading}><FileUp data-icon="inline-start" />{loading ? "Cargando..." : "Cargar archivo"}</Button></CardFooter></Card>
}
