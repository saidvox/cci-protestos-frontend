import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { appService } from "@/services/service-factory"
import type { RequestRecord } from "@/types/domain"

export function RequestsPage() {
  const [items, setItems] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  useEffect(() => { appService.getRequests(true).then((page) => setItems(page.content)).catch(() => toast.error("No fue posible cargar las solicitudes.")).finally(() => setLoading(false)) }, [])
  const filtered = items.filter((item) => item.code.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <PageHeader title="Seguimiento de solicitudes" description="Consulta el estado y las observaciones de tus trámites." />
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1"><CardTitle>Mis solicitudes</CardTitle><CardDescription>Historial de trámites registrados.</CardDescription></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código o tipo" /></div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas">
            <TabsList><TabsTrigger value="todas">Todas</TabsTrigger><TabsTrigger value="activas">En proceso</TabsTrigger></TabsList>
            <TabsContent value="todas"><RequestTable items={filtered} loading={loading} /></TabsContent>
            <TabsContent value="activas"><RequestTable items={filtered.filter((item) => ["REGISTRADA", "EN_REVISION", "OBSERVADA"].includes(item.status))} loading={loading} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}

function RequestTable({ items, loading }: { items: RequestRecord[]; loading: boolean }) {
  if (loading) return <div className="flex flex-col gap-3 pt-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
  return <Table><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Estado</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.code}</TableCell><TableCell>{item.type}</TableCell><TableCell><StatusBadge status={item.status} /></TableCell><TableCell>{item.createdAt}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" aria-label={`Ver ${item.code}`}><Eye /></Button></TableCell></TableRow>)}</TableBody></Table>
}
