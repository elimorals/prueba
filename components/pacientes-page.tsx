"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Plus, Calendar, Phone, Mail, MapPin, FileText, Activity } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const pacientesData = [
  {
    id: "PAC-001",
    nombre: "Juan Pérez García",
    edad: 45,
    genero: "Masculino",
    telefono: "+52 55 1234-5678",
    email: "juan.perez@email.com",
    direccion: "Av. Reforma 123, CDMX",
    fechaNacimiento: "1979-03-15",
    ultimaVisita: "2025-01-02",
    estudiosTotal: 8,
    estudiosRecientes: 2,
    condiciones: ["Hipertensión", "Diabetes Tipo 2"],
    estado: "Activo",
    seguro: "IMSS",
  },
  {
    id: "PAC-002",
    nombre: "María López Hernández",
    edad: 32,
    genero: "Femenino",
    telefono: "+52 55 9876-5432",
    email: "maria.lopez@email.com",
    direccion: "Col. Roma Norte, CDMX",
    fechaNacimiento: "1992-08-22",
    ultimaVisita: "2025-01-01",
    estudiosTotal: 3,
    estudiosRecientes: 1,
    condiciones: ["Migraña"],
    estado: "Activo",
    seguro: "Seguro Popular",
  },
  {
    id: "PAC-003",
    nombre: "Carlos Rodríguez Sánchez",
    edad: 58,
    genero: "Masculino",
    telefono: "+52 55 5555-1234",
    email: "carlos.rodriguez@email.com",
    direccion: "Polanco, CDMX",
    fechaNacimiento: "1966-12-10",
    ultimaVisita: "2024-12-28",
    estudiosTotal: 15,
    estudiosRecientes: 1,
    condiciones: ["Artritis", "Colesterol Alto"],
    estado: "Seguimiento",
    seguro: "Privado",
  },
]

export function PacientesPage() {
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null)

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Gestión de Pacientes</h1>
            <p className="text-sm text-muted-foreground">Administra la información de tus pacientes</p>
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
          {/* Estadísticas de Pacientes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nuevos Este Mes</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <Plus className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Citas Hoy</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Seguimiento</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestión de Pacientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Pacientes</CardTitle>
                  <CardDescription>Gestiona la información y historial de tus pacientes</CardDescription>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Paciente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, ID o teléfono..." className="pl-10" />
                  </div>
                </div>
                <Button variant="outline">Filtros Avanzados</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Información de Contacto</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Estudios</TableHead>
                    <TableHead>Condiciones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientesData.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                            <AvatarFallback>
                              {paciente.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{paciente.nombre}</p>
                            <p className="text-sm text-muted-foreground">{paciente.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {paciente.edad} años • {paciente.genero}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {paciente.telefono}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {paciente.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {paciente.direccion}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{paciente.ultimaVisita}</p>
                        <p className="text-xs text-muted-foreground">{paciente.seguro}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{paciente.estudiosTotal} total</p>
                          <p className="text-xs text-muted-foreground">{paciente.estudiosRecientes} recientes</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {paciente.condiciones.slice(0, 2).map((condicion, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condicion}
                            </Badge>
                          ))}
                          {paciente.condiciones.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{paciente.condiciones.length - 2} más</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paciente.estado === "Activo" ? "default" : "secondary"}>
                          {paciente.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPaciente(paciente)}>
                              <FileText className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Perfil del Paciente</DialogTitle>
                              <DialogDescription>Información detallada de {paciente.nombre}</DialogDescription>
                            </DialogHeader>
                            {selectedPaciente && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Información Personal</h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Nombre:</strong> {selectedPaciente.nombre}
                                      </p>
                                      <p>
                                        <strong>Edad:</strong> {selectedPaciente.edad} años
                                      </p>
                                      <p>
                                        <strong>Género:</strong> {selectedPaciente.genero}
                                      </p>
                                      <p>
                                        <strong>Fecha de Nacimiento:</strong> {selectedPaciente.fechaNacimiento}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Contacto</h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Teléfono:</strong> {selectedPaciente.telefono}
                                      </p>
                                      <p>
                                        <strong>Email:</strong> {selectedPaciente.email}
                                      </p>
                                      <p>
                                        <strong>Dirección:</strong> {selectedPaciente.direccion}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Historial Médico</h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Última Visita:</strong> {selectedPaciente.ultimaVisita}
                                      </p>
                                      <p>
                                        <strong>Total de Estudios:</strong> {selectedPaciente.estudiosTotal}
                                      </p>
                                      <p>
                                        <strong>Seguro:</strong> {selectedPaciente.seguro}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Condiciones Médicas</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedPaciente.condiciones.map((condicion: string, index: number) => (
                                        <Badge key={index} variant="outline">
                                          {condicion}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
