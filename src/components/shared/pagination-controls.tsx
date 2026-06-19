import { Button } from "@/components/ui/button"
import type { Page } from "@/types/domain"
export function PaginationControls({ page, onPageChange }: { page: Pick<Page<unknown>, "page" | "totalPages" | "totalElements">; onPageChange: (page: number) => void }) {
  if (page.totalPages <= 1) return null
  return <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Paginación"><p className="text-sm text-muted-foreground">Página {page.page + 1} de {page.totalPages} · {page.totalElements} registros</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page.page === 0} onClick={() => onPageChange(page.page - 1)}>Anterior</Button><Button type="button" variant="outline" size="sm" disabled={page.page + 1 >= page.totalPages} onClick={() => onPageChange(page.page + 1)}>Siguiente</Button></div></nav>
}
