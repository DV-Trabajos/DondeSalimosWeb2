"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle } from "lucide-react"
import { type RolUsuario, rolUsuarioService } from "../../services"
import { useNotifications, NOTIFICATION_MESSAGES } from "@/lib/notifications"

interface RolFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  rolId?: number
}

const initialRol: Omit<RolUsuario, "iD_RolUsuario" | "fechaCreacion"> = {
  descripcion: "",
  estado: true,
}

export function RolForm({ isOpen, onClose, onSuccess, rolId }: RolFormProps) {
  const [rol, setRol] = useState<any>(initialRol)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showSuccess, showError, showWarning } = useNotifications()
  const isEditing = !!rolId

  // Cargar datos del rol si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && rolId) {
      setLoadingData(true)
      setErrors({})
      rolUsuarioService
        .getById(rolId)
        .then((data) => {
          setRol(data)
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar rol:", error)
          showError(NOTIFICATION_MESSAGES.roles.error.load, error)
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      setRol({ ...initialRol })
      setErrors({})
    }
  }, [isOpen, rolId, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRol({ ...rol, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setRol({ ...rol, [name]: checked })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!rol.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showWarning(NOTIFICATION_MESSAGES.validation.form)
      return
    }

    setLoading(true)

    try {
      // Crear objeto con los campos necesarios
      const rolData = {
        descripcion: rol.descripcion.trim(),
        estado: Boolean(rol.estado),
      }

      // Si estamos editando, incluir el ID del rol
      if (isEditing && rolId) {
        rolData.iD_RolUsuario = rolId
      }

      console.log("Enviando datos:", rolData)

      if (isEditing && rolId) {
        await rolUsuarioService.update(rolId, rolData)
        showSuccess(NOTIFICATION_MESSAGES.roles.updated)
      } else {
        await rolUsuarioService.create(rolData)
        showSuccess(NOTIFICATION_MESSAGES.roles.created)
      }
      onSuccess()
      onClose()
      } catch (error) {
        console.error("Error al guardar rol:", error)
        const errorMessage = isEditing 
          ? NOTIFICATION_MESSAGES.roles.error.update
          : NOTIFICATION_MESSAGES.roles.error.create
        showError(errorMessage, error instanceof Error ? error : undefined)
      } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Nuevo"} Rol</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="flex items-center gap-1">
                  Descripción {errors.descripcion && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  value={rol.descripcion || ""}
                  onChange={handleChange}
                  className={errors.descripcion ? "border-destructive" : ""}
                  placeholder="Ej: Administrador, Usuario, Gerente"
                />
                {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={rol.estado}
                  onCheckedChange={(checked) => handleSwitchChange("estado", checked)}
                />
                <Label htmlFor="estado">Activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
