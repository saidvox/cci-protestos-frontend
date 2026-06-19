import { useEffect, useState } from "react"
import { Calendar, Coins, FileSearch, Filter, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { appService } from "@/services/service-factory"
import type { Protest } from "@/types/domain"

export function ProtestQueryPage() {
  const [allProtests, setAllProtests] = useState<Protest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Filters
  const [searchDoc, setSearchDoc] = useState("")
  const [searchName, setSearchName] = useState("")
  const [filterStatus, setFilterStatus] = useState("TODOS")

  // Load all protests on mount
  useEffect(() => {
    appService.getProtests()
      .then((data) => {
        setAllProtests(data)
      })
      .catch(() => {
        setError(true)
        toast.error("No se pudo cargar el listado de protestos.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Compute filtered protests on render
  let filteredProtests = allProtests
  if (searchDoc.trim()) {
    const docLower = searchDoc.toLowerCase()
    filteredProtests = filteredProtests.filter(p => p.documentNumber.toLowerCase().includes(docLower))
  }
  if (searchName.trim()) {
    const nameLower = searchName.toLowerCase()
    filteredProtests = filteredProtests.filter(p => p.debtorName.toLowerCase().includes(nameLower))
  }
  if (filterStatus !== "TODOS") {
    filteredProtests = filteredProtests.filter(p => p.status === filterStatus)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Registro Nacional de Protestos"
        description="Consulta y administra los deudores con protestos vigentes y regularizados."
      />

      {/* Main workspace card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Directorio de Deudas</CardTitle>
              <CardDescription className="text-xs">
                {filteredProtests.length} registro(s) encontrado(s) en la base de datos de la Cámara.
              </CardDescription>
            </div>
          </div>

          {/* Compact Reactive Filter Bar (Horizontal Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
            <div className="sm:col-span-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por DNI o RUC..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            
            <div className="sm:col-span-5 relative">
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por Razón Social o Nombre..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="sm:col-span-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="VIGENTE">Vigente</SelectItem>
                  <SelectItem value="REGULARIZADO">Regularizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-48 w-full animate-pulse" />
            </div>
          ) : error ? (
            <div className="p-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileSearch />
                  </EmptyMedia>
                  <EmptyTitle>No se pudo cargar la información</EmptyTitle>
                  <EmptyDescription>
                    Ocurrió un error al consultar el registro de protestos.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : filteredProtests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Ningún deudor coincide con los parámetros de búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="font-semibold text-slate-700">Documento</TableHead>
                    <TableHead className="font-semibold text-slate-700">Deudor / Razón Social</TableHead>
                    <TableHead className="font-semibold text-slate-700">Entidad Acreedora</TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Registrado</span>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Plazo / Vencimiento</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      <span className="flex items-center gap-1 justify-end"><Coins className="h-3.5 w-3.5" /> Monto</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProtests.map((item) => {
                    // Compute mock due date (30 days after registration date)
                    const regDate = new Date(item.registeredAt)
                    regDate.setDate(regDate.getDate() + 30)
                    const dueDateString = regDate.toISOString().split("T")[0]

                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.documentNumber}</TableCell>
                        <TableCell className="text-xs font-semibold text-slate-900">{item.debtorName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{item.financialEntity}</TableCell>
                        <TableCell className="text-xs text-slate-500">{item.registeredAt}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {dueDateString} 
                          {item.status === "VIGENTE" && (
                            <span className="ml-1.5 text-[10px] text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded px-1 py-0.5">
                              Pendiente
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "VIGENTE" ? "destructive" : "secondary"}
                            className="text-[10px] font-semibold uppercase"
                          >
                            {item.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 text-xs">
                          S/. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
