"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  FileText,
  Search,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Share,
  Filter,
  BarChart3,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const reportesData = [
  {
    id: "REP-001",
    paciente: "Juan Pérez García",
    tipoEstudio: "Radiografía de Tórax AP",
    fechaGeneracion: "2025-01-02 14:30",
    medico: "Dr. Carlos Mendoza",
    estado: "Firmado",
    prioridad: "Normal",
    confianzaIA: 94,
    tiempoGeneracion: "2:15 min",
    hallazgos: "Sin alteraciones patológicas evidentes",
    reporte: `REPORTE RADIOLÓGICO

Paciente: Juan Pérez García
Fecha del estudio: 2025-01-02
Modalidad: Radiografía de Tórax AP

TÉCNICA:
Estudio realizado con técnica estándar en proyecciones anteroposterior.

HALLAZGOS:
- Campos pulmonares con adecuada expansión bilateral
- Silueta cardiomediastinal dentro de límites normales
- No se observan infiltrados ni consolidaciones
- Estructuras óseas sin alteraciones evidentes

IMPRESIÓN DIAGNÓSTICA:
Estudio radiológico de tórax sin alteraciones patológicas evidentes.

RECOMENDACIONES:
- Correlación clínica
- Control evolutivo según criterio médico

Dr. Carlos Mendoza
Radiólogo Certificado`,
  },
  {
    id: "REP-002",
    paciente: "María López Hernández",
    tipoEstudio: "Resonancia Magnética Cerebral",
    fechaGeneracion: "2025-01-02 11:45",
    medico: "Dra. Ana Rodríguez",
    estado: "Pendiente Revisión",
    prioridad: "Urgente",
    confianzaIA: 87,
    tiempoGeneracion: "4:32 min",
    hallazgos: "Posible lesión en lóbulo frontal izquierdo",
    reporte: `REPORTE DE RESONANCIA MAGNÉTICA CEREBRAL

Paciente: María López Hernández
Fecha del estudio: 2025-01-02
Modalidad: RM Cerebral con contraste

TÉCNICA:
Secuencias T1, T2, FLAIR y DWI en planos axial, coronal y sagital.

HALLAZGOS:
- Se observa una lesión hiperintensa en T2 en el lóbulo frontal izquierdo
- Dimensiones aproximadas: 1.2 x 0.8 cm
- Sin efecto de masa significativo
- Resto de estructuras cerebrales sin alteraciones

IMPRESIÓN DIAGNÓSTICA:
Lesión focal en lóbulo frontal izquierdo. Se sugiere correlación clínica y seguimiento.

RECOMENDACIONES:
- Evaluación neurológica
- Considerar biopsia según criterio clínico

Dra. Ana Rodríguez
Neurorradióloga`,
  },
]

export function ReportesPage() {
  const [selectedReporte, setSelectedReporte] = useState<any>(null)
  const [filtroEstado, setFiltroEstado] = useState("todos")

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Reportes Médicos</h1>
            <p className="text-sm text-muted-foreground">Gestión y análisis de reportes generados por IA</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Hoy: 2 Enero, 2025
            </Button>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-auto p-6">
          {/* Estadísticas de Reportes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reportes</p>
                    <p className="text-2xl font-bold">342</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Firmados</p>
                    <p className="text-2xl font-bold">298</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold">44</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confianza IA Promedio</p>
                    <p className="text-2xl font-bold">91%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestión de Reportes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reportes Generados</CardTitle>
                  <CardDescription>Visualiza y gestiona todos los reportes médicos generados por IA</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Estadísticas
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por paciente, ID o tipo de estudio..." className="pl-10" />
                  </div>
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="firmado">Firmados</SelectItem>
                    <SelectItem value="pendiente">Pendiente Revisión</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Más Filtros
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID / Paciente</TableHead>
                    <TableHead>Tipo de Estudio</TableHead>
                    <TableHead>Fecha Generación</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>IA / Tiempo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportesData.map((reporte) => (
                    <TableRow key={reporte.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reporte.id}</p>
                          <p className="text-sm text-muted-foreground">{reporte.paciente}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reporte.tipoEstudio}</p>
                          <p className="text-xs text-muted-foreground">{reporte.hallazgos}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reporte.fechaGeneracion}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reporte.medico}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">{reporte.confianzaIA}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{reporte.tiempoGeneracion}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {reporte.prioridad === "Urgente" && (
                            <Badge variant="destructive" className="w-fit">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Urgente
                            </Badge>
                          )}
                          <Badge
                            variant={
                              reporte.estado === "Firmado"
                                ? "default"
                                : reporte.estado === "Pendiente Revisión"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="w-fit"
                          >
                            {reporte.estado}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedReporte(reporte)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                              <DialogHeader>
                                <DialogTitle>Reporte Médico - {reporte.id}</DialogTitle>
                                <DialogDescription>
                                  {reporte.paciente} • {reporte.tipoEstudio}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedReporte && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                                    <div>
                                      <p className="text-sm font-medium">Confianza IA</p>
                                      <p className="text-lg font-bold text-green-600">{selectedReporte.confianzaIA}%</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Tiempo de Generación</p>
                                      <p className="text-lg font-bold">{selectedReporte.tiempoGeneracion}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Estado</p>
                                      <Badge className="mt-1">{selectedReporte.estado}</Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Reporte Completo</h4>
                                    <Textarea
                                      value={selectedReporte.reporte}
                                      readOnly
                                      className="min-h-[400px] font-mono text-sm"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">
                                      <Download className="w-4 h-4 mr-2" />
                                      Descargar PDF
                                    </Button>
                                    <Button variant="outline">
                                      <Share className="w-4 h-4 mr-2" />
                                      Compartir
                                    </Button>
                                    {selectedReporte.estado !== "Firmado" && (
                                      <Button className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Firmar Reporte
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}
