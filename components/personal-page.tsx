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
import {
  UserCheck,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Activity,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const personalData = [
  {
    id: "EMP-001",
    nombre: "Dr. Carlos Mendoza",
    apellido: "Ramírez",
    puesto: "Radiólogo Senior",
    departamento: "Radiología",
    email: "carlos.mendoza@hospital.com",
    telefono: "+52 55 1234-5678",
    fechaIngreso: "2020-03-15",
    salario: 85000,
    estado: "Activo",
    turno: "Matutino",
    especialidad: "Radiología Intervencionista",
    cedula: "12345678",
    direccion: "Av. Reforma 123, CDMX",
    emergenciaContacto: "Ana Mendoza - +52 55 9876-5432",
    ultimaActividad: "2025-01-02 14:30",
  },
  {
    id: "EMP-002",
    nombre: "Enf. Ana Rodríguez",
    apellido: "López",
    puesto: "Enfermera Jefe",
    departamento: "Enfermería",
    email: "ana.rodriguez@hospital.com",
    telefono: "+52 55 2345-6789",
    fechaIngreso: "2019-08-22",
    salario: 45000,
    estado: "Activo",
    turno: "Vespertino",
    especialidad: "Cuidados Intensivos",
    cedula: "87654321",
    direccion: "Col. Roma Norte, CDMX",
    emergenciaContacto: "Luis Rodríguez - +52 55 8765-4321",
    ultimaActividad: "2025-01-02 16:45",
  },
  {
    id: "EMP-003",
    nombre: "Téc. Miguel García",
    apellido: "Hernández",
    puesto: "Técnico Radiólogo",
    departamento: "Radiología",
    email: "miguel.garcia@hospital.com",
    telefono: "+52 55 3456-7890",
    fechaIngreso: "2021-11-10",
    salario: 35000,
    estado: "Vacaciones",
    turno: "Nocturno",
    especialidad: "Tomografía",
    cedula: "11223344",
    direccion: "Polanco, CDMX",
    emergenciaContacto: "María García - +52 55 7654-3210",
    ultimaActividad: "2024-12-20 22:15",
  },
  {
    id: "EMP-004",
    nombre: "Adm. Laura Martínez",
    apellido: "Sánchez",
    puesto: "Coordinadora Administrativa",
    departamento: "Administración",
    email: "laura.martinez@hospital.com",
    telefono: "+52 55 4567-8901",
    fechaIngreso: "2018-05-03",
    salario: 55000,
    estado: "Activo",
    turno: "Matutino",
    especialidad: "Gestión Hospitalaria",
    cedula: "55667788",
    direccion: "Coyoacán, CDMX",
    emergenciaContacto: "Pedro Martínez - +52 55 6543-2109",
    ultimaActividad: "2025-01-02 17:00",
  },
]

export function PersonalPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [filtroDepartamento, setFiltroDepartamento] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">Activo</Badge>
      case "Vacaciones":
        return <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">Vacaciones</Badge>
      case "Licencia":
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">Licencia</Badge>
        )
      case "Inactivo":
        return <Badge variant="destructive">Inactivo</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getTotalSalarios = () => {
    return personalData.reduce((total, emp) => total + emp.salario, 0)
  }

  const getActiveEmployees = () => {
    return personalData.filter((emp) => emp.estado === "Activo").length
  }

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header - Responsive */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4 safe-area-top">
          <SidebarTrigger className="-ml-1 tap-target" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <h1 className="heading-responsive font-semibold text-foreground truncate">Gestión de Personal</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Administración de empleados y recursos humanos</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Hoy: 2 Enero, 2025
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Contenido Principal - Responsive */}
        <main className="flex-1 overflow-auto mobile-scroll spacing-responsive safe-area-bottom">
          {/* Estadísticas de Personal - Grid responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Empleados</p>
                    <p className="text-2xl font-bold text-foreground">{personalData.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Empleados Activos</p>
                    <p className="text-2xl font-bold text-foreground">{getActiveEmployees()}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Departamentos</p>
                    <p className="text-2xl font-bold text-foreground">4</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nómina Mensual</p>
                    <p className="text-2xl font-bold text-foreground">${getTotalSalarios().toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestión de Personal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Directorio de Personal</CardTitle>
                  <CardDescription>Gestiona la información de empleados y recursos humanos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Horarios
                  </Button>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Empleado
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                        <DialogDescription>Completa la información del nuevo miembro del personal</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input id="nombre" placeholder="Nombre completo" />
                        </div>
                        <div>
                          <Label htmlFor="apellido">Apellidos</Label>
                          <Input id="apellido" placeholder="Apellidos" />
                        </div>
                        <div>
                          <Label htmlFor="puesto">Puesto</Label>
                          <Input id="puesto" placeholder="Ej: Radiólogo Senior" />
                        </div>
                        <div>
                          <Label htmlFor="departamento">Departamento</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="radiologia">Radiología</SelectItem>
                              <SelectItem value="enfermeria">Enfermería</SelectItem>
                              <SelectItem value="administracion">Administración</SelectItem>
                              <SelectItem value="laboratorio">Laboratorio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="email">Email Corporativo</Label>
                          <Input id="email" type="email" placeholder="empleado@hospital.com" />
                        </div>
                        <div>
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input id="telefono" placeholder="+52 55 1234-5678" />
                        </div>
                        <div>
                          <Label htmlFor="cedula">Cédula Profesional</Label>
                          <Input id="cedula" placeholder="Número de cédula" />
                        </div>
                        <div>
                          <Label htmlFor="salario">Salario Mensual</Label>
                          <Input id="salario" type="number" placeholder="50000" />
                        </div>
                        <div>
                          <Label htmlFor="turno">Turno</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar turno" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="matutino">Matutino (7:00-15:00)</SelectItem>
                              <SelectItem value="vespertino">Vespertino (15:00-23:00)</SelectItem>
                              <SelectItem value="nocturno">Nocturno (23:00-7:00)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fecha-ingreso">Fecha de Ingreso</Label>
                          <Input id="fecha-ingreso" type="date" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="direccion">Dirección</Label>
                          <Input id="direccion" placeholder="Dirección completa" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="contacto-emergencia">Contacto de Emergencia</Label>
                          <Input id="contacto-emergencia" placeholder="Nombre - Teléfono" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="especialidad">Especialidad/Área</Label>
                          <Textarea id="especialidad" placeholder="Describe la especialidad o área de trabajo..." />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancelar
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddDialog(false)}>
                          Agregar Empleado
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, puesto o departamento..." className="pl-10" />
                  </div>
                </div>
                <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los departamentos</SelectItem>
                    <SelectItem value="radiologia">Radiología</SelectItem>
                    <SelectItem value="enfermeria">Enfermería</SelectItem>
                    <SelectItem value="administracion">Administración</SelectItem>
                    <SelectItem value="laboratorio">Laboratorio</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="vacaciones">Vacaciones</SelectItem>
                    <SelectItem value="licencia">Licencia</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Más Filtros
                </Button>
              </div>

              {/* Tabla responsive - Desktop */}
              <div className="hidden md:block">
                <div className="table-responsive">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Puesto</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                <TableBody>
                  {personalData.map((empleado) => (
                    <TableRow key={empleado.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                            <AvatarFallback>
                              {empleado.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {empleado.nombre} {empleado.apellido}
                            </p>
                            <p className="text-sm text-muted-foreground">{empleado.id}</p>
                            <p className="text-xs text-muted-foreground">Ingreso: {empleado.fechaIngreso}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{empleado.puesto}</p>
                          <p className="text-sm text-muted-foreground">{empleado.especialidad}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{empleado.departamento}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {empleado.telefono}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {empleado.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{empleado.turno}</p>
                      </TableCell>
                      <TableCell>{getEstadoBadge(empleado.estado)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(empleado)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Perfil del Empleado</DialogTitle>
                                <DialogDescription>
                                  Información detallada de {empleado.nombre} {empleado.apellido}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedEmployee && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2 text-foreground">Información Personal</h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>Nombre:</strong> {selectedEmployee.nombre} {selectedEmployee.apellido}
                                        </p>
                                        <p>
                                          <strong>ID:</strong> {selectedEmployee.id}
                                        </p>
                                        <p>
                                          <strong>Cédula:</strong> {selectedEmployee.cedula}
                                        </p>
                                        <p>
                                          <strong>Dirección:</strong> {selectedEmployee.direccion}
                                        </p>
                                        <p>
                                          <strong>Contacto Emergencia:</strong> {selectedEmployee.emergenciaContacto}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2 text-foreground">Información Laboral</h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>Puesto:</strong> {selectedEmployee.puesto}
                                        </p>
                                        <p>
                                          <strong>Departamento:</strong> {selectedEmployee.departamento}
                                        </p>
                                        <p>
                                          <strong>Especialidad:</strong> {selectedEmployee.especialidad}
                                        </p>
                                        <p>
                                          <strong>Turno:</strong> {selectedEmployee.turno}
                                        </p>
                                        <p>
                                          <strong>Fecha Ingreso:</strong> {selectedEmployee.fechaIngreso}
                                        </p>
                                        <p>
                                          <strong>Salario:</strong> ${selectedEmployee.salario.toLocaleString()}
                                        </p>
                                        <p>
                                          <strong>Última Actividad:</strong> {selectedEmployee.ultimaActividad}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Vista móvil - Cards */}
              <div className="md:hidden space-y-4">
                {personalData.map((empleado) => (
                  <Card key={empleado.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header del empleado */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                          <AvatarFallback>
                            {empleado.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {empleado.nombre} {empleado.apellido}
                          </h3>
                          <p className="text-sm text-muted-foreground">{empleado.puesto}</p>
                          <p className="text-xs text-muted-foreground">{empleado.id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {empleado.estado === "Activo" && (
                            <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs">Activo</Badge>
                          )}
                          {empleado.estado === "Vacaciones" && (
                            <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">Vacaciones</Badge>
                          )}
                          {empleado.estado === "Licencia" && (
                            <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs">Licencia</Badge>
                          )}
                          {empleado.estado === "Inactivo" && (
                            <Badge variant="destructive" className="text-xs">Inactivo</Badge>
                          )}
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Departamento</p>
                          <Badge variant="outline" className="text-xs">{empleado.departamento}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Turno</p>
                          <p className="text-foreground">{empleado.turno}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Teléfono</p>
                          <p className="text-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {empleado.telefono}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="text-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {empleado.email.length > 15 ? empleado.email.substring(0, 15) + '...' : empleado.email}
                          </p>
                        </div>
                      </div>

                      {/* Acciones móviles */}
                      <div className="flex justify-end gap-1 pt-2 border-t">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="tap-target" onClick={() => setSelectedEmployee(empleado)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalles del Empleado</DialogTitle>
                              <DialogDescription>Información completa del empleado seleccionado</DialogDescription>
                            </DialogHeader>
                            {selectedEmployee && (
                              <div className="grid gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2 text-foreground">Información Personal</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Nombre:</strong> {selectedEmployee.nombre} {selectedEmployee.apellido}</p>
                                      <p><strong>ID:</strong> {selectedEmployee.id}</p>
                                      <p><strong>Cédula:</strong> {selectedEmployee.cedula}</p>
                                      <p><strong>Dirección:</strong> {selectedEmployee.direccion}</p>
                                      <p><strong>Contacto Emergencia:</strong> {selectedEmployee.emergenciaContacto}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 text-foreground">Información Laboral</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Puesto:</strong> {selectedEmployee.puesto}</p>
                                      <p><strong>Departamento:</strong> {selectedEmployee.departamento}</p>
                                      <p><strong>Especialidad:</strong> {selectedEmployee.especialidad}</p>
                                      <p><strong>Turno:</strong> {selectedEmployee.turno}</p>
                                      <p><strong>Fecha Ingreso:</strong> {selectedEmployee.fechaIngreso}</p>
                                      <p><strong>Salario:</strong> ${selectedEmployee.salario.toLocaleString()}</p>
                                      <p><strong>Última Actividad:</strong> {selectedEmployee.ultimaActividad}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" className="tap-target">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="tap-target">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}
