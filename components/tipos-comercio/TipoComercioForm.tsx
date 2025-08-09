"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle } from "lucide-react"
import { type TipoComercio, tipoComercioService } from "../../services"
import { useToast } from "@/components/ui/use-toast"

interface TipoComercioFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tipoComercioId?: number
}

const initialTipoComercio: Omit<TipoComercio, "id_TipoComercio" | "fechaCreacion"> = {
  descripcion: "",
  estado: true,
}

export function TipoComercioForm({ isOpen, onClose, onSuccess, tipoComercioId }: TipoComercioFormProps) {
  const [tipoComercio, setTipoComercio] = useState<any>(initialTipoComercio)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const isEditing = !!tipoComercioId

  // Cargar datos del tipo de comercio si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && tipoComercioId) {
      setLoadingData(true)
      setErrors({})
      tipoComercioService
        .getById(tipoComercioId)
        .then((data) => {
          setTipoComercio(data)
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar tipo de comercio:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información del tipo de comercio",
            variant: "destructive",
          })
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      setTipoComercio({ ...initialTipoComercio })
      setErrors({})
    }
  }, [isOpen, tipoComercioId, isEditing, onClose, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTipoComercio({ ...tipoComercio, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setTipoComercio({ ...tipoComercio, [name]: checked })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!tipoComercio.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Crear objeto con solo los campos necesarios
      const tipoComercioData = {
        descripcion: tipoComercio.descripcion.trim(),
        estado: Boolean(tipoComercio.estado),
      }

      console.log("Enviando datos:", tipoComercioData)

      if (isEditing && tipoComercioId) {
        await tipoComercioService.update(tipoComercioId, tipoComercioData)
        toast({
          title: "Éxito",
          description: "Tipo de comercio actualizado correctamente",
        })
      } else {
        await tipoComercioService.create(tipoComercioData)
        toast({
          title: "Éxito",
          description: "Tipo de comercio creado correctamente",
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar tipo de comercio:", error)
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} el tipo de comercio. ${
          error instanceof Error ? error.message : ""
        }`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Nuevo"} Tipo de Comercio</DialogTitle>
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
                  value={tipoComercio.descripcion || ""}
                  onChange={handleChange}
                  className={errors.descripcion ? "border-destructive" : ""}
                  placeholder="Ej: Bar, Boliche, Restaurante"
                />
                {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={tipoComercio.estado}
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
