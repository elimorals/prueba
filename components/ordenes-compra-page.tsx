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
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  DollarSign,
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

const ordenesData = [
  {
    id: "OC-001",
    proveedor: "Bayer Healthcare",
    fechaCreacion: "2025-01-02",
    fechaEntrega: "2025-01-15",
    estado: "Pendiente Aprobación",
    prioridad: "Normal",
    total: 15750.0,
    items: [
      { producto: "Contraste Iodado Omnipaque", cantidad: 50, precio: 125.5 },
      { producto: "Jeringas 20ml", cantidad: 200, precio: 2.5 },
      { producto: "Agujas 21G", cantidad: 100, precio: 1.25 },
    ],
    solicitante: "Dr. Carlos Mendoza",
    departamento: "Radiología",
    observaciones: "Urgente para procedimientos de la próxima semana",
    contactoProveedor: "ventas@bayer.com",
    telefonoProveedor: "+52 55 1234-5678",
  },
  {
    id: "OC-002",
    proveedor: "3M Healthcare",
    fechaCreacion: "2025-01-01",
    fechaEntrega: "2025-01-10",
    estado: "Aprobada",
    prioridad: "Alta",
    total: 8950.0,
    items: [
      { producto: "Guantes Nitrilo Talla M", cantidad: 50, precio: 24.75 },
      { producto: "Mascarillas N95", cantidad: 200, precio: 3.5 },
      { producto: "Batas Quirúrgicas", cantidad: 100, precio: 15.0 },
    ],
    solicitante: "Enf. Ana Rodríguez",
    departamento: "Enfermería",
    observaciones: "Reposición de stock de protección personal",
    contactoProveedor: "pedidos@3m.com",
    telefonoProveedor: "+52 55 2345-6789",
  },
  {
    id: "OC-003",
    proveedor: "Philips Medical",
    fechaCreacion: "2024-12-28",
    fechaEntrega: "2025-01-05",
    estado: "Entregada",
    prioridad: "Normal",
    total: 25600.0,
    items: [
      { producto: "Electrodos ECG", cantidad: 500, precio: 2.3 },
      { producto: "Cables de Monitoreo", cantidad: 20, precio: 85.0 },
      { producto: "Sensores de Oximetría", cantidad: 30, precio: 45.0 },
    ],
    solicitante: "Téc. Miguel García",
    departamento: "Cardiología",
    observaciones: "Mantenimiento preventivo de equipos",
    contactoProveedor: "soporte@philips.com",
    telefonoProveedor: "+52 55 3456-7890",
  },
  {
    id: "OC-004",
    proveedor: "Kodak Medical",
    fechaCreacion: "2025-01-02",
    fechaEntrega: "2025-01-20",
    estado: "Rechazada",
    prioridad: "Baja",
    total: 4500.0,
    items: [
      { producto: "Placas Radiográficas 35x43cm", cantidad: 10, precio: 89.99 },
      { producto: "Químicos Revelado", cantidad: 5, precio: 125.0 },
      { producto: "Película Dental", cantidad: 20, precio: 15.5 },
    ],
    solicitante: "Dr. Luis Pérez",
    departamento: "Radiología",
    observaciones: "Presupuesto excedido para este mes",
    contactoProveedor: "ventas@kodak.com",
    telefonoProveedor: "+52 55 4567-8901",
  },
]

