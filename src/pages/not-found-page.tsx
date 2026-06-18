import { CircleHelp } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function NotFoundPage() {
  return <main className="flex min-h-svh items-center justify-center p-6"><Empty><EmptyHeader><EmptyMedia variant="icon"><CircleHelp /></EmptyMedia><EmptyTitle>Página no encontrada</EmptyTitle><EmptyDescription>La ruta solicitada no existe.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild><Link to="/">Ir al inicio</Link></Button></EmptyContent></Empty></main>
}
