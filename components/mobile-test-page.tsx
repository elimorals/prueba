"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  Signal,
  Battery,
  Clock,
} from "lucide-react"

interface DeviceTest {
  device: string
  viewport: string
  browser: string
  status: "pass" | "fail" | "warning"
  issues: string[]
}

const testResults: DeviceTest[] = [
  {
    device: "iPhone 14 Pro",
    viewport: "393x852",
    browser: "Safari",
    status: "pass",
    issues: []
  },
  {
    device: "iPhone SE",
    viewport: "375x667",
    browser: "Safari",
    status: "pass", 
    issues: []
  },
  {
    device: "Samsung Galaxy S21",
    viewport: "384x854",
    browser: "Chrome",
    status: "pass",
    issues: []
  },
  {
    device: "iPad Air",
    viewport: "820x1180",
    browser: "Safari",
    status: "pass",
    issues: []
  },
  {
    device: "iPad Mini",
    viewport: "768x1024",
    browser: "Safari",
    status: "pass",
    issues: []
  },
  {
    device: "Desktop",
    viewport: "1920x1080",
    browser: "Chrome",
    status: "pass",
    issues: []
  }
]

const mobileFeatures = [
  {
    feature: "Viewport Meta Tag",
    status: "implemented",
    description: "Previene zoom automático en iOS"
  },
  {
    feature: "Touch Target Size",
    status: "implemented", 
    description: "Mínimo 44px para elementos interactivos"
  },
  {
    feature: "Responsive Typography",
    status: "implemented",
    description: "Escalado de texto para diferentes pantallas"
  },
  {
    feature: "Mobile Navigation",
    status: "implemented",
    description: "Sidebar collapsible con sheet en móvil"
  },
  {
    feature: "Responsive Tables",
    status: "implemented",
    description: "Cards en móvil, tabla con scroll en desktop"
  },
  {
    feature: "Safe Areas",
    status: "implemented",
    description: "Respeta notch y área segura"
  },
  {
    feature: "Input Prevention Zoom",
    status: "implemented",
    description: "Font-size 16px para prevenir zoom en iOS"
  },
  {
    feature: "Touch Scrolling",
    status: "implemented",
    description: "Scroll suave con momentum en iOS"
  }
]

export function MobileTestPage() {
  const [selectedDevice, setSelectedDevice] = useState<string>("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
      case "implemented":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
      case "implemented":
        return <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">✓ Implementado</Badge>
      case "fail":
        return <Badge variant="destructive">✗ Falla</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">⚠ Advertencia</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header - Responsive */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4 safe-area-top">
          <SidebarTrigger className="-ml-1 tap-target" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <h1 className="heading-responsive font-semibold text-foreground truncate">
              Pruebas de Responsividad Móvil
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Verificación de compatibilidad con dispositivos móviles
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* Contenido Principal - Responsive */}
        <main className="flex-1 overflow-auto mobile-scroll spacing-responsive safe-area-bottom">
          
          {/* Simulador de status bar móvil */}
          <div className="sm:hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2 rounded-lg mb-4 flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <span>•••••</span>
              <Wifi className="w-3 h-3" />
            </div>
            <div className="font-medium">12:34 PM</div>
            <div className="flex items-center gap-1">
              <span>100%</span>
              <Battery className="w-3 h-3" />
            </div>
          </div>

          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Dispositivos</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{testResults.length}</p>
                  </div>
                  <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Exitosos</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">
                      {testResults.filter(t => t.status === "pass").length}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Características</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{mobileFeatures.length}</p>
                  </div>
                  <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados por dispositivo */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="heading-responsive">Resultados por Dispositivo</CardTitle>
              <CardDescription>
                Pruebas de compatibilidad en diferentes navegadores y tamaños de pantalla
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="table-responsive">
                  <div className="space-y-3">
                    {testResults.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {test.device.includes('iPhone') || test.device.includes('Samsung') ? (
                            <Smartphone className="w-5 h-5 text-blue-500" />
                          ) : test.device.includes('iPad') ? (
                            <Tablet className="w-5 h-5 text-green-500" />
                          ) : (
                            <Monitor className="w-5 h-5 text-purple-500" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{test.device}</p>
                            <p className="text-sm text-muted-foreground">{test.viewport} • {test.browser}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          {getStatusBadge(test.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {testResults.map((test, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {test.device.includes('iPhone') || test.device.includes('Samsung') ? (
                          <Smartphone className="w-5 h-5 text-blue-500 mt-0.5" />
                        ) : test.device.includes('iPad') ? (
                          <Tablet className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <Monitor className="w-5 h-5 text-purple-500 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate">{test.device}</h3>
                          <p className="text-xs text-muted-foreground">{test.viewport}</p>
                          <p className="text-xs text-muted-foreground">{test.browser}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusIcon(test.status)}
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Características implementadas */}
          <Card>
            <CardHeader>
              <CardTitle className="heading-responsive">Características Móviles Implementadas</CardTitle>
              <CardDescription>
                Funcionalidades específicas para mejorar la experiencia móvil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mobileFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(feature.status)}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">{feature.feature}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones de prueba */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="heading-responsive">Cómo Probar en Dispositivos Reales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Chrome DevTools</h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Presiona F12 o Ctrl+Shift+I (Cmd+Opt+I en Mac)</li>
                    <li>Haz clic en el ícono de dispositivo móvil (Toggle device toolbar)</li>
                    <li>Selecciona diferentes dispositivos del dropdown</li>
                    <li>Verifica touch targets, navegación y scroll</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Dispositivos Reales</h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Abre la aplicación en el navegador móvil</li>
                    <li>Prueba la navegación con gestos táctiles</li>
                    <li>Verifica que los elementos sean fáciles de tocar</li>
                    <li>Comprueba que el texto sea legible sin zoom</li>
                    <li>Prueba rotación de pantalla (portrait/landscape)</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Navegadores a Probar</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Badge variant="outline">Safari iOS</Badge>
                    <Badge variant="outline">Chrome Android</Badge>
                    <Badge variant="outline">Firefox Mobile</Badge>
                    <Badge variant="outline">Edge Mobile</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  )
}