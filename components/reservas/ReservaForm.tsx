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
import {
  type Reserva,
  type Comercio,
  type Usuario,
  reservaService,
  comercioService,
  usuarioService,
} from "../../services"
import { useToast } from "@/components/ui/use-toast"

interface ReservaFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reservaId?: number
}

const initialReserva: Omit<Reserva, "iD_Reserva" | "fechaCreacion"> = {
  iD_Usuario: 0,
  iD_Comercio: 0,
  fechaReserva: "",
  tiempoTolerancia: "",
  comenzales: 1,
  estado: true,
}

export function ReservaForm({ isOpen, onClose, onSuccess, reservaId }: ReservaFormProps) {
  const [reserva, setReserva] = useState<any>(initialReserva)
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingComercios, setLoadingComercios] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const isEditing = !!reservaId

  // Cargar datos de la reserva si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && reservaId) {
      setLoadingData(true)
      setErrors({})
      reservaService
        .getById(reservaId)
        .then((data) => {
          // Formatear la fecha para el input datetime-local
          const fechaReserva = data.fechaReserva ? new Date(data.fechaReserva) : new Date()
          const formattedFechaReserva = fechaReserva.toISOString().slice(0, 16) // Formato YYYY-MM-DDTHH:MM

          setReserva({
            ...data,
            fechaReserva: formattedFechaReserva,
          })
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar reserva:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la reserva",
            variant: "destructive",
          })
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      const now = new Date()
      const formattedNow = now.toISOString().slice(0, 16) // Formato YYYY-MM-DDTHH:MM

      setReserva({
        ...initialReserva,
        fechaReserva: formattedNow,
      })
      setErrors({})
    }
  }, [isOpen, reservaId, isEditing, onClose, toast])

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
          console.error("Error al cargar datos:", error)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    // Convertir valores numéricos
    if (type === "number") {
      setReserva({ ...reserva, [name]: Number.parseInt(value) || 0 })
    } else {
      setReserva({ ...reserva, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Cambiando ${name} a ${value}`)
    setErrors({ ...errors, [name]: "" })

    // Convertir el valor a número entero
    const numValue = Number.parseInt(value, 10)

    // Verificar que sea un número válido
    if (!isNaN(numValue)) {
      console.log(`Asignando ${name}: ${numValue}`)
      setReserva((prevState) => ({
        ...prevState,
        [name]: numValue,
      }))
    } else {
      console.error(`Error al convertir valor para ${name}: ${value}`)
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setReserva({ ...reserva, [name]: checked })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!reserva.fechaReserva) {
      newErrors.fechaReserva = "La fecha de reserva es obligatoria"
    }

    if (!reserva.tiempoTolerancia?.trim()) {
      newErrors.tiempoTolerancia = "El tiempo de tolerancia es obligatorio"
    }

    if (!reserva.iD_Comercio) {
      newErrors.iD_Comercio = "Debes seleccionar un comercio"
    }

    if (!reserva.iD_Usuario) {
      newErrors.iD_Usuario = "Debes seleccionar un usuario"
    }

    if (reserva.comenzales <= 0) {
      newErrors.comenzales = "El número de comensales debe ser mayor a 0"
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
      const reservaData = {
        iD_Usuario: Number(reserva.iD_Usuario),
        iD_Comercio: Number(reserva.iD_Comercio),
        fechaReserva: reserva.fechaReserva,
        tiempoTolerancia: reserva.tiempoTolerancia.trim(),
        comenzales: Number(reserva.comenzales),
        estado: Boolean(reserva.estado),
      }

      console.log("Enviando datos:", reservaData)

      if (isEditing && reservaId) {
        await reservaService.update(reservaId, reservaData)
        toast({
          title: "Éxito",
          description: "Reserva actualizada correctamente",
        })
      } else {
        await reservaService.create(reservaData)
        toast({
          title: "Éxito",
          description: "Reserva creada correctamente",
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar reserva:", error)
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} la reserva. ${
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
          <DialogTitle>{isEditing ? "Editar" : "Nueva"} Reserva</DialogTitle>
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
                  value={reserva.iD_Usuario ? reserva.iD_Usuario.toString() : ""}
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
                  value={reserva.iD_Comercio ? reserva.iD_Comercio.toString() : ""}
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
                <Label htmlFor="fechaReserva" className="flex items-center gap-1">
                  Fecha y Hora de Reserva {errors.fechaReserva && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="fechaReserva"
                  name="fechaReserva"
                  type="datetime-local"
                  value={reserva.fechaReserva || ""}
                  onChange={handleChange}
                  className={errors.fechaReserva ? "border-destructive" : ""}
                />
                {errors.fechaReserva && <p className="text-sm text-destructive">{errors.fechaReserva}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tiempoTolerancia" className="flex items-center gap-1">
                    Tiempo de Tolerancia{" "}
                    {errors.tiempoTolerancia && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="tiempoTolerancia"
                    name="tiempoTolerancia"
                    value={reserva.tiempoTolerancia || ""}
                    onChange={handleChange}
                    className={errors.tiempoTolerancia ? "border-destructive" : ""}
                    placeholder="Ej: 15 minutos"
                  />
                  {errors.tiempoTolerancia && <p className="text-sm text-destructive">{errors.tiempoTolerancia}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comenzales" className="flex items-center gap-1">
                    Comensales {errors.comenzales && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="comenzales"
                    name="comenzales"
                    type="number"
                    min="1"
                    value={reserva.comenzales || 1}
                    onChange={handleChange}
                    className={errors.comenzales ? "border-destructive" : ""}
                  />
                  {errors.comenzales && <p className="text-sm text-destructive">{errors.comenzales}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={reserva.estado}
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
