"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usuarioService } from "@/services"
import { ErrorAlert } from "@/components/ui/error-alert"
import { mapApiError, getErrorVariant } from "@/utils/errorUtils"

export function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    correo: "",
    telefono: "",
  })

  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        nombreUsuario: user.nombreUsuario || "",
        correo: user.correo || "",
        telefono: user.telefono || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      const errorMsg = "No hay usuario autenticado"
      setError(errorMsg)
      return
    }

    // Limpiar errores previos
    setError(null)
    setLoading(true)

    try {
      // Preparar datos para actualizar - IMPORTANTE: Enviar TODOS los campos requeridos
      const updateData = {
        // Campos que se están editando
        nombreUsuario: formData.nombreUsuario.trim(),
        telefono: formData.telefono.trim(),

        // Campos requeridos que no se editan pero deben enviarse
        correo: user.correo,
        uid: user.uid,
        iD_RolUsuario: user.iD_RolUsuario,
        estado: user.estado,
      }

      // Llamar al servicio de actualización
      await usuarioService.update(user.iD_Usuario, updateData)

      // Actualizar el contexto con los nuevos datos
      const updatedUser = {
        ...user,
        nombreUsuario: updateData.nombreUsuario,
        telefono: updateData.telefono,
      }

      updateUser(updatedUser)

      // Mostrar mensaje de éxito
      toast({
        title: "✅ Perfil actualizado",
        description: "Tu información se ha guardado correctamente.",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al actualizar perfil:", error)

      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      const mappedError = mapApiError(errorMessage)

      // Mostrar error en la interfaz
      setError(errorMessage)

      // También mostrar toast con el error mapeado
      toast({
        title: "Error al actualizar perfil",
        description: mappedError.message,
        variant: getErrorVariant(mappedError.type),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null)
  }

  const handleRetry = () => {
    setError(null)
    // Podrías implementar lógica de reintento aquí si es necesario
  }

  // Si no hay usuario, mostrar mensaje de carga
  if (!user) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>Actualiza tu información de perfil</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mostrar alerta de error si existe */}
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} onRetry={handleRetry} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
            <Input
              id="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={(e) => handleChange("nombreUsuario", e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
              className={error && error.includes("nombre") ? "border-red-500" : ""}
            />
          </div>

          <div>
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input id="correo" type="email" value={formData.correo} disabled className="bg-muted cursor-not-allowed" />
            <p className="text-sm text-muted-foreground mt-1">
              El correo electrónico no se puede modificar por seguridad
            </p>
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="Ingresa tu número de teléfono"
              className={error && error.includes("telefono") ? "border-red-500" : ""}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Perfil
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}