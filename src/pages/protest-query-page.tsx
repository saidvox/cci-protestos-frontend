import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { FileSearch, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { Protest } from "@/types/domain"

export function ProtestQueryPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Protest[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function search(event: FormEvent) {
    event.preventDefault(); setLoading(true)
    try { setResults(await appService.getProtests(query)) } catch { setResults([]); toast.error("No fue posible consultar los protestos.") } finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader title="Consulta de protestos" description="Busca registros por número de documento o nombre del deudor." />
      <Card>
        <CardHeader><CardTitle>Parámetros de búsqueda</CardTitle><CardDescription>Los datos mostrados en esta versión son ficticios.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={search} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <FieldGroup className="flex-1 sm:grid sm:grid-cols-2">
              <Field><FieldLabel htmlFor="query">Documento o razón social</FieldLabel><Input id="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. 20123456789" /></Field>
            </FieldGroup>
            <Button type="submit"><Search data-icon="inline-start" />Consultar</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Resultados</CardTitle><CardDescription>{results ? `${results.length} registro(s) encontrado(s)` : "Realiza una consulta para mostrar resultados."}</CardDescription></CardHeader>
        <CardContent>
          {loading ? <div className="flex flex-col gap-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : results?.length ? (
            <Table><TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Deudor</TableHead><TableHead>Entidad</TableHead><TableHead>Monto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>{results.map((item) => <TableRow key={item.id}><TableCell>{item.documentNumber}</TableCell><TableCell className="font-medium">{item.debtorName}</TableCell><TableCell>{item.financialEntity}</TableCell><TableCell>S/ {item.amount.toLocaleString("es-PE")}</TableCell><TableCell><Badge variant={item.status === "VIGENTE" ? "destructive" : "secondary"}>{item.status === "VIGENTE" ? "Vigente" : "Regularizado"}</Badge></TableCell></TableRow>)}</TableBody>
            </Table>
          ) : <Empty><EmptyHeader><EmptyMedia variant="icon"><FileSearch /></EmptyMedia><EmptyTitle>{results ? "Sin coincidencias" : "Consulta pendiente"}</EmptyTitle><EmptyDescription>{results ? "Prueba con otro documento o nombre." : "Completa los parámetros y selecciona Consultar."}</EmptyDescription></EmptyHeader></Empty>}
        </CardContent>
      </Card>
    </>
  )
}
