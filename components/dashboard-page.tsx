"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileImage,
  Brain,
  MessageSquare,
  Activity,
  FileText,
} from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

// Importar ThemeToggle
import { ThemeToggle } from "@/components/theme-toggle"

// Datos simulados
const kpiData = [
  {
    title: "Estudios Pendientes",
    value: "12",
    change: "+3 desde ayer",
    icon: FileImage,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Reportes Completados Hoy",
    value: "8",
    change: "+2 vs promedio",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Tiempo Promedio por Reporte",
    value: "4:32 min",
    change: "-1:15 min vs ayer",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Estudios Urgentes",
    value: "2",
    change: "Requieren atención",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
]

export function DashboardPage() {
  return (
    <SidebarInset>
      <div className="flex h-screen">
        {/* Área Principal */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Dashboard de Trabajo</h1>
              <p className="text-sm text-muted-foreground">Bienvenido de nuevo, Dr. González</p>
            </div>
            {/* En el header, añadir el ThemeToggle */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Button>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="flex-1 overflow-auto p-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {kpiData.map((kpi, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
                        <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
                      </div>
                      <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                        <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumen de Actividad Diaria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Actividad de Hoy</CardTitle>
                  <CardDescription>Resumen de tu jornada médica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-foreground">Reportes Completados</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">8</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="font-medium text-foreground">Estudios Pendientes</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-foreground">Análisis IA Realizados</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">15</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Rendimiento Semanal</CardTitle>
                  <CardDescription>Comparación con la semana anterior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Reportes por día</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">12.4</span>
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                          +8%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Tiempo promedio</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">4:32</span>
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                          -12%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Precisión IA</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">94.2%</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                          +2%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accesos Rápidos */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Accesos Rápidos</CardTitle>
                <CardDescription>Herramientas más utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent hover:bg-muted" asChild>
                    <a href="/estudios">
                      <FileImage className="w-6 h-6" />
                      <span>Estudios Pendientes</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent hover:bg-muted" asChild>
                    <a href="/chat">
                      <MessageSquare className="w-6 h-6" />
                      <span>Chat IA Médico</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent hover:bg-muted" asChild>
                    <a href="/ia/dicom">
                      <Activity className="w-6 h-6" />
                      <span>Visor DICOM</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent hover:bg-muted" asChild>
                    <a href="/reportes">
                      <FileText className="w-6 h-6" />
                      <span>Reportes</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarInset>
  )
}
