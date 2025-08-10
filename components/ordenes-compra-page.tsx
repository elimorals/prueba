"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"

// Tipos para órdenes
interface OrdenCompra {
  id: string
  numero_orden: string
  proveedor: string
  fecha_orden: string
  fecha_entrega_esperada?: string
  estado: string
  total_orden: number
  iva?: number
  total_con_iva?: number
  solicitado_por: string
  aprobado_por?: string
  observaciones?: string
  created_at: string
  updated_at: string
}

interface Estadisticas {
  total_ordenes: number
  pendientes: number
  aprobadas: number
  enviadas: number
  recibidas: number
  canceladas: number
  valor_total_pendientes: number
  valor_total_aprobadas: number
  valor_total_general: number
}

// URL de la API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ordenesDataStatic = [
  {
    id: "OC-001",
    numero_orden: "OC-001",
    proveedor: "Bayer Healthcare",
    fecha_orden: "2025-01-02",
    fecha_entrega_esperada: "2025-01-15",
    estado: "Pendiente Aprobacion",
    total_orden: 15750.0,
    solicitado_por: "Dr. Carlos Mendoza",
    observaciones: "Urgente para procedimientos de la próxima semana",
    created_at: "2025-01-02",
    updated_at: "2025-01-02"
  },
  {
    id: "OC-002",
    numero_orden: "OC-002",
    proveedor: "3M Healthcare",
    fecha_orden: "2025-01-01",
    fecha_entrega_esperada: "2025-01-10",
    estado: "Aprobada",
    total_orden: 8950.0,
    solicitado_por: "Enf. Ana Rodriguez",
    observaciones: "Reposición de stock de protección personal",
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: "OC-003",
    numero_orden: "OC-003",
    proveedor: "Philips Medical",
    fecha_orden: "2024-12-28",
    fecha_entrega_esperada: "2025-01-05",
    estado: "Entregada",
    total_orden: 25600.0,
    solicitado_por: "Tec. Miguel Garcia",
    observaciones: "Mantenimiento preventivo de equipos",
    created_at: "2024-12-28",
    updated_at: "2024-12-28"
  },
]

