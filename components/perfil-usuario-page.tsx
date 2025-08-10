"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Calendar,
  Settings,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  Plus,
  Coins,
  Activity,
  Mail,
  Building,
  Stethoscope,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PerfilUsuarioPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    push: false,
    reportes: true,
    estudios: true,
    sistema: false,
  })

  const [configuracion, setConfiguracion] = useState({
    tema: "system",
    idioma: "es",
    timezone: "America/Mexico_City",
    autoGuardado: true,
    analisisIA: true,
  })

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-xl font-semibold text-foreground truncate">Perfil de Usuario</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Gestiona tu cuenta y configuración de RADIX</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Hoy: 2 Enero, 2025
            </Button>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
            {/* Header del Perfil */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-20 h-20 lg:w-24 lg:h-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-xl lg:text-2xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                        MG
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-teal-600 hover:bg-teal-700"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 mb-2">
                      <h2 className="text-xl lg:text-2xl font-bold text-foreground truncate">Dr. María González</h2>
                      <Badge className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 self-center sm:self-start">
                        <Stethoscope className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Radióloga Certificada</span>
                        <span className="sm:hidden">Radióloga</span>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm lg:text-base">
                      Especialista en Radiología • Hospital General CDMX • 12 años de experiencia
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">maria.gonzalez@hospital.com</span>
                      </div>
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        <Building className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Hospital General CDMX</span>
                      </div>
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        <Activity className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden lg:inline">Última actividad: Hace 2 horas</span>
                        <span className="lg:hidden">Activa</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="text-xl lg:text-2xl font-bold text-teal-600 dark:text-teal-400">1,247</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">Créditos disponibles</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs de Configuración */}
            <Tabs defaultValue="perfil" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
                <TabsTrigger value="perfil" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <User className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="cuenta" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Settings className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Cuenta</span>
                </TabsTrigger>
                <TabsTrigger value="creditos" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <CreditCard className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Créditos</span>
                </TabsTrigger>
                <TabsTrigger value="seguridad" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Seguridad</span>
                </TabsTrigger>
                <TabsTrigger value="notificaciones" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Bell className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Notificaciones</span>
                </TabsTrigger>
                <TabsTrigger value="preferencias" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Palette className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Preferencias</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab: Perfil Personal */}
              <TabsContent value="perfil" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>Actualiza tu información profesional</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input id="nombre" defaultValue="María" />
                        </div>
                        <div>
                          <Label htmlFor="apellido">Apellidos</Label>
                          <Input id="apellido" defaultValue="González Rodríguez" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="especialidad">Especialidad</Label>
                        <Select defaultValue="radiologia">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="radiologia">Radiología</SelectItem>
                            <SelectItem value="cardiologia">Cardiología</SelectItem>
                            <SelectItem value="neurologia">Neurología</SelectItem>
                            <SelectItem value="oncologia">Oncología</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cedula">Cédula Profesional</Label>
                        <Input id="cedula" defaultValue="12345678" />
                      </div>
                      <div>
                        <Label htmlFor="hospital">Hospital/Institución</Label>
                        <Input id="hospital" defaultValue="Hospital General CDMX" />
                      </div>
                      <div>
                        <Label htmlFor="bio">Biografía Profesional</Label>
                        <Textarea
                          id="bio"
                          placeholder="Describe tu experiencia y especialización..."
                          defaultValue="Radióloga con 12 años de experiencia especializada en diagnóstico por imagen y medicina nuclear."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Contacto</CardTitle>
                      <CardDescription>Datos de contacto profesional</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Profesional</Label>
                        <Input id="email" type="email" defaultValue="maria.gonzalez@hospital.com" />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" defaultValue="+52 55 1234-5678" />
                      </div>
                      <div>
                        <Label htmlFor="direccion">Dirección del Consultorio</Label>
                        <Textarea
                          id="direccion"
                          defaultValue="Av. Cuauhtémoc 330, Doctores, Cuauhtémoc, 06720 Ciudad de México, CDMX"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ciudad">Ciudad</Label>
                          <Input id="ciudad" defaultValue="Ciudad de México" />
                        </div>
                        <div>
                          <Label htmlFor="pais">País</Label>
                          <Select defaultValue="mexico">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mexico">México</SelectItem>
                              <SelectItem value="colombia">Colombia</SelectItem>
                              <SelectItem value="argentina">Argentina</SelectItem>
                              <SelectItem value="chile">Chile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </TabsContent>

              {/* Tab: Configuración de Cuenta */}
              <TabsContent value="cuenta" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de la Aplicación</CardTitle>
                      <CardDescription>Personaliza tu experiencia en RADIX</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Análisis IA Automático</Label>
                          <p className="text-sm text-muted-foreground">Activar análisis automático al subir estudios</p>
                        </div>
                        <Switch
                          checked={configuracion.analisisIA}
                          onCheckedChange={(checked) => setConfiguracion((prev) => ({ ...prev, analisisIA: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-guardado</Label>
                          <p className="text-sm text-muted-foreground">Guardar cambios automáticamente</p>
                        </div>
                        <Switch
                          checked={configuracion.autoGuardado}
                          onCheckedChange={(checked) =>
                            setConfiguracion((prev) => ({ ...prev, autoGuardado: checked }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Idioma de la Interfaz</Label>
                        <Select
                          value={configuracion.idioma}
                          onValueChange={(value) => setConfiguracion((prev) => ({ ...prev, idioma: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Zona Horaria</Label>
                        <Select
                          value={configuracion.timezone}
                          onValueChange={(value) => setConfiguracion((prev) => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                            <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                            <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                            <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Gestión de Datos</CardTitle>
                      <CardDescription>Controla tus datos y privacidad</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar mis datos
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Upload className="w-4 h-4 mr-2" />
                        Importar configuración
                      </Button>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-red-600 dark:text-red-400">Zona de Peligro</Label>
                        <Button variant="destructive" className="w-full justify-start">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar cuenta permanentemente
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Créditos y Facturación */}
              <TabsContent value="creditos" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Resumen de Créditos */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        Resumen de Créditos
                      </CardTitle>
                      <CardDescription>Gestiona tus créditos y consumo de IA</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-teal-600 dark:text-teal-400">1,247</div>
                          <div className="text-xs lg:text-sm text-muted-foreground">Créditos Disponibles</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">453</div>
                          <div className="text-xs lg:text-sm text-muted-foreground">Usados Este Mes</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">$89</div>
                          <div className="text-xs lg:text-sm text-muted-foreground">Ahorro Este Mes</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Análisis de Imágenes IA</div>
                            <div className="text-sm text-muted-foreground">2 créditos por análisis</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">340 usados</div>
                            <div className="text-sm text-muted-foreground">680 créditos</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Chat IA Médico</div>
                            <div className="text-sm text-muted-foreground">1 crédito por consulta</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">89 usados</div>
                            <div className="text-sm text-muted-foreground">89 créditos</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Generación de Reportes</div>
                            <div className="text-sm text-muted-foreground">3 créditos por reporte</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">28 usados</div>
                            <div className="text-sm text-muted-foreground">84 créditos</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Planes de Créditos */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Comprar Créditos</CardTitle>
                      <CardDescription>Recarga tu cuenta con más créditos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-foreground">500 Créditos</div>
                              <div className="text-sm text-muted-foreground">Básico</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-foreground">$49</div>
                              <div className="text-xs text-muted-foreground">$0.098/crédito</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-2 border-teal-500 rounded-lg bg-teal-50 dark:bg-teal-900/20 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-foreground">1,500 Créditos</div>
                              <div className="text-sm text-teal-600 dark:text-teal-400">Recomendado</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-foreground">$129</div>
                              <div className="text-xs text-muted-foreground">$0.086/crédito</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-foreground">3,000 Créditos</div>
                              <div className="text-sm text-muted-foreground">Profesional</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-foreground">$239</div>
                              <div className="text-xs text-muted-foreground">$0.080/crédito</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Comprar Créditos
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Historial de Transacciones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Transacciones</CardTitle>
                    <CardDescription>Últimas compras y consumos de créditos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">Compra de créditos</div>
                            <div className="text-sm text-muted-foreground">28 Dic 2024, 14:30</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 dark:text-green-400">+1,500</div>
                          <div className="text-sm text-muted-foreground">$129.00</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">Análisis IA - Radiografía</div>
                            <div className="text-sm text-muted-foreground">2 Ene 2025, 10:15</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600 dark:text-red-400">-2</div>
                          <div className="text-sm text-muted-foreground">Análisis</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Seguridad */}
              <TabsContent value="seguridad" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cambiar Contraseña</CardTitle>
                      <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input id="new-password" type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input id="confirm-password" type="password" placeholder="••••••••" />
                      </div>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">Actualizar Contraseña</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sesiones Activas</CardTitle>
                      <CardDescription>Dispositivos con acceso a tu cuenta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">MacBook Pro - Chrome</div>
                            <div className="text-sm text-muted-foreground">Ciudad de México • Actual</div>
                          </div>
                          <Badge variant="secondary">Activa</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">iPhone 14 - Safari</div>
                            <div className="text-sm text-muted-foreground">Ciudad de México • Hace 2 horas</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Cerrar
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">iPad - Safari</div>
                            <div className="text-sm text-muted-foreground">Ciudad de México • Hace 1 día</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Cerrar
                          </Button>
                        </div>
                      </div>
                      <Button variant="destructive" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar todas las sesiones
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Notificaciones */}
              <TabsContent value="notificaciones" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferencias de Notificaciones</CardTitle>
                    <CardDescription>Controla qué notificaciones quieres recibir</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificaciones por Email</Label>
                          <p className="text-sm text-muted-foreground">Recibir notificaciones en tu correo</p>
                        </div>
                        <Switch
                          checked={notificaciones.email}
                          onCheckedChange={(checked) => setNotificaciones((prev) => ({ ...prev, email: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificaciones Push</Label>
                          <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
                        </div>
                        <Switch
                          checked={notificaciones.push}
                          onCheckedChange={(checked) => setNotificaciones((prev) => ({ ...prev, push: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Reportes Completados</Label>
                          <p className="text-sm text-muted-foreground">Cuando se complete un análisis IA</p>
                        </div>
                        <Switch
                          checked={notificaciones.reportes}
                          onCheckedChange={(checked) => setNotificaciones((prev) => ({ ...prev, reportes: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Nuevos Estudios</Label>
                          <p className="text-sm text-muted-foreground">Cuando se asignen nuevos estudios</p>
                        </div>
                        <Switch
                          checked={notificaciones.estudios}
                          onCheckedChange={(checked) => setNotificaciones((prev) => ({ ...prev, estudios: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Actualizaciones del Sistema</Label>
                          <p className="text-sm text-muted-foreground">Nuevas funciones y mantenimiento</p>
                        </div>
                        <Switch
                          checked={notificaciones.sistema}
                          onCheckedChange={(checked) => setNotificaciones((prev) => ({ ...prev, sistema: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Preferencias */}
              <TabsContent value="preferencias" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Apariencia</CardTitle>
                      <CardDescription>Personaliza la interfaz de usuario</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Tema de la Aplicación</Label>
                        <Select
                          value={configuracion.tema}
                          onValueChange={(value) => setConfiguracion((prev) => ({ ...prev, tema: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Oscuro</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tamaño de Fuente</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Pequeña</SelectItem>
                            <SelectItem value="medium">Mediana</SelectItem>
                            <SelectItem value="large">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Densidad de la Interfaz</Label>
                        <Select defaultValue="comfortable">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compacta</SelectItem>
                            <SelectItem value="comfortable">Cómoda</SelectItem>
                            <SelectItem value="spacious">Espaciosa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración del Visor DICOM</CardTitle>
                      <CardDescription>Preferencias para visualización de imágenes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Calidad de Renderizado</Label>
                        <Select defaultValue="high">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja (Rápida)</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta (Lenta)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Herramientas por Defecto</Label>
                        <Select defaultValue="zoom">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cursor">Cursor</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="pan">Panorámica</SelectItem>
                            <SelectItem value="measure">Medición</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Mostrar Información DICOM</Label>
                          <p className="text-sm text-muted-foreground">Overlay con datos del estudio</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarInset>
  )
}