export function OrdenesCompraPage() {
  const [selectedOrden, setSelectedOrden] = useState<any>(null)
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroProveedor, setFiltroProveedor] = useState("todos")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente Aprobación":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
            Pendiente Aprobación
          </Badge>
        )
      case "Aprobada":
        return <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">Aprobada</Badge>
      case "Entregada":
        return <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">Entregada</Badge>
      case "Rechazada":
        return <Badge variant="destructive">Rechazada</Badge>
      case "Cancelada":
        return <Badge variant="outline">Cancelada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return <Badge variant="destructive">Alta</Badge>
      case "Normal":
        return <Badge variant="outline">Normal</Badge>
      case "Baja":
        return <Badge className="bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300">Baja</Badge>
      default:
        return <Badge variant="outline">{prioridad}</Badge>
    }
  }

  const getTotalOrdenes = () => {
    return ordenesData.reduce((total, orden) => total + orden.total, 0)
  }

  const getOrdenesPendientes = () => {
    return ordenesData.filter((orden) => orden.estado === "Pendiente Aprobación").length
  }

  const getOrdenesAprobadas = () => {
    return ordenesData.filter((orden) => orden.estado === "Aprobada").length
  }

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Órdenes de Compra</h1>
            <p className="text-sm text-muted-foreground">Gestión de pedidos y compras hospitalarias</p>
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
          {/* Estadísticas de Órdenes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                    <p className="text-2xl font-bold text-foreground">{ordenesData.length}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold text-foreground">{getOrdenesPendientes()}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aprobadas</p>
                    <p className="text-2xl font-bold text-foreground">{getOrdenesAprobadas()}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-foreground">${getTotalOrdenes().toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestión de Órdenes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Órdenes de Compra</CardTitle>
                  <CardDescription>Gestiona pedidos, aprobaciones y seguimiento de compras</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Orden
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Orden de Compra</DialogTitle>
                        <DialogDescription>
                          Completa la información para generar una nueva orden de compra
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="proveedor">Proveedor</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bayer">Bayer Healthcare</SelectItem>
                              <SelectItem value="3m">3M Healthcare</SelectItem>
                              <SelectItem value="philips">Philips Medical</SelectItem>
                              <SelectItem value="kodak">Kodak Medical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="departamento">Departamento Solicitante</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="radiologia">Radiología</SelectItem>
                              <SelectItem value="enfermeria">Enfermería</SelectItem>
                              <SelectItem value="cardiologia">Cardiología</SelectItem>
                              <SelectItem value="laboratorio">Laboratorio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="solicitante">Solicitante</Label>
                          <Input id="solicitante" placeholder="Nombre del solicitante" />
                        </div>
                        <div>
                          <Label htmlFor="fecha-entrega">Fecha de Entrega Requerida</Label>
                          <Input id="fecha-entrega" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="prioridad">Prioridad</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="observaciones">Observaciones</Label>
                          <Textarea id="observaciones" placeholder="Notas adicionales sobre la orden..." />
                        </div>
                        <div className="col-span-2">
                          <Label>Items de la Orden</Label>
                          <div className="border rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                              <span>Producto</span>
                              <span>Cantidad</span>
                              <span>Precio Unit.</span>
                              <span>Total</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <Input placeholder="Nombre del producto" />
                              <Input type="number" placeholder="1" />
                              <Input type="number" step="0.01" placeholder="0.00" />
                              <Input placeholder="$0.00" disabled />
                            </div>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Item
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancelar
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddDialog(false)}>
                          Crear Orden
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
                    <Input placeholder="Buscar por ID, proveedor o solicitante..." className="pl-10" />
                  </div>
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente Aprobación</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="entregada">Entregada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroProveedor} onValueChange={setFiltroProveedor}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los proveedores</SelectItem>
                    <SelectItem value="bayer">Bayer Healthcare</SelectItem>
                    <SelectItem value="3m">3M Healthcare</SelectItem>
                    <SelectItem value="philips">Philips Medical</SelectItem>
                    <SelectItem value="kodak">Kodak Medical</SelectItem>
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
                    <TableHead>Orden</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Fecha Entrega</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenesData.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{orden.id}</p>
                          <p className="text-sm text-muted-foreground">{orden.fechaCreacion}</p>
                          <div className="flex items-center gap-1 mt-1">{getPrioridadBadge(orden.prioridad)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{orden.proveedor}</p>
                          <p className="text-sm text-muted-foreground">{orden.contactoProveedor}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{orden.solicitante}</p>
                          <p className="text-sm text-muted-foreground">{orden.departamento}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{orden.fechaEntrega}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">${orden.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{orden.items.length} items</p>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedOrden(orden)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Detalle de Orden de Compra - {orden.id}</DialogTitle>
                                <DialogDescription>
                                  {orden.proveedor} • Solicitado por {orden.solicitante}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedOrden && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                      <div className="mt-1">{getEstadoBadge(selectedOrden.estado)}</div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Prioridad</p>
                                      <div className="mt-1">{getPrioridadBadge(selectedOrden.prioridad)}</div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                                      <p className="text-lg font-bold text-foreground">
                                        ${selectedOrden.total.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-medium mb-3 text-foreground">Información de la Orden</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">ID Orden:</span>
                                          <span className="font-medium text-foreground">{selectedOrden.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Fecha Creación:</span>
                                          <span className="text-foreground">{selectedOrden.fechaCreacion}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Fecha Entrega:</span>
                                          <span className="text-foreground">{selectedOrden.fechaEntrega}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Solicitante:</span>
                                          <span className="text-foreground">{selectedOrden.solicitante}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Departamento:</span>
                                          <span className="text-foreground">{selectedOrden.departamento}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-3 text-foreground">Información del Proveedor</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Proveedor:</span>
                                          <span className="font-medium text-foreground">{selectedOrden.proveedor}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Email:</span>
                                          <span className="text-foreground">{selectedOrden.contactoProveedor}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Teléfono:</span>
                                          <span className="text-foreground">{selectedOrden.telefonoProveedor}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-3 text-foreground">Items de la Orden</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Producto</TableHead>
                                          <TableHead>Cantidad</TableHead>
                                          <TableHead>Precio Unit.</TableHead>
                                          <TableHead>Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedOrden.items.map((item: any, index: number) => (
                                          <TableRow key={index}>
                                            <TableCell className="font-medium">{item.producto}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                            <TableCell>${item.precio}</TableCell>
                                            <TableCell>${(item.cantidad * item.precio).toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  {selectedOrden.observaciones && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-foreground">Observaciones</h4>
                                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                        {selectedOrden.observaciones}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">
                                      <Download className="w-4 h-4 mr-2" />
                                      Descargar PDF
                                    </Button>
                                    {selectedOrden.estado === "Pendiente Aprobación" && (
                                      <>
                                        <Button variant="destructive">Rechazar</Button>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Aprobar
                                        </Button>
                                      </>
                                    )}
                                    {selectedOrden.estado === "Aprobada" && (
                                      <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar a Proveedor
                                      </Button>
                                    )}
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
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}
