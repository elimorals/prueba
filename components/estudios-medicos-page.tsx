"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  X,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interfaces para el backend
interface EstadisticasEstudios {
  total_estudios: number
  pendientes: number
  en_proceso: number
  completados: number
  cancelados: number
  criticos: number
  urgentes: number
  esta_semana: number
  por_modalidad: { [key: string]: number }
}

interface Estudio {
  id: string
  numero_estudio: string
  paciente_id: string
  tipo_estudio: string
  modalidad: string
  area_anatomica: string
  indicacion_clinica: string
  estado: string
  prioridad: string
  fecha_estudio: string
  medico_solicitante: string
  tecnico_responsable?: string
  observaciones?: string
  archivos_dicom: string[]
  created_at: string
  updated_at: string
  pacientes?: {
    nombre: string
    apellido: string
    numero_paciente: string
  }
}

interface PaginatedResponse {
  items: Estudio[]
  total: number
  page: number
  limit: number
  pages: number
}

export function EstudiosMedicosPage() {
  // Estados principales
  const [estudios, setEstudios] = useState<Estudio[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasEstudios>({
    total_estudios: 0,
    pendientes: 0,
    en_proceso: 0,
    completados: 0,
    cancelados: 0,
    criticos: 0,
    urgentes: 0,
    esta_semana: 0,
    por_modalidad: {}
  })
  const [selectedEstudio, setSelectedEstudio] = useState<Estudio | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroModalidad, setFiltroModalidad] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("todos")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 10

  // Estados para subir estudios
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    paciente_id: "00000000-0000-0000-0000-000000000000", // UUID válido por defecto
    tipo_estudio: "",
    modalidad: "",
    area_anatomica: "",
    indicacion_clinica: "",
    fecha_estudio: new Date().toISOString().split('T')[0],
    medico_solicitante: "",
    prioridad: "Normal",
    observaciones: "",
    estado: "Pendiente",
    archivos_dicom: []
  })
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const BACKEND_URL = "http://127.0.0.1:8000"

  // Función para cargar estadísticas
  const loadEstadisticas = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/estudios/estadisticas`)
      if (response.ok) {
        const data = await response.json()
        setEstadisticas(data)
      } else {
        console.warn("No se pudieron cargar las estadísticas, usando valores por defecto")
        // Mantener estadísticas por defecto si hay error
      }
    } catch (error) {
      console.error("Error loading estadísticas:", error)
      // Mantener estadísticas por defecto si hay error
    }
  }

  // Función para cargar estudios con filtros
  const loadEstudios = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      // Aplicar filtros solo si no son "todos"
      if (filtroEstado !== "todos") params.append("estado", filtroEstado)
      if (filtroModalidad !== "todos") params.append("tipo", filtroModalidad)

      const url = `${BACKEND_URL}/api/v1/estudios?${params}`
      console.log("Fetching estudios from:", url) // Debug

      const response = await fetch(url)
      
      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        console.log("Received data:", data) // Debug
        
        // Verificar si data es la estructura esperada
        if (!data || typeof data !== 'object') {
          console.error("Invalid data structure received:", data)
          setEstudios([])
          setTotalPages(1)
          setTotalItems(0)
          setCurrentPage(page)
          return
        }

        // Asegurar que items es un array
        const items = Array.isArray(data.items) ? data.items : []
        console.log(`Found ${items.length} estudios in response`) // Debug
        
        // Si no hay datos del paciente, crear estructura por defecto
        const processedItems = items.map(estudio => ({
          ...estudio,
          pacientes: estudio.pacientes || {
            nombre: "Paciente",
            apellido: "Demo", 
            numero_paciente: "PAC-DEMO"
          }
        }))
        
        // Filtrar por término de búsqueda en el frontend
        let filteredItems = processedItems
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredItems = processedItems.filter(estudio => 
            estudio.numero_estudio?.toLowerCase().includes(term) ||
            estudio.pacientes?.nombre?.toLowerCase().includes(term) ||
            estudio.pacientes?.apellido?.toLowerCase().includes(term) ||
            estudio.tipo_estudio?.toLowerCase().includes(term) ||
            estudio.medico_solicitante?.toLowerCase().includes(term)
          )
        }

        setEstudios(filteredItems)
        setTotalPages(data.pages || 1)
        setTotalItems(data.total || items.length)
        setCurrentPage(page)
        
        console.log(`Setting ${filteredItems.length} estudios in state`) // Debug
      } else {
        console.error("Error response:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error details:", errorText)
        setEstudios([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error("Error loading estudios:", error)
      setEstudios([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar datos
  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([
      loadEstadisticas(),
      loadEstudios(currentPage)
    ])
    setRefreshing(false)
  }

  // Función para subir estudio
  const handleUploadEstudio = async () => {
    try {
      // Validar campos requeridos
      if (!uploadForm.tipo_estudio || !uploadForm.modalidad || !uploadForm.area_anatomica || 
          !uploadForm.indicacion_clinica || !uploadForm.medico_solicitante) {
        alert("Por favor complete todos los campos requeridos")
        return
      }

      const estudiosData = {
        paciente_id: uploadForm.paciente_id,
        tipo_estudio: uploadForm.tipo_estudio, // Usar valor directo del enum
        fecha_estudio: new Date(uploadForm.fecha_estudio + "T00:00:00Z").toISOString(),
        modalidad: uploadForm.modalidad,
        area_anatomica: uploadForm.area_anatomica,
        indicacion_clinica: uploadForm.indicacion_clinica,
        estado: uploadForm.estado,
        prioridad: uploadForm.prioridad,
        medico_solicitante: uploadForm.medico_solicitante,
        observaciones: uploadForm.observaciones || null,
        tecnico_responsable: null,
        archivos_dicom: uploadForm.archivos_dicom,
        metadatos_dicom: null
      }

      console.log("Enviando datos:", estudiosData) // Para debug

      const response = await fetch(`${BACKEND_URL}/api/v1/estudios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(estudiosData)
      })

      if (response.ok) {
        setShowUploadModal(false)
        resetUploadForm()
        setUploadFiles([])
        await refreshData()
        alert("Estudio creado exitosamente")
      } else {
        const errorData = await response.text()
        console.error("Error response:", errorData)
        alert("Error al crear el estudio. Revise los datos e intente nuevamente.")
      }
    } catch (error) {
      console.error("Error uploading estudio:", error)
      alert("Error de conexión. Intente nuevamente.")
    }
  }

  // Función para resetear el formulario
  const resetUploadForm = () => {
    setUploadForm({
      paciente_id: "00000000-0000-0000-0000-000000000000",
      tipo_estudio: "",
      modalidad: "",
      area_anatomica: "",
      indicacion_clinica: "",
      fecha_estudio: new Date().toISOString().split('T')[0],
      medico_solicitante: "",
      prioridad: "Normal",
      observaciones: "",
      estado: "Pendiente",
      archivos_dicom: []
    })
  }

  // Función para manejar archivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadFiles(files)
  }

  // Función para obtener el color del badge según el estado
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "completado": return "default"
      case "en_proceso": return "secondary" 
      case "pendiente": return "outline"
      case "cancelado": return "destructive"
      default: return "outline"
    }
  }

  // Efectos
  useEffect(() => {
    loadEstadisticas()
    loadEstudios()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadEstudios(1)
    }, 300)
    return () => clearTimeout(delayedSearch)
  }, [searchTerm, filtroModalidad, filtroEstado])

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
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log("=== DEBUG INFO ===")
                console.log("Current estudios:", estudios)
                console.log("Current estadisticas:", estadisticas)
                console.log("Loading:", loading)
                console.log("Filters:", { filtroEstado, filtroModalidad, searchTerm })
                
                // Test direct API call
                try {
                  const response = await fetch(`${BACKEND_URL}/api/v1/estudios?page=1&limit=10`)
                  const data = await response.json()
                  console.log("Direct API call result:", data)
                } catch (error) {
                  console.error("Direct API call error:", error)
                }
              }}
            >
              Debug
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Button>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-auto p-6">
          {/* Estadísticas Rápidas - Tiempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Estudios</p>
                    <p className="text-2xl font-bold">{estadisticas.total_estudios}</p>
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
                    <p className="text-2xl font-bold">{estadisticas.pendientes}</p>
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
                    <p className="text-2xl font-bold">{estadisticas.completados}</p>
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
                    <p className="text-2xl font-bold">{estadisticas.urgentes}</p>
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
                <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Estudio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Subir Nuevo Estudio</DialogTitle>
                      <DialogDescription>
                        Complete la información del estudio médico y suba los archivos DICOM
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipo_estudio">Tipo de Estudio</Label>
                          <Select value={uploadForm.tipo_estudio} onValueChange={(value) => setUploadForm({...uploadForm, tipo_estudio: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo de estudio" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Radiografía">Radiografía</SelectItem>
                              <SelectItem value="Tomografía">Tomografía</SelectItem>
                              <SelectItem value="RM">RM</SelectItem>
                              <SelectItem value="Ecografía">Ecografía</SelectItem>
                              <SelectItem value="Mamografía">Mamografía</SelectItem>
                              <SelectItem value="Densitometría">Densitometría</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="modalidad">Modalidad</Label>
                          <Select value={uploadForm.modalidad} onValueChange={(value) => setUploadForm({...uploadForm, modalidad: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar modalidad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RX">RX</SelectItem>
                              <SelectItem value="CT">CT</SelectItem>
                              <SelectItem value="MR">MR</SelectItem>
                              <SelectItem value="US">US</SelectItem>
                              <SelectItem value="MG">MG</SelectItem>
                              <SelectItem value="DX">DX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="area_anatomica">Área Anatómica</Label>
                          <Input
                            id="area_anatomica"
                            value={uploadForm.area_anatomica}
                            onChange={(e) => setUploadForm({...uploadForm, area_anatomica: e.target.value})}
                            placeholder="ej: Tórax"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fecha_estudio">Fecha del Estudio</Label>
                          <Input
                            id="fecha_estudio"
                            type="date"
                            value={uploadForm.fecha_estudio}
                            onChange={(e) => setUploadForm({...uploadForm, fecha_estudio: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="indicacion_clinica">Indicación Clínica</Label>
                        <Textarea
                          id="indicacion_clinica"
                          value={uploadForm.indicacion_clinica}
                          onChange={(e) => setUploadForm({...uploadForm, indicacion_clinica: e.target.value})}
                          placeholder="Motivo del estudio..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medico_solicitante">Médico Solicitante</Label>
                          <Input
                            id="medico_solicitante"
                            value={uploadForm.medico_solicitante}
                            onChange={(e) => setUploadForm({...uploadForm, medico_solicitante: e.target.value})}
                            placeholder="Dr. Nombre Apellido"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prioridad">Prioridad</Label>
                          <Select value={uploadForm.prioridad} onValueChange={(value) => setUploadForm({...uploadForm, prioridad: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Urgente">Urgente</SelectItem>
                              <SelectItem value="Crítica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="archivos">Archivos DICOM</Label>
                        <Input
                          id="archivos"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          multiple
                          accept=".dcm,.dicom"
                        />
                        {uploadFiles.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {uploadFiles.length} archivo(s) seleccionado(s)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setShowUploadModal(false)
                        resetUploadForm()
                        setUploadFiles([])
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleUploadEstudio} className="bg-teal-600 hover:bg-teal-700">
                        Subir Estudio
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Búsqueda y filtros básicos */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar por paciente, ID o tipo de estudio..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las modalidades</SelectItem>
                      <SelectItem value="Radiografía">Radiografía</SelectItem>
                      <SelectItem value="Tomografía">Tomografía</SelectItem>
                      <SelectItem value="RM">RM</SelectItem>
                      <SelectItem value="Ecografía">Ecografía</SelectItem>
                      <SelectItem value="Mamografía">Mamografía</SelectItem>
                      <SelectItem value="Densitometría">Densitometría</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Más Filtros
                  </Button>
                </div>

                {/* Filtros avanzados */}
                {showAdvancedFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                    <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas las prioridades</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                      <SelectTrigger>
                        <SelectValue placeholder="Periodo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los periodos</SelectItem>
                        <SelectItem value="hoy">Hoy</SelectItem>
                        <SelectItem value="semana">Esta semana</SelectItem>
                        <SelectItem value="mes">Este mes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => {
                      setFiltroPrioridad("todos")
                      setFiltroFecha("todos")
                      setFiltroModalidad("todos")
                      setFiltroEstado("todos")
                      setSearchTerm("")
                    }}>
                      Limpiar Filtros
                    </Button>
                  </div>
                )}

                {/* Indicador de resultados */}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Mostrando {estudios.length} de {totalItems} estudios</span>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
                    {estudios.map((estudio) => (
                      <TableRow
                        key={estudio.id}
                        onClick={() => setSelectedEstudio(estudio)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{estudio.numero_estudio}</p>
                            <p className="text-sm text-muted-foreground">
                              {estudio.pacientes?.nombre} {estudio.pacientes?.apellido}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {estudio.pacientes?.numero_paciente}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{estudio.tipo_estudio}</p>
                            <p className="text-xs text-muted-foreground">{estudio.area_anatomica}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{estudio.modalidad}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{new Date(estudio.fecha_estudio).toLocaleDateString('es-ES')}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(estudio.fecha_estudio).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{estudio.medico_solicitante}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {estudio.prioridad === "URGENTE" && (
                              <Badge variant="destructive" className="w-fit">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Urgente
                              </Badge>
                            )}
                            <Badge
                              variant={getEstadoBadgeVariant(estudio.estado)}
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

                {/* Mensaje cuando no hay datos */}
                {!loading && estudios.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || filtroEstado !== "todos" || filtroModalidad !== "todos" ? (
                        <>
                          <p className="text-lg font-medium mb-2">No se encontraron estudios</p>
                          <p>Intenta ajustar los filtros de búsqueda</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium mb-2">No hay estudios registrados</p>
                          <p>Comienza subiendo tu primer estudio médico</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadEstudios(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadEstudios(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}

                {/* Vista Detallada del Estudio */}
                {selectedEstudio && (
                  <div className="mt-6 p-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Vista Detallada del Estudio</h3>
                      <Button variant="outline" size="sm" onClick={() => setSelectedEstudio(null)}>
                        <X className="w-4 h-4 mr-2" />
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
                              <p>{selectedEstudio.numero_estudio}</p>
                            </div>
                            <div>
                              <span className="font-medium">Paciente:</span>
                              <p>{selectedEstudio.pacientes?.nombre} {selectedEstudio.pacientes?.apellido}</p>
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span>
                              <p>{selectedEstudio.tipo_estudio}</p>
                            </div>
                            <div>
                              <span className="font-medium">Modalidad:</span>
                              <p>{selectedEstudio.modalidad}</p>
                            </div>
                            <div>
                              <span className="font-medium">Fecha:</span>
                              <p>{new Date(selectedEstudio.fecha_estudio).toLocaleDateString('es-ES')}</p>
                            </div>
                            <div>
                              <span className="font-medium">Médico:</span>
                              <p>{selectedEstudio.medico_solicitante}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Indicación:</span>
                              <p>{selectedEstudio.indicacion_clinica}</p>
                            </div>
                            {selectedEstudio.observaciones && (
                              <div className="col-span-2">
                                <span className="font-medium">Observaciones:</span>
                                <p>{selectedEstudio.observaciones}</p>
                              </div>
                            )}
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
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}