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
  FileImage,
  Search,
  Filter,
  Upload,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Share,
  MessageSquare,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const estudiosData = [
  {
    id: "EST-001",
    paciente: "Juan Pérez García",
    edad: "45 años",
    tipoEstudio: "Radiografía de Tórax AP",
    modalidad: "Radiografía",
    fechaIngreso: "2025-01-02 09:30",
    fechaEstudio: "2025-01-02 10:00",
    medico: "Dr. Carlos Mendoza",
    prioridad: "Normal",
    estado: "Completado",
    urgente: false,
    tamaño: "2.4 MB",
  },
  {
    id: "EST-002",
    paciente: "María López Hernández",
    edad: "32 años",
    tipoEstudio: "Resonancia Magnética Cerebral",
    modalidad: "RM",
    fechaIngreso: "2025-01-02 08:15",
    fechaEstudio: "2025-01-02 11:30",
    medico: "Dra. Ana Rodríguez",
    prioridad: "Urgente",
    estado: "En Proceso",
    urgente: true,
    tamaño: "45.2 MB",
  },
  {
    id: "EST-003",
    paciente: "Carlos Rodríguez Sánchez",
    edad: "58 años",
    tipoEstudio: "Tomografía de Abdomen",
    modalidad: "TC",
    fechaIngreso: "2025-01-02 07:45",
    fechaEstudio: "2025-01-02 09:15",
    medico: "Dr. Luis García",
    prioridad: "Normal",
    estado: "Pendiente",
    urgente: false,
    tamaño: "78.9 MB",
  },
]

export function EstudiosMedicosPage() {
  const [selectedEstudio, setSelectedEstudio] = useState<any>(null)
  const [filtroModalidad, setFiltroModalidad] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Gestión de Estudios Médicos</h1>
            <p className="text-sm text-muted-foreground">Gestión y visualización de estudios radiológicos</p>
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
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Estudios</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <FileImage className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completados</p>
                    <p className="text-2xl font-bold">144</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles y Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Estudios</CardTitle>
                  <CardDescription>Visualiza, filtra y gestiona todos los estudios médicos</CardDescription>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Estudio
                </Button>
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
                <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las modalidades</SelectItem>
                    <SelectItem value="radiografia">Radiografía</SelectItem>
                    <SelectItem value="tc">Tomografía</SelectItem>
                    <SelectItem value="rm">Resonancia Magnética</SelectItem>
                    <SelectItem value="ecografia">Ecografía</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="proceso">En Proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Más Filtros
                </Button>
              </div>

              {/* Tabla de Estudios */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID / Paciente</TableHead>
                    <TableHead>Tipo de Estudio</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiosData.map((estudio) => (
                    <TableRow
                      key={estudio.id}
                      onClick={() => setSelectedEstudio(estudio)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{estudio.id}</p>
                          <p className="text-sm text-muted-foreground">{estudio.paciente}</p>
                          <p className="text-xs text-muted-foreground">{estudio.edad}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{estudio.tipoEstudio}</p>
                          <p className="text-xs text-muted-foreground">{estudio.tamaño}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{estudio.modalidad}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{estudio.fechaEstudio}</p>
                          <p className="text-xs text-muted-foreground">Ingreso: {estudio.fechaIngreso}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{estudio.medico}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {estudio.urgente && (
                            <Badge variant="destructive" className="w-fit">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Urgente
                            </Badge>
                          )}
                          <Badge
                            variant={
                              estudio.estado === "Completado"
                                ? "default"
                                : estudio.estado === "En Proceso"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="w-fit"
                          >
                            {estudio.estado}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
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
              {selectedEstudio && (
                <div className="mt-6 p-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Vista Detallada del Estudio</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedEstudio(null)}>
                      Cerrar Vista
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del Estudio */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Información del Estudio</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">ID:</span>
                            <p>{selectedEstudio.id}</p>
                          </div>
                          <div>
                            <span className="font-medium">Paciente:</span>
                            <p>{selectedEstudio.paciente}</p>
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span>
                            <p>{selectedEstudio.tipoEstudio}</p>
                          </div>
                          <div>
                            <span className="font-medium">Modalidad:</span>
                            <p>{selectedEstudio.modalidad}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fecha:</span>
                            <p>{selectedEstudio.fechaEstudio}</p>
                          </div>
                          <div>
                            <span className="font-medium">Médico:</span>
                            <p>{selectedEstudio.medico}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Acciones del Estudio */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Acciones Disponibles</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                          <a href="/ia/dicom">
                            <Eye className="w-4 h-4 mr-2" />
                            Abrir en Visor DICOM
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full bg-transparent" asChild>
                          <a href="/chat">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Analizar con IA
                          </a>
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <Share className="w-4 h-4 mr-2" />
                            Compartir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}
