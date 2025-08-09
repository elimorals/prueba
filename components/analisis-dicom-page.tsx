"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Calendar,
  FileImage,
  Maximize,
  RotateCw,
  ZoomIn,
  Move,
  Ruler,
  Palette,
  Download,
  Share,
  Eye,
  Settings,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function AnalisisDicomPage() {
  const [zoomLevel, setZoomLevel] = useState([100])
  const [brightness, setBrightness] = useState([50])
  const [contrast, setContrast] = useState([50])
  const [herramientaActiva, setHerramientaActiva] = useState("cursor")

  const herramientas = [
    { id: "cursor", icon: Move, label: "Mover" },
    { id: "zoom", icon: ZoomIn, label: "Zoom" },
    { id: "ruler", icon: Ruler, label: "Medir" },
    { id: "brightness", icon: Palette, label: "Brillo/Contraste" },
  ]

  const estudiosRecientes = [
    {
      id: "DCM-001",
      paciente: "Juan Pérez García",
      tipo: "Radiografía Tórax AP",
      fecha: "2025-01-02",
      estado: "Analizado",
    },
    {
      id: "DCM-002",
      paciente: "María López Hernández",
      tipo: "RM Cerebral",
      fecha: "2025-01-02",
      estado: "En proceso",
    },
    {
      id: "DCM-003",
      paciente: "Carlos Rodríguez",
      tipo: "TC Abdomen",
      fecha: "2025-01-01",
      estado: "Completado",
    },
  ]

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Análisis DICOM
            </h1>
            <p className="text-sm text-muted-foreground">Visor avanzado de imágenes médicas DICOM</p>
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
        <div className="flex-1 flex">
          {/* Visor DICOM Principal */}
          <div className="flex-1 flex flex-col">
            {/* Barra de Herramientas */}
            <div className="border-b p-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {herramientas.map((herramienta) => (
                    <Button
                      key={herramienta.id}
                      variant={herramientaActiva === herramienta.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHerramientaActiva(herramienta.id)}
                    >
                      <herramienta.icon className="w-4 h-4" />
                    </Button>
                  ))}
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <Button variant="outline" size="sm">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Zoom: {zoomLevel[0]}%</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área del Visor */}
            <div className="flex-1 bg-gray-900 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-800 rounded-lg p-8 text-center text-white max-w-md">
                  <FileImage className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Visor DICOM Avanzado</h3>
                  <p className="text-gray-300 mb-4">
                    Selecciona un estudio de la lista lateral para visualizar las imágenes médicas
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-medium">Formatos Soportados</div>
                      <div className="text-gray-300">DICOM, JPG, PNG</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="font-medium">Herramientas</div>
                      <div className="text-gray-300">Zoom, Medición, Anotaciones</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la Imagen (cuando hay una cargada) */}
              <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded text-sm">
                <div>Paciente: Juan Pérez García</div>
                <div>Estudio: Radiografía Tórax AP</div>
                <div>Fecha: 2025-01-02 10:30</div>
                <div>Modalidad: CR</div>
              </div>

              {/* Controles de Imagen */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded space-y-2">
                <div className="text-xs font-medium">Controles de Imagen</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-3 h-3" />
                    <span className="text-xs w-12">Zoom:</span>
                    <Slider
                      value={zoomLevel}
                      onValueChange={setZoomLevel}
                      max={500}
                      min={25}
                      step={25}
                      className="w-20"
                    />
                    <span className="text-xs w-8">{zoomLevel[0]}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    <span className="text-xs w-12">Brillo:</span>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      max={100}
                      min={0}
                      step={5}
                      className="w-20"
                    />
                    <span className="text-xs w-8">{brightness[0]}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    <span className="text-xs w-12">Contraste:</span>
                    <Slider value={contrast} onValueChange={setContrast} max={100} min={0} step={5} className="w-20" />
                    <span className="text-xs w-8">{contrast[0]}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="w-80 border-l bg-muted/30 flex flex-col">
            {/* Estudios Recientes */}
            <Card className="m-4 mb-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estudios Recientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {estudiosRecientes.map((estudio) => (
                  <div
                    key={estudio.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{estudio.id}</span>
                      <Badge
                        variant={
                          estudio.estado === "Completado"
                            ? "default"
                            : estudio.estado === "Analizado"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {estudio.estado}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{estudio.paciente}</div>
                    <div className="text-xs text-muted-foreground">{estudio.tipo}</div>
                    <div className="text-xs text-muted-foreground">{estudio.fecha}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Información del Estudio Actual */}
            <Card className="m-4 mt-2 mb-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Información del Estudio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Estudio:</span>
                    <span className="font-medium">DCM-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modalidad:</span>
                    <span className="font-medium">CR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensiones:</span>
                    <span className="font-medium">2048x2048</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tamaño:</span>
                    <span className="font-medium">4.2 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bits por píxel:</span>
                    <span className="font-medium">16</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Herramientas de Análisis */}
            <Card className="m-4 mt-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Herramientas de Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Análisis con IA
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Ruler className="w-4 h-4 mr-2" />
                  Herramientas de Medición
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración DICOM
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Imagen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
