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
  Package,
  Search,
  Filter,
  Plus,
  Calendar,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  TrendingDown,
  BarChart3,
  Download,
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

const inventarioData = [
  {
    id: "INV-001",
    nombre: "Contraste Iodado Omnipaque",
    categoria: "Medicamentos",
    stockActual: 45,
    stockMinimo: 20,
    stockMaximo: 100,
    unidad: "Viales",
    precio: 125.5,
    proveedor: "Bayer Healthcare",
    fechaVencimiento: "2025-08-15",
    ubicacion: "Almacén A - Estante 3",
    estado: "Disponible",
    ultimaActualizacion: "2025-01-02 09:30",
  },
  {
    id: "INV-002",
    nombre: "Placas Radiográficas 35x43cm",
    categoria: "Suministros",
    stockActual: 8,
    stockMinimo: 15,
    stockMaximo: 50,
    unidad: "Cajas",
    precio: 89.99,
    proveedor: "Kodak Medical",
    fechaVencimiento: "2026-12-31",
    ubicacion: "Almacén B - Estante 1",
    estado: "Stock Bajo",
    ultimaActualizacion: "2025-01-01 16:45",
  },
  {
    id: "INV-003",
    nombre: "Guantes Nitrilo Talla M",
    categoria: "Protección",
    stockActual: 0,
    stockMinimo: 10,
    stockMaximo: 30,
    unidad: "Cajas",
    precio: 24.75,
    proveedor: "3M Healthcare",
    fechaVencimiento: "2025-06-30",
    ubicacion: "Almacén A - Estante 1",
    estado: "Agotado",
    ultimaActualizacion: "2024-12-30 14:20",
  },
  {
    id: "INV-004",
    nombre: "Electrodos ECG Desechables",
    categoria: "Equipos Médicos",
    stockActual: 150,
    stockMinimo: 50,
    stockMaximo: 200,
    unidad: "Unidades",
    precio: 2.3,
    proveedor: "Philips Medical",
    fechaVencimiento: "2025-10-20",
    ubicacion: "Almacén C - Estante 2",
    estado: "Disponible",
    ultimaActualizacion: "2025-01-02 11:15",
  },
]

export function InventariosPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getEstadoBadge = (item: any) => {
    if (item.stockActual === 0) {
      return <Badge variant="destructive">Agotado</Badge>
    } else if (item.stockActual <= item.stockMinimo) {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">Stock Bajo</Badge>
      )
    } else {
      return <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">Disponible</Badge>
    }
  }

  const getTotalValue = () => {
    return inventarioData.reduce((total, item) => total + item.stockActual * item.precio, 0)
  }

  const getLowStockCount = () => {
    return inventarioData.filter((item) => item.stockActual <= item.stockMinimo).length
  }

  const getOutOfStockCount = () => {
    return inventarioData.filter((item) => item.stockActual === 0).length
  }

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Gestión de Inventarios</h1>
            <p className="text-sm text-muted-foreground">Control de stock y suministros médicos</p>
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
          {/* Estadísticas de Inventario */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">{inventarioData.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                    <p className="text-2xl font-bold text-foreground">{getLowStockCount()}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Agotados</p>
                    <p className="text-2xl font-bold text-foreground">{getOutOfStockCount()}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-foreground">${getTotalValue().toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestión de Inventario */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventario de Suministros</CardTitle>
                  <CardDescription>Gestiona el stock de medicamentos, equipos y suministros médicos</CardDescription>
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
                        Agregar Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Item al Inventario</DialogTitle>
                        <DialogDescription>Completa la información del nuevo suministro médico</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre del Producto</Label>
                          <Input id="nombre" placeholder="Ej: Contraste Iodado..." />
                        </div>
                        <div>
                          <Label htmlFor="categoria">Categoría</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medicamentos">Medicamentos</SelectItem>
                              <SelectItem value="suministros">Suministros</SelectItem>
                              <SelectItem value="equipos">Equipos Médicos</SelectItem>
                              <SelectItem value="proteccion">Protección</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="stock-actual">Stock Actual</Label>
                          <Input id="stock-actual" type="number" placeholder="0" />
                        </div>
                        <div>
                          <Label htmlFor="stock-minimo">Stock Mínimo</Label>
                          <Input id="stock-minimo" type="number" placeholder="10" />
                        </div>
                        <div>
                          <Label htmlFor="precio">Precio Unitario</Label>
                          <Input id="precio" type="number" step="0.01" placeholder="0.00" />
                        </div>
                        <div>
                          <Label htmlFor="unidad">Unidad de Medida</Label>
                          <Input id="unidad" placeholder="Ej: Viales, Cajas, Unidades" />
                        </div>
                        <div>
                          <Label htmlFor="proveedor">Proveedor</Label>
                          <Input id="proveedor" placeholder="Nombre del proveedor" />
                        </div>
                        <div>
                          <Label htmlFor="vencimiento">Fecha de Vencimiento</Label>
                          <Input id="vencimiento" type="date" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="ubicacion">Ubicación en Almacén</Label>
                          <Input id="ubicacion" placeholder="Ej: Almacén A - Estante 3" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                          <Textarea id="descripcion" placeholder="Información adicional del producto..." />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancelar
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddDialog(false)}>
                          Agregar al Inventario
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
                    <Input placeholder="Buscar por nombre, código o proveedor..." className="pl-10" />
                  </div>
                </div>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las categorías</SelectItem>
                    <SelectItem value="medicamentos">Medicamentos</SelectItem>
                    <SelectItem value="suministros">Suministros</SelectItem>
                    <SelectItem value="equipos">Equipos Médicos</SelectItem>
                    <SelectItem value="proteccion">Protección</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="bajo">Stock Bajo</SelectItem>
                    <SelectItem value="agotado">Agotado</SelectItem>
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
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventarioData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.nombre}</p>
                          <p className="text-sm text-muted-foreground">{item.id}</p>
                          <p className="text-xs text-muted-foreground">{item.ubicacion}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.stockActual} {item.unidad}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Min: {item.stockMinimo} | Max: {item.stockMaximo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">${item.precio}</p>
                          <p className="text-xs text-muted-foreground">
                            Total: ${(item.stockActual * item.precio).toFixed(2)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{item.proveedor}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{item.fechaVencimiento}</p>
                      </TableCell>
                      <TableCell>{getEstadoBadge(item)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
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
