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
import { type Comercio, type TipoComercio, type Usuario, comercioService, usuarioService } from "../../services"
import { useNotifications, NOTIFICATION_MESSAGES } from "@/lib/notifications"

interface ComercioFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  comercioId?: number
  tiposComercio?: TipoComercio[]
}

const initialComercio: Omit<Comercio, "iD_Comercio" | "fechaCreacion"> = {
  nombre: "",
  capacidad: 0,
  mesas: 0,
  generoMusical: "",
  tipoDocumento: "DNI", // Valor por defecto explícito
  nroDocumento: "",
  direccion: "",
  horaIngreso: "",
  horaCierre: "",
  correo: "",
  telefono: "",
  estado: true,
  iD_TipoComercio: 0,
  iD_Usuario: 0,
}

// Tipos de documento válidos
const TIPOS_DOCUMENTO = ["DNI", "CUIT", "CUIL"] as const
type TipoDocumento = typeof TIPOS_DOCUMENTO[number]

export function ComercioForm({ isOpen, onClose, onSuccess, comercioId, tiposComercio = [] }: ComercioFormProps) {
  const [comercio, setComercio] = useState<any>(initialComercio)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showSuccess, showError, showWarning } = useNotifications()
  const isEditing = !!comercioId

  // Función helper para normalizar el tipo de documento
  const normalizeTipoDocumento = (tipo: string | null | undefined): TipoDocumento => {
    if (!tipo) return "DNI"
    const tipoUpper = tipo.toUpperCase().trim()
    return TIPOS_DOCUMENTO.includes(tipoUpper as TipoDocumento) ? (tipoUpper as TipoDocumento) : "DNI"
  }

  // Cargar datos del comercio si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && comercioId) {
      setLoadingData(true)
      setErrors({})
      comercioService
        .getById(comercioId)
        .then((data) => {
          console.log("Datos del comercio recibidos:", data)
          console.log("Tipo de documento original:", data.tipoDocumento)
          
          // Normalizar el tipo de documento
          const tipoDocumentoNormalizado = normalizeTipoDocumento(data.tipoDocumento)
          console.log("Tipo de documento normalizado:", tipoDocumentoNormalizado)
          
          // Asegurarse de que todos los campos estén correctamente asignados
          setComercio({
            ...data,
            tipoDocumento: tipoDocumentoNormalizado,
            // Asegurar que los valores numéricos sean números
            capacidad: Number(data.capacidad) || 0,
            mesas: Number(data.mesas) || 0,
            iD_TipoComercio: Number(data.iD_TipoComercio) || 0,
            iD_Usuario: Number(data.iD_Usuario) || 0,
          })
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar comercio:", error)
          showError(NOTIFICATION_MESSAGES.comercios.error.load, error)
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Reiniciar el formulario con valores iniciales
      console.log("Reiniciando formulario con valores por defecto")
      setComercio({ ...initialComercio })
      setErrors({})
    }
  }, [isOpen, comercioId, isEditing])

  // Cargar usuarios para el selector
  useEffect(() => {
    if (isOpen) {
      setLoadingUsuarios(true)

      usuarioService
        .getAll()
        .then((data) => {
          if (Array.isArray(data)) {
            const usuariosActivos = data.filter((usuario) => usuario.estado)
            setUsuarios(usuariosActivos)
          } else {
            console.error("La respuesta de usuarios no es un array:", data)
            setUsuarios([])
          }
        })
        .catch((error) => {
          console.error("Error al cargar usuarios:", error)
          showError(NOTIFICATION_MESSAGES.comercios.error.load, error)
          setUsuarios([])
        })
        .finally(() => {
          setLoadingUsuarios(false)
        })
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    // Convertir valores numéricos
    if (type === "number") {
      setComercio({ ...comercio, [name]: Number.parseInt(value) || 0 })
    } else {
      setComercio({ ...comercio, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Cambiando ${name} a ${value}`)

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "iD_TipoComercio" || name === "iD_Usuario") {
      const numValue = Number.parseInt(value, 10)
      if (!isNaN(numValue)) {
        setComercio((prevState) => ({
          ...prevState,
          [name]: numValue,
        }))
      }
    } else if (name === "tipoDocumento") {
      // Para tipo de documento, guardamos el string directamente
      const tipoNormalizado = normalizeTipoDocumento(value)
      console.log(`Tipo de documento seleccionado: ${tipoNormalizado}`)
      setComercio((prevComercio) => ({
        ...prevComercio,
        tipoDocumento: tipoNormalizado,
      }))
    } else {
      setComercio((prevComercio) => ({
        ...prevComercio,
        [name]: value,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setComercio({ ...comercio, [name]: checked })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // ... validaciones existentes ...

    // ⭐ AGREGAR estas validaciones:
    if (!comercio.horaIngreso?.trim()) {
      newErrors.horaIngreso = "La hora de ingreso es obligatoria"
    }

    if (!comercio.horaCierre?.trim()) {
      newErrors.horaCierre = "La hora de cierre es obligatoria"
    }

    // Validar que la hora de cierre sea después de la hora de ingreso
    // (considerando que puede cerrar después de medianoche)
    if (comercio.horaIngreso && comercio.horaCierre) {
      const [horaIng, minIng] = comercio.horaIngreso.split(':').map(Number)
      const [horaCie, minCie] = comercio.horaCierre.split(':').map(Number)
      
      // Si ambas horas son del mismo día (ej: 20:00 a 23:00)
      // O si cierra después de medianoche (ej: 22:00 a 05:00 es válido)
      const ingresoMinutos = horaIng * 60 + minIng
      const cierreMinutos = horaCie * 60 + minCie
      
      // Solo validar si cierra el mismo día
      if (cierreMinutos > ingresoMinutos * 0.5 && cierreMinutos <= ingresoMinutos) {
        newErrors.horaCierre = "La hora de cierre debe ser posterior a la hora de ingreso"
      }
    }

    if (!comercio.nombre?.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!comercio.direccion?.trim()) {
      newErrors.direccion = "La dirección es obligatoria"
    }

    if (!comercio.correo?.trim()) {
      newErrors.correo = "El correo es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(comercio.correo)) {
      newErrors.correo = "El correo no es válido"
    }

    if (!comercio.telefono?.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    }

    if (!comercio.nroDocumento?.trim()) {
      newErrors.nroDocumento = "El número de documento es obligatorio"
    }

    if (!comercio.iD_TipoComercio) {
      newErrors.iD_TipoComercio = "Debes seleccionar un tipo de comercio"
    }

    if (!comercio.iD_Usuario) {
      newErrors.iD_Usuario = "Debes seleccionar un usuario responsable"
    }

    if (comercio.capacidad <= 0) {
      newErrors.capacidad = "La capacidad debe ser mayor a 0"
    }

    if (comercio.mesas < 0) {
      newErrors.mesas = "El número de mesas no puede ser negativo"
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
      const comercioData = {
        nombre: comercio.nombre.trim(),
        capacidad: Number(comercio.capacidad),
        mesas: Number(comercio.mesas),
        generoMusical: comercio.generoMusical?.trim() || "",
        tipoDocumento: comercio.tipoDocumento, // Ya está normalizado
        nroDocumento: comercio.nroDocumento.trim(),
        direccion: comercio.direccion.trim(),
        horaIngreso: comercio.horaIngreso,
        horaCierre: comercio.horaCierre,
        correo: comercio.correo.trim(),
        telefono: comercio.telefono.trim(),
        estado: Boolean(comercio.estado),
        iD_TipoComercio: Number(comercio.iD_TipoComercio),
        iD_Usuario: Number(comercio.iD_Usuario),
      }

      console.log("Datos a enviar:", comercioData)

      if (isEditing && comercioId) {
        await comercioService.update(comercioId, comercioData)
        showSuccess({
          title: NOTIFICATION_MESSAGES.comercio.updated.title,
          description: NOTIFICATION_MESSAGES.comercio.updated.description,
        })
      } else {
        await comercioService.create(comercioData)
        showSuccess({
          title: NOTIFICATION_MESSAGES.comercio.created.title,
          description: NOTIFICATION_MESSAGES.comercio.created.description,
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar comercio:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      
      // Mostrar notificación toast
      showError(
        isEditing
          ? NOTIFICATION_MESSAGES.comercio.error.update
          : NOTIFICATION_MESSAGES.comercio.error.create,
        error instanceof Error ? error : undefined
      )
      
      // También mostrar el error en el campo específico si es un error de validación
      if (errorMessage.toLowerCase().includes("documento")) {
        setErrors({ nroDocumento: errorMessage })
      } else if (errorMessage.toLowerCase().includes("correo")) {
        setErrors({ correo: errorMessage })
      } else if (errorMessage.toLowerCase().includes("telefono") || errorMessage.toLowerCase().includes("teléfono")) {
        setErrors({ telefono: errorMessage })
      } else if (errorMessage.toLowerCase().includes("nombre")) {
        setErrors({ nombre: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Nuevo"} Comercio</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center gap-1">
                    Nombre {errors.nombre && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={comercio.nombre || ""}
                    onChange={handleChange}
                    className={errors.nombre ? "border-destructive" : ""}
                  />
                  {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iD_TipoComercio" className="flex items-center gap-1">
                    Tipo de Comercio {errors.iD_TipoComercio && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Select
                    value={comercio.iD_TipoComercio ? comercio.iD_TipoComercio.toString() : ""}
                    onValueChange={(value) => handleSelectChange("iD_TipoComercio", value)}
                  >
                    <SelectTrigger className={errors.iD_TipoComercio ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposComercio.length > 0 ? (
                        tiposComercio.map((tipo) => {
                          if (!tipo) return null
                          return (
                            <SelectItem
                              key={`tipo-${tipo.iD_TipoComercio}`}
                              value={tipo.iD_TipoComercio.toString()}
                              disabled={!tipo.estado}
                            >
                              {tipo.descripcion}
                            </SelectItem>
                          )
                        })
                      ) : (
                        <>
                          <SelectItem key="tipo-1" value="1">Bar</SelectItem>
                          <SelectItem key="tipo-2" value="2">Boliche</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.iD_TipoComercio && <p className="text-sm text-destructive">{errors.iD_TipoComercio}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacidad" className="flex items-center gap-1">
                    Capacidad {errors.capacidad && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="capacidad"
                    name="capacidad"
                    type="number"
                    min="1"
                    value={comercio.capacidad || 0}
                    onChange={handleChange}
                    className={errors.capacidad ? "border-destructive" : ""}
                  />
                  {errors.capacidad && <p className="text-sm text-destructive">{errors.capacidad}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mesas" className="flex items-center gap-1">
                    Mesas {errors.mesas && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="mesas"
                    name="mesas"
                    type="number"
                    min="0"
                    value={comercio.mesas || 0}
                    onChange={handleChange}
                    className={errors.mesas ? "border-destructive" : ""}
                  />
                  {errors.mesas && <p className="text-sm text-destructive">{errors.mesas}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generoMusical">Género Musical</Label>
                <Input
                  id="generoMusical"
                  name="generoMusical"
                  value={comercio.generoMusical || ""}
                  onChange={handleChange}
                  placeholder="Rock, Pop, Electrónica, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                  <Select
                    value={comercio.tipoDocumento || "DNI"}
                    onValueChange={(value) => handleSelectChange("tipoDocumento", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="CUIT">CUIT</SelectItem>
                      <SelectItem value="CUIL">CUIL</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Mostrar el valor actual en modo debug */}
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-muted-foreground">
                      Valor actual: {comercio.tipoDocumento || 'ninguno'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nroDocumento" className="flex items-center gap-1">
                    Número de Documento {errors.nroDocumento && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="nroDocumento"
                    name="nroDocumento"
                    value={comercio.nroDocumento || ""}
                    onChange={handleChange}
                    className={errors.nroDocumento ? "border-destructive" : ""}
                  />
                  {errors.nroDocumento && <p className="text-sm text-destructive">{errors.nroDocumento}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion" className="flex items-center gap-1">
                  Dirección {errors.direccion && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={comercio.direccion || ""}
                  onChange={handleChange}
                  className={errors.direccion ? "border-destructive" : ""}
                />
                {errors.direccion && <p className="text-sm text-destructive">{errors.direccion}</p>}
              </div>

              {/* Campos de Hora de Ingreso y Hora de Cierre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaIngreso" className="flex items-center gap-1">
                    Hora de Ingreso {errors.horaIngreso && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="horaIngreso"
                    name="horaIngreso"
                    type="time"
                    value={comercio.horaIngreso || ""}
                    onChange={handleChange}
                    className={errors.horaIngreso ? "border-destructive" : ""}
                    placeholder="Ej: 20:00"
                  />
                  {errors.horaIngreso && <p className="text-sm text-destructive">{errors.horaIngreso}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaCierre" className="flex items-center gap-1">
                    Hora de Cierre {errors.horaCierre && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="horaCierre"
                    name="horaCierre"
                    type="time"
                    value={comercio.horaCierre || ""}
                    onChange={handleChange}
                    className={errors.horaCierre ? "border-destructive" : ""}
                    placeholder="Ej: 05:00"
                  />
                  {errors.horaCierre && <p className="text-sm text-destructive">{errors.horaCierre}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo" className="flex items-center gap-1">
                    Correo {errors.correo && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    value={comercio.correo || ""}
                    onChange={handleChange}
                    className={errors.correo ? "border-destructive" : ""}
                  />
                  {errors.correo && <p className="text-sm text-destructive">{errors.correo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-1">
                    Teléfono {errors.telefono && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={comercio.telefono || ""}
                    onChange={handleChange}
                    className={errors.telefono ? "border-destructive" : ""}
                  />
                  {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iD_Usuario" className="flex items-center gap-1">
                  Usuario Responsable {errors.iD_Usuario && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {loadingUsuarios && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
                </Label>
                <Select
                  value={comercio.iD_Usuario ? comercio.iD_Usuario.toString() : ""}
                  onValueChange={(value) => handleSelectChange("iD_Usuario", value)}
                  disabled={loadingUsuarios || usuarios.length === 0}
                >
                  <SelectTrigger className={errors.iD_Usuario ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.length > 0 ? (
                      usuarios.map((usuario) => {
                        if (!usuario) return null
                        return (
                          <SelectItem key={`usuario-${usuario.iD_Usuario}`} value={usuario.iD_Usuario.toString()}>
                            {usuario.nombreUsuario} ({usuario.correo})
                          </SelectItem>
                        )
                      })
                    ) : (
                      <SelectItem key="no-usuarios" value="no-disponible" disabled>
                        No hay usuarios disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.iD_Usuario && <p className="text-sm text-destructive">{errors.iD_Usuario}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={comercio.estado}
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