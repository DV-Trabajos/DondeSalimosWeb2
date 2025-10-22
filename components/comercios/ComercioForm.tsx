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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Comercio, type TipoComercio, type Usuario, comercioService, usuarioService } from "../../services"
import { useToast } from "@/components/ui/use-toast"

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
  tipoDocumento: "DNI",
  nroDocumento: "",
  direccion: "",
  correo: "",
  telefono: "",
  estado: true,
  iD_TipoComercio: 0, // Cambiado a 0 para forzar selección
  iD_Usuario: 0, // Cambiado a 0 para forzar selección
}

export function ComercioForm({ isOpen, onClose, onSuccess, comercioId, tiposComercio = [] }: ComercioFormProps) {
  const [comercio, setComercio] = useState<any>(initialComercio)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const isEditing = !!comercioId

  // Cargar datos del comercio si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && comercioId) {
      setLoadingData(true)
      setErrors({})
      comercioService
        .getById(comercioId)
        .then((data) => {
          // Asegurarse de que todos los campos estén correctamente asignados
          setComercio({
            ...data,
            tipoDocumento: data.tipoDocumento || "DNI", // Asegurarse de que tipoDocumento tenga un valor
          })
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar comercio:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información del comercio",
            variant: "destructive",
          })
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      setComercio({ ...initialComercio })
      setErrors({})
    }
  }, [isOpen, comercioId, isEditing, onClose, toast])

  // Cargar usuarios para el selector - separado del efecto anterior para mejor manejo
  useEffect(() => {
    if (isOpen) {
      setLoadingUsuarios(true)

      usuarioService
        .getAll()
        .then((data) => {
          if (Array.isArray(data)) {
            // Filtrar solo usuarios activos
            const usuariosActivos = data.filter((usuario) => usuario.estado)
            setUsuarios(usuariosActivos)
          } else {
            console.error("La respuesta de usuarios no es un array:", data)
            setUsuarios([])
          }
        })
        .catch((error) => {
          console.error("Error al cargar usuarios:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los usuarios",
            variant: "destructive",
          })
          setUsuarios([])
        })
        .finally(() => {
          setLoadingUsuarios(false)
        })
    }
  }, [isOpen, toast])

  // Depuración para verificar los tipos de comercio disponibles
  useEffect(() => {
    if (tiposComercio.length > 0) {
      console.log("Tipos de comercio disponibles:", tiposComercio)
    }
  }, [tiposComercio])

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

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "iD_TipoComercio" || name === "iD_Usuario") {
      // Convertir el valor a número entero
      const numValue = Number.parseInt(value, 10)

      // Verificar que sea un número válido
      if (!isNaN(numValue)) {
        setComercio((prevState) => ({
          ...prevState,
          [name]: numValue,
        }))
      } else {
        console.error(`Error al convertir valor para ${name}: ${value}`)
      }
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

    // Validar formulario
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Crear objeto con los campos necesarios
      const comercioData = {
        nombre: comercio.nombre.trim(),
        capacidad: Number(comercio.capacidad),
        mesas: Number(comercio.mesas),
        generoMusical: comercio.generoMusical?.trim() || "",
        tipoDocumento: comercio.tipoDocumento,
        nroDocumento: comercio.nroDocumento.trim(),
        direccion: comercio.direccion.trim(),
        horaIngreso : comercio.horaIngreso,
        horaCierre : comercio.horaCierre,
        correo: comercio.correo.trim(),
        telefono: comercio.telefono.trim(),
        estado: Boolean(comercio.estado),
        iD_TipoComercio: Number(comercio.iD_TipoComercio),
        iD_Usuario: Number(comercio.iD_Usuario),
      }

      // Si estamos editando, incluir el ID del comercio
      if (isEditing && comercioId) {
        comercioData.iD_Comercio = comercioId
      }

      if (isEditing && comercioId) {
        await comercioService.update(comercioId, comercioData)
        toast({
          title: "Éxito",
          description: "Comercio actualizado correctamente",
        })
      } else {
        await comercioService.create(comercioData)
        toast({
          title: "Éxito",
          description: "Comercio creado correctamente",
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar comercio:", error)
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} el comercio. ${
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
                          <SelectItem key="tipo-1" value="1">
                            Bar
                          </SelectItem>
                          <SelectItem key="tipo-2" value="2">
                            Boliche
                          </SelectItem>
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
                {usuarios.length === 0 && !loadingUsuarios && (
                  <Alert variant="warning" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron usuarios activos. Por favor, crea usuarios primero.
                    </AlertDescription>
                  </Alert>
                )}
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
