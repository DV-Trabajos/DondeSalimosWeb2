"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { type Publicidad, type Comercio, publicidadService, comercioService } from "../../services"
import { useToast } from "@/components/ui/use-toast"

interface PublicidadFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  publicidadId?: number
}

const initialPublicidad: Omit<Publicidad, "iD_Publicidad" | "fechaCreacion"> = {
  descripcion: "",
  visualizaciones: 0,
  tiempo: "",
  estado: true,
  iD_Comercio: 0,
}

export function PublicidadForm({ isOpen, onClose, onSuccess, publicidadId }: PublicidadFormProps) {
  const [publicidad, setPublicidad] = useState<any>(initialPublicidad)
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingComercios, setLoadingComercios] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const isEditing = !!publicidadId

  // Cargar datos de la publicidad si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && publicidadId) {
      setLoadingData(true)
      setErrors({})
      publicidadService
        .getById(publicidadId)
        .then((data) => {
          setPublicidad(data)
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar publicidad:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la publicidad",
            variant: "destructive",
          })
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      setPublicidad({ ...initialPublicidad })
      setErrors({})
    }
  }, [isOpen, publicidadId, isEditing, onClose, toast])

  // Cargar comercios
  useEffect(() => {
    if (isOpen) {
      setLoadingComercios(true)
      comercioService
        .getAll()
        .then((data) => {
          // Filtrar solo comercios activos
          const comerciosActivos = data.filter((comercio) => comercio.estado)
          setComercios(comerciosActivos)
        })
        .catch((error) => {
          console.error("Error al cargar comercios:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los comercios",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoadingComercios(false)
        })
    }
  }, [isOpen, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    // Convertir valores numéricos
    if (type === "number") {
      setPublicidad({ ...publicidad, [name]: Number.parseInt(value) || 0 })
    } else {
      setPublicidad({ ...publicidad, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Cambiando ${name} a ${value}`)

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "iD_Comercio") {
      // Convertir el valor a número entero
      const numValue = Number.parseInt(value, 10)

      // Verificar que sea un número válido
      if (!isNaN(numValue)) {
        console.log(`Asignando ${name}: ${numValue}`)
        setPublicidad((prevState) => ({
          ...prevState,
          [name]: numValue,
        }))
      } else {
        console.error(`Error al convertir valor para ${name}: ${value}`)
      }
    } else {
      setPublicidad((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPublicidad({ ...publicidad, [name]: checked })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!publicidad.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es obligatoria"
    }

    if (!publicidad.tiempo?.trim()) {
      newErrors.tiempo = "El tiempo es obligatorio"
    }

    if (!publicidad.iD_Comercio) {
      newErrors.iD_Comercio = "Debes seleccionar un comercio"
    }

    if (publicidad.visualizaciones < 0) {
      newErrors.visualizaciones = "Las visualizaciones no pueden ser negativas"
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
      // Crear objeto con los campos necesarios
      const publicidadData = {
        descripcion: publicidad.descripcion.trim(),
        visualizaciones: Number(publicidad.visualizaciones),
        tiempo: publicidad.tiempo.trim(),
        estado: Boolean(publicidad.estado),
        iD_Comercio: Number(publicidad.iD_Comercio),
      }

      console.log("Enviando datos:", publicidadData)

      if (isEditing && publicidadId) {
        await publicidadService.update(publicidadId, publicidadData)
        toast({
          title: "Éxito",
          description: "Publicidad actualizada correctamente",
        })
      } else {
        await publicidadService.create(publicidadData)
        toast({
          title: "Éxito",
          description: "Publicidad creada correctamente",
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar publicidad:", error)
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} la publicidad. ${
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
          <DialogTitle>{isEditing ? "Editar" : "Nueva"} Publicidad</DialogTitle>
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
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={publicidad.descripcion || ""}
                  onChange={handleChange}
                  className={errors.descripcion ? "border-destructive" : ""}
                  placeholder="Ej: Promoción de verano 2x1 en tragos"
                  rows={3}
                />
                {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iD_Comercio" className="flex items-center gap-1">
                  Comercio {errors.iD_Comercio && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {loadingComercios && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
                </Label>
                <Select
                  value={publicidad.iD_Comercio ? publicidad.iD_Comercio.toString() : ""}
                  onValueChange={(value) => handleSelectChange("iD_Comercio", value)}
                  disabled={loadingComercios || comercios.length === 0}
                >
                  <SelectTrigger className={errors.iD_Comercio ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar comercio" />
                  </SelectTrigger>
                  <SelectContent>
                    {comercios.length > 0 ? (
                      comercios.map((comercio) => (
                        <SelectItem key={`comercio-${comercio.iD_Comercio}`} value={comercio.iD_Comercio.toString()}>
                          {comercio.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="no-comercios" value="no-disponible" disabled>
                        No hay comercios disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.iD_Comercio && <p className="text-sm text-destructive">{errors.iD_Comercio}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visualizaciones" className="flex items-center gap-1">
                    Visualizaciones {errors.visualizaciones && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="visualizaciones"
                    name="visualizaciones"
                    type="number"
                    min="0"
                    value={publicidad.visualizaciones || 0}
                    onChange={handleChange}
                    className={errors.visualizaciones ? "border-destructive" : ""}
                  />
                  {errors.visualizaciones && <p className="text-sm text-destructive">{errors.visualizaciones}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiempo" className="flex items-center gap-1">
                    Tiempo {errors.tiempo && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="tiempo"
                    name="tiempo"
                    value={publicidad.tiempo || ""}
                    onChange={handleChange}
                    className={errors.tiempo ? "border-destructive" : ""}
                    placeholder="Ej: 30 días"
                  />
                  {errors.tiempo && <p className="text-sm text-destructive">{errors.tiempo}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={publicidad.estado}
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