export function OrdenesCompraPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_ordenes: 0,
    pendientes: 0,
    aprobadas: 0,
    enviadas: 0,
    recibidas: 0,
    canceladas: 0,
    valor_total_pendientes: 0,
    valor_total_aprobadas: 0,
    valor_total_general: 0
  })
  const [selectedOrden, setSelectedOrden] = useState<OrdenCompra | null>(null)
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroProveedor, setFiltroProveedor] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  
  // Estados para formulario de nueva orden
  const [formData, setFormData] = useState({
    proveedor: "",
    fecha_orden: new Date().toISOString().split('T')[0],
    fecha_entrega_esperada: "",
    solicitado_por: "",
    observaciones: "",
    detalles: [
      {
        item_id: "",
        producto_nombre: "",
        cantidad: 1,
        precio_unitario: 0
      }
    ]
  })

  // Funciones de API
  const fetchOrdenes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado)
      if (filtroProveedor !== 'todos') params.append('proveedor', filtroProveedor)
      
      const response = await fetch(`${API_BASE}/api/v1/ordenes?${params}`)
      const data = await response.json()
      
      if (data.items) {
        setOrdenes(data.items)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Error fetching ordenes:', error)
      toast.error('Error al cargar ordenes')
      setOrdenes(ordenesDataStatic)
    } finally {
      setLoading(false)
    }
  }

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/ordenes/estadisticas`)
      const data = await response.json()
      
      if (data) {
        setEstadisticas(data)
      }
    } catch (error) {
      console.error('Error fetching estadisticas:', error)
      // Calcular estadísticas desde datos estáticos
      const total = ordenesDataStatic.length
      const pendientes = ordenesDataStatic.filter(o => o.estado === "Pendiente Aprobacion").length
      const aprobadas = ordenesDataStatic.filter(o => o.estado === "Aprobada").length
      const valorTotal = ordenesDataStatic.reduce((sum, o) => sum + o.total_orden, 0)
      
      setEstadisticas({
        total_ordenes: total,
        pendientes: pendientes,
        aprobadas: aprobadas,
        enviadas: 0,
        recibidas: ordenesDataStatic.filter(o => o.estado === "Entregada").length,
        canceladas: ordenesDataStatic.filter(o => o.estado === "Rechazada").length,
        valor_total_pendientes: ordenesDataStatic.filter(o => o.estado === "Pendiente Aprobacion").reduce((sum, o) => sum + o.total_orden, 0),
        valor_total_aprobadas: ordenesDataStatic.filter(o => o.estado === "Aprobada").reduce((sum, o) => sum + o.total_orden, 0),
        valor_total_general: valorTotal
      })
    }
  }

  const handleDeleteOrden = async (ordenId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/ordenes/${ordenId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Orden eliminada exitosamente')
        fetchOrdenes()
        fetchEstadisticas()
      } else {
        toast.error(result.message || 'Error al eliminar orden')
      }
    } catch (error) {
      console.error('Error deleting orden:', error)
      toast.error('Error al eliminar orden')
    }
  }

  const handleCreateOrden = async () => {
    if (!formData.proveedor || !formData.solicitado_por) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    if (formData.detalles.length === 0 || formData.detalles.some(d => !d.producto_nombre || d.cantidad <= 0 || d.precio_unitario <= 0)) {
      toast.error('Por favor agrega al menos un item válido a la orden')
      return
    }

    setSubmitting(true)

    try {
      // Preparar datos para el backend (usando UUID temporal para demo)
      const ordenData = {
        proveedor: formData.proveedor,
        fecha_orden: formData.fecha_orden,
        fecha_entrega_esperada: formData.fecha_entrega_esperada || null,
        solicitado_por: formData.solicitado_por,
        observaciones: formData.observaciones || null,
        detalles: formData.detalles.map(detalle => ({
          // UUID temporal para demo - en producción se haría lookup de items existentes
          item_id: "550e8400-e29b-41d4-a716-446655440000", 
          cantidad: parseInt(detalle.cantidad.toString()),
          precio_unitario: parseFloat(detalle.precio_unitario.toString())
        }))
      }

      const response = await fetch(`${API_BASE}/api/v1/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Orden creada exitosamente')
        setShowAddDialog(false)
        resetForm()
        // Actualizar datos en tiempo real
        fetchOrdenes()
        fetchEstadisticas()
      } else {
        toast.error(result.message || 'Error al crear orden')
      }
    } catch (error) {
      console.error('Error creating orden:', error)
      toast.error('Error al crear orden')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      proveedor: "",
      fecha_orden: new Date().toISOString().split('T')[0],
      fecha_entrega_esperada: "",
      solicitado_por: "",
      observaciones: "",
      detalles: [
        {
          item_id: "",
          producto_nombre: "",
          cantidad: 1,
          precio_unitario: 0
        }
      ]
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          item_id: "",
          producto_nombre: "",
          cantidad: 1,
          precio_unitario: 0
        }
      ]
    })
  }

  const removeItem = (index: number) => {
    if (formData.detalles.length > 1) {
      const newDetalles = formData.detalles.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        detalles: newDetalles
      })
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newDetalles = [...formData.detalles]
    newDetalles[index] = {
      ...newDetalles[index],
      [field]: value
    }
    setFormData({
      ...formData,
      detalles: newDetalles
    })
  }

  const calculateTotal = () => {
    return formData.detalles.reduce((total, item) => {
      return total + (parseFloat(item.cantidad.toString()) * parseFloat(item.precio_unitario.toString()) || 0)
    }, 0)
  }

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchEstadisticas()
    fetchOrdenes()
  }, [])

  // Efecto para recargar cuando cambien filtros
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setPage(1)
      fetchOrdenes()
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, filtroEstado, filtroProveedor])

  // Efecto para recargar cuando cambie la página
  useEffect(() => {
    fetchOrdenes()
  }, [page])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente Aprobacion":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
            Pendiente Aprobacion
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

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Ordenes de Compra</h1>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Ordenes</p>
                    <p className="text-2xl font-bold text-foreground">{estadisticas.total_ordenes}</p>
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
                    <p className="text-2xl font-bold text-foreground">{estadisticas.pendientes}</p>
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
                    <p className="text-2xl font-bold text-foreground">{estadisticas.aprobadas}</p>
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
                    <p className="text-2xl font-bold text-foreground">${estadisticas.valor_total_general.toLocaleString()}</p>
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
                  <CardTitle>Ordenes de Compra</CardTitle>
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
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Orden de Compra</DialogTitle>
                        <DialogDescription>
                          Completa la información para generar una nueva orden de compra
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="proveedor">Proveedor *</Label>
                          <Select 
                            value={formData.proveedor} 
                            onValueChange={(value) => setFormData({...formData, proveedor: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bayer Healthcare">Bayer Healthcare</SelectItem>
                              <SelectItem value="3M Healthcare">3M Healthcare</SelectItem>
                              <SelectItem value="Philips Medical">Philips Medical</SelectItem>
                              <SelectItem value="Kodak Medical">Kodak Medical</SelectItem>
                              <SelectItem value="GE Healthcare">GE Healthcare</SelectItem>
                              <SelectItem value="Siemens Healthineers">Siemens Healthineers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="solicitante">Solicitante *</Label>
                          <Input 
                            id="solicitante" 
                            placeholder="Nombre del solicitante" 
                            value={formData.solicitado_por}
                            onChange={(e) => setFormData({...formData, solicitado_por: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fecha-orden">Fecha de Orden</Label>
                          <Input 
                            id="fecha-orden" 
                            type="date" 
                            value={formData.fecha_orden}
                            onChange={(e) => setFormData({...formData, fecha_orden: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fecha-entrega">Fecha de Entrega Esperada</Label>
                          <Input 
                            id="fecha-entrega" 
                            type="date" 
                            value={formData.fecha_entrega_esperada}
                            onChange={(e) => setFormData({...formData, fecha_entrega_esperada: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="observaciones">Observaciones</Label>
                          <Textarea 
                            id="observaciones" 
                            placeholder="Notas adicionales sobre la orden..." 
                            value={formData.observaciones}
                            onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Items de la Orden *</Label>
                          <div className="border rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground">
                              <span>Producto</span>
                              <span>Cantidad</span>
                              <span>Precio Unit.</span>
                              <span>Subtotal</span>
                              <span>Acciones</span>
                            </div>
                            {formData.detalles.map((detalle, index) => (
                              <div key={index} className="grid grid-cols-5 gap-2 items-center">
                                <Input 
                                  placeholder="Nombre del producto" 
                                  value={detalle.producto_nombre}
                                  onChange={(e) => updateItem(index, 'producto_nombre', e.target.value)}
                                />
                                <Input 
                                  type="number" 
                                  min="1"
                                  placeholder="1" 
                                  value={detalle.cantidad}
                                  onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                                />
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min="0" 
                                  placeholder="0.00" 
                                  value={detalle.precio_unitario}
                                  onChange={(e) => updateItem(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                                />
                                <Input 
                                  value={`$${(detalle.cantidad * detalle.precio_unitario || 0).toFixed(2)}`} 
                                  disabled 
                                  className="bg-muted"
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => removeItem(index)}
                                  disabled={formData.detalles.length === 1}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <Button variant="outline" size="sm" onClick={addItem} className="bg-transparent">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Item
                              </Button>
                              <div className="text-lg font-semibold">
                                Total: ${calculateTotal().toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => {
                          setShowAddDialog(false)
                          resetForm()
                        }}>
                          Cancelar
                        </Button>
                        <Button 
                          className="bg-teal-600 hover:bg-teal-700" 
                          onClick={handleCreateOrden}
                          disabled={submitting}
                        >
                          {submitting ? "Creando..." : "Crear Orden"}
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
                    <Input 
                      placeholder="Buscar por ID, proveedor o solicitante..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente Aprobacion</SelectItem>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Cargando ordenes...
                      </TableCell>
                    </TableRow>
                  ) : ordenes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No se encontraron ordenes
                      </TableCell>
                    </TableRow>
                  ) : (
                    ordenes.map((orden) => (
                      <TableRow key={orden.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{orden.numero_orden}</p>
                            <p className="text-sm text-muted-foreground">{orden.fecha_orden}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{orden.proveedor}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{orden.solicitado_por}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground">{orden.fecha_entrega_esperada || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">${orden.total_orden.toLocaleString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={orden.estado === 'Aprobada' || orden.estado === 'Enviada'}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteOrden(orden.id)}
                              disabled={orden.estado === 'Aprobada' || orden.estado === 'Enviada'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}