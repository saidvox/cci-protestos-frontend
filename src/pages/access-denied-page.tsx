import { ShieldX } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function AccessDeniedPage() {
  return (
    <Empty className="min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon"><ShieldX /></EmptyMedia>
        <EmptyTitle>Acceso restringido</EmptyTitle>
        <EmptyDescription>Tu rol no tiene permisos para consultar este módulo.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent><Button asChild><Link to="/">Volver al dashboard</Link></Button></EmptyContent>
    </Empty>
  )
}
