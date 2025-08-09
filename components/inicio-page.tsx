"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Stethoscope,
  Calendar,
  ArrowRight,
  Brain,
  FileImage,
  Users,
  MessageSquare,
  Activity,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"

const caracteristicas = [
  {
    icon: Brain,
    titulo: "IA Médica Avanzada",
    descripcion: "Análisis inteligente con modelos especializados en radiología médica",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: FileImage,
    titulo: "Visor DICOM Profesional",
    descripcion: "Visualización avanzada de imágenes médicas con herramientas especializadas",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: MessageSquare,
    titulo: "Asistente IA Conversacional",
    descripcion: "Chat inteligente para consultas médicas y análisis de casos clínicos",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Activity,
    titulo: "Análisis en Tiempo Real",
    descripción: "Procesamiento instantáneo de estudios con alta precisión diagnóstica",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
]



export function InicioPage() {
  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header - Responsive */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4 safe-area-top">
          <SidebarTrigger className="-ml-1 tap-target" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <h1 className="heading-responsive font-semibold text-foreground truncate">Bienvenido a RADIX</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Plataforma de inteligencia artificial para radiología médica
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Contenido Principal - Responsive */}
        <main className="flex-1 overflow-auto mobile-scroll spacing-responsive safe-area-bottom">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section - Responsive */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">RADIX</h1>
                  <p className="text-sm sm:text-lg text-teal-600 dark:text-teal-400 font-medium">Inteligencia Médica Avanzada</p>
                </div>
              </div>
              <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Revoluciona tu práctica médica con inteligencia artificial especializada en radiología. Análisis
                precisos, reportes automáticos y diagnósticos asistidos por IA.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4">
                <Button size="lg" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 tap-target" asChild>
                  <a href="/dashboard">
                    Ir al Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto tap-target" asChild>
                  <a href="/chat">
                    Probar Chat IA
                    <MessageSquare className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>



            {/* Características Principales */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">Características Principales</h2>
                <p className="text-lg text-muted-foreground">
                  Herramientas avanzadas diseñadas específicamente para profesionales de la salud
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caracteristicas.map((caracteristica, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 ${caracteristica.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <caracteristica.icon className={`w-6 h-6 ${caracteristica.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{caracteristica.titulo}</h3>
                          <p className="text-muted-foreground">{caracteristica.descripcion}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Acceso Rápido */}
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2 text-foreground">
                  <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  Acceso Rápido a Herramientas
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Comienza a usar las funcionalidades principales de RADIX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-background border-2 border-border hover:bg-muted/50 text-foreground"
                    asChild
                  >
                    <a href="/estudios">
                      <FileImage className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      <span className="font-medium">Estudios Pendientes</span>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-background border-2 border-border hover:bg-muted/50 text-foreground"
                    asChild
                  >
                    <a href="/pacientes">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Ver Pacientes</span>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-background border-2 border-border hover:bg-muted/50 text-foreground"
                    asChild
                  >
                    <a href="/ia/dicom">
                      <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium">Visor DICOM</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información del Usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Información de la Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">Dr. María González</div>
                    <div className="text-sm text-muted-foreground">Radióloga Certificada</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">Hospital General</div>
                    <div className="text-sm text-muted-foreground">Ciudad de México</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">Última Sesión</div>
                    <div className="text-sm text-muted-foreground">Ayer, 23:45</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección Social y Legal */}
            <div className="mt-8 space-y-6">
              {/* Redes Sociales - Responsive */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-foreground text-sm sm:text-base">Síguenos en Redes Sociales</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop - Layout horizontal */}
                  <div className="hidden sm:flex justify-center gap-4 lg:gap-6">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://x.com/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">𝕏</span>
                        <span>X</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://instagram.com/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">📷</span>
                        <span>Instagram</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://linkedin.com/company/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">💼</span>
                        <span>LinkedIn</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://facebook.com/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">📘</span>
                        <span>Facebook</span>
                      </a>
                    </Button>
                  </div>

                  {/* Móvil - Grid 2x2 */}
                  <div className="sm:hidden grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://x.com/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">𝕏</span>
                        <span className="text-xs">X</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://instagram.com/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">📷</span>
                        <span className="text-xs">Instagram</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://linkedin.com/company/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">💼</span>
                        <span className="text-xs">LinkedIn</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 tap-target" asChild>
                      <a href="https://facebook.com/radix" target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">📘</span>
                        <span className="text-xs">Facebook</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sección Legal y Copyright */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-6 text-sm">
                      <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                        <a href="/privacidad" className="text-muted-foreground hover:text-foreground">
                          Política de Privacidad
                        </a>
                      </Button>
                      <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                        <a href="/terminos" className="text-muted-foreground hover:text-foreground">
                          Términos de Servicios
                        </a>
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      © 2025 RADIX todos los derechos reservados.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarInset>
  )
}
