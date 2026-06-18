import { useEffect, useState } from "react"
import { toast } from "sonner"
import { History } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { AuditEntry } from "@/types/domain"

export function AuditPage() {
  const [items, setItems] = useState<AuditEntry[]>([])
  useEffect(() => { appService.getAudit().then((page) => setItems(page.content)).catch(() => toast.error("No fue posible cargar la auditoría.")) }, [])
  return <>
    <PageHeader title="Auditoría" description="Trazabilidad de acciones relevantes realizadas en el sistema." />
    <Card><CardHeader><CardTitle>Registro de actividad</CardTitle><CardDescription>Eventos ficticios para fines académicos.</CardDescription></CardHeader><CardContent>{items.length ? <Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Actor</TableHead><TableHead>Acción</TableHead><TableHead>Recurso</TableHead><TableHead>Detalle</TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.id}><TableCell className="whitespace-nowrap">{item.date}</TableCell><TableCell className="font-medium">{item.actor}</TableCell><TableCell>{item.action}</TableCell><TableCell>{item.resource}</TableCell><TableCell className="text-muted-foreground">{item.detail}</TableCell></TableRow>)}</TableBody></Table> : <Empty><EmptyHeader><EmptyMedia variant="icon"><History /></EmptyMedia><EmptyTitle>Sin actividad</EmptyTitle><EmptyDescription>No existen eventos para los filtros actuales.</EmptyDescription></EmptyHeader></Empty>}</CardContent></Card>
  </>
}
