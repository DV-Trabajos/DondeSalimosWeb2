"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

type UserType = 1 | 2 // 1 = Usuario, 2 = Comercio

interface RegisterFormProps {
  className?: string
}

export function RegisterForm({ className }: RegisterFormProps) {
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserType) {
      alert("Por favor selecciona el tipo de registro")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`https://localhost:7283/api/usuarios/registrarseConGoogle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          userType: selectedUserType,
        }),
      })

      if (response.ok) {
        alert("Registro exitoso!")
        // Aquí puedes redirigir al usuario o hacer login automático
      } else {
        const errorData = await response.json()
        alert(`Error en el registro: ${errorData.message || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedUserType(null)
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {!selectedUserType ? (
        // Pantalla de selección de tipo de usuario
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">Elige el tipo de cuenta que necesitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-200 bg-transparent"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Iniciar sesión con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">O registrarse con email</span>
              </div>
            </div>

            {/* User Type Selection */}
            <div className="space-y-3">
              <Button
                onClick={() => handleUserTypeSelect(1)}
                variant="outline"
                className="w-full h-20 text-left flex items-center justify-start p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Registrarme como Usuario</div>
                    <div className="text-sm text-gray-500">Para buscar lugares y eventos</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleUserTypeSelect(2)}
                variant="outline"
                className="w-full h-20 text-left flex items-center justify-start p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Registrarme como Comercio</div>
                    <div className="text-sm text-gray-500">Para publicar mi negocio y eventos</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Inicia sesión
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Formulario de registro
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {selectedUserType === 1 ? "Registro de Usuario" : "Registro de Comercio"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {selectedUserType === 1
                ? "Crea tu cuenta para descubrir lugares increíbles"
                : "Registra tu negocio y conecta con clientes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {selectedUserType === 1 ? "Nombre completo" : "Nombre del comercio"}
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={selectedUserType === 1 ? "Tu nombre completo" : "Nombre de tu negocio"}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 border-gray-200 hover:bg-gray-50 bg-transparent"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {isLoading ? "Registrando..." : "Registrarse"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}