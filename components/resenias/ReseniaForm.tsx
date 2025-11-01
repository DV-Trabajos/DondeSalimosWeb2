"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  type Resenia,
  type Comercio,
  type Usuario,
  reseniaService,
  comercioService,
  usuarioService,
} from "../../services"
import { useToast } from "@/components/ui/use-toast"

interface ReseniaFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reseniaId?: number
}

const initialResenia: Omit<Resenia, "iD_Resenia" | "fechaCreacion"> = {
  iD_Usuario: 0,
  iD_Comercio: 0,
  comentario: "",
  estado: true,
}

export function ReseniaForm({ isOpen, onClose, onSuccess, reseniaId }: ReseniaFormProps) {
  const [resenia, setResenia] = useState<any>(initialResenia)
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingComercios, setLoadingComercios] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const isEditing = !!reseniaId

  // Cargar datos de la reseña si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && reseniaId) {
      setLoadingData(true)
      setErrors({})
      reseniaService
        .getById(reseniaId)
        .then((data) => {
          setResenia(data)
          setLoadingData(false)
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la reseña",
            variant: "destructive",
          })
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      setResenia({ ...initialResenia })
      setErrors({})
    }
  }, [isOpen, reseniaId, isEditing, onClose, toast])

  // Cargar comercios y usuarios
  useEffect(() => {
    if (isOpen) {
      setLoadingComercios(true)
      setLoadingUsuarios(true)

      Promise.all([comercioService.getAll(), usuarioService.getAll()])
        .then(([comerciosData, usuariosData]) => {
          // Filtrar solo comercios y usuarios activos
          setComercios(comerciosData.filter((comercio) => comercio.estado))
          setUsuarios(usuariosData.filter((usuario) => usuario.estado))
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos necesarios",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoadingComercios(false)
          setLoadingUsuarios(false)
        })
    }
  }, [isOpen, toast])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setResenia({ ...resenia, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const handleSelectChange = (name: string, value: string) => {
    setErrors({ ...errors, [name]: "" })

    // Convertir el valor a número entero
    const numValue = Number.parseInt(value, 10)

    // Verificar que sea un número válido
    if (!isNaN(numValue)) {
      setResenia((prevState) => ({
        ...prevState,
        [name]: numValue,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setResenia({ ...resenia, [name]: checked })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!resenia.comentario?.trim()) {
      newErrors.comentario = "El comentario es obligatorio"
    }

    if (!resenia.iD_Comercio) {
      newErrors.iD_Comercio = "Debes seleccionar un comercio"
    }

    if (!resenia.iD_Usuario) {
      newErrors.iD_Usuario = "Debes seleccionar un usuario"
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
      const reseniaData = {
        iD_Usuario: Number(resenia.iD_Usuario),
        iD_Comercio: Number(resenia.iD_Comercio),
        comentario: resenia.comentario.trim(),
        estado: Boolean(resenia.estado),
      }
      
      if (isEditing && reseniaId) {
        await reseniaService.update(reseniaId, reseniaData)
        toast({
          title: "Éxito",
          description: "Reseña actualizada correctamente",
        })
      } else {
        await reseniaService.create(reseniaData)
        toast({
          title: "Éxito",
          description: "Reseña creada correctamente",
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} la reseña. ${
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
          <DialogTitle>{isEditing ? "Editar" : "Nueva"} Reseña</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="iD_Usuario" className="flex items-center gap-1">
                  Usuario {errors.iD_Usuario && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {loadingUsuarios && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
                </Label>
                <Select
                  value={resenia.iD_Usuario ? resenia.iD_Usuario.toString() : ""}
                  onValueChange={(value) => handleSelectChange("iD_Usuario", value)}
                  disabled={loadingUsuarios || usuarios.length === 0}
                >
                  <SelectTrigger className={errors.iD_Usuario ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.length > 0 ? (
                      usuarios.map((usuario) => (
                        <SelectItem key={`usuario-${usuario.iD_Usuario}`} value={usuario.iD_Usuario.toString()}>
                          {usuario.nombreUsuario} ({usuario.correo})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="no-usuarios" value="no-disponible" disabled>
                        No hay usuarios disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.iD_Usuario && <p className="text-sm text-destructive">{errors.iD_Usuario}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iD_Comercio" className="flex items-center gap-1">
                  Comercio {errors.iD_Comercio && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {loadingComercios && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
                </Label>
                <Select
                  value={resenia.iD_Comercio ? resenia.iD_Comercio.toString() : ""}
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

              <div className="space-y-2">
                <Label htmlFor="comentario" className="flex items-center gap-1">
                  Comentario {errors.comentario && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Textarea
                  id="comentario"
                  name="comentario"
                  value={resenia.comentario || ""}
                  onChange={handleTextareaChange}
                  className={errors.comentario ? "border-destructive" : ""}
                  placeholder="Escribe tu comentario aquí..."
                  rows={4}
                />
                {errors.comentario && <p className="text-sm text-destructive">{errors.comentario}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={resenia.estado}
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
