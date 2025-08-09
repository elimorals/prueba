"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Stethoscope, Eye, EyeOff, Mail, Lock, Shield, Brain, Activity } from "lucide-react"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular autenticación
    setTimeout(() => {
      setIsLoading(false)
      // Redirigir al inicio
      window.location.href = "/"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-2 sm:p-4 safe-area-top safe-area-bottom">
      {/* Toggle de tema - Responsive */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 safe-area-top safe-area-right">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center">
        {/* Panel Izquierdo - Información (Oculto en móvil muy pequeño) */}
        <div className="hidden sm:block space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white">RADIX</h1>
              <p className="text-sm lg:text-xl text-teal-600 dark:text-teal-400 font-medium">Inteligencia Médica Avanzada</p>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">Revoluciona tu práctica médica con IA</h2>
            <p className="text-sm lg:text-lg text-gray-600 dark:text-gray-300">
              Plataforma especializada en radiología con análisis inteligente, reportes automáticos y diagnósticos
              asistidos por inteligencia artificial.
            </p>
          </div>

          {/* Características */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <div className="flex flex-col items-center p-3 lg:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-teal-600 dark:text-teal-400 mb-1 lg:mb-2" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">IA Especializada</span>
            </div>
            <div className="flex flex-col items-center p-3 lg:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400 mb-1 lg:mb-2" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Análisis DICOM</span>
            </div>
            <div className="flex flex-col items-center p-3 lg:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400 mb-1 lg:mb-2" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Seguro y Confiable</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario de Login */}
        <Card className="w-full max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
          {/* Header móvil solo para pantallas pequeñas */}
          <div className="sm:hidden p-4 text-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">RADIX</h1>
                <p className="text-xs text-teal-600 dark:text-teal-400">IA Médica</p>
              </div>
            </div>
          </div>
          <CardHeader className="space-y-1 text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Accede a tu cuenta de RADIX
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 sm:h-10 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-11 sm:h-10 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent tap-target"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-10 text-base bg-teal-600 hover:bg-teal-700 text-white tap-target" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ¿Olvidaste tu contraseña?{" "}
                <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Recuperar acceso
                </a>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                <strong>Demo:</strong> doctor@radixia.com / password123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
