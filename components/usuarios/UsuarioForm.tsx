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
import { type Usuario, type RolUsuario, usuarioService } from "../../services"
import { useToast } from "@/components/ui/use-toast"

interface UsuarioFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuarioId?: number
  roles?: RolUsuario[]
}

const initialUsuario: Omit<Usuario, "iD_Usuario" | "fechaCreacion"> = {
  nombreUsuario: "",
  correo: "",
  telefono: "",
  iD_RolUsuario: 0, // Cambiado a 0 para forzar selección
  uid: "",
  estado: true,
}

export function UsuarioForm({ isOpen, onClose, onSuccess, usuarioId, roles = [] }: UsuarioFormProps) {
  const [usuario, setUsuario] = useState<any>(initialUsuario)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const isEditing = !!usuarioId

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (isOpen && isEditing && usuarioId) {
      setLoadingData(true)
      setErrors({})
      usuarioService
        .getById(usuarioId)
        .then((data) => {
          setUsuario(data)
          setLoadingData(false)
        })
        .catch((error) => {
          console.error("Error al cargar usuario:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información del usuario",
            variant: "destructive",
          })
          onClose()
          setLoadingData(false)
        })
    } else if (isOpen && !isEditing) {
      // Asegurarse de que se reinicie el formulario con valores iniciales
      setUsuario({ ...initialUsuario })
      setErrors({})
    }
  }, [isOpen, usuarioId, isEditing, onClose, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUsuario({ ...usuario, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const handleSelectChange = (name: string, value: string) => {
    setErrors({ ...errors, [name]: "" })

    if (name === "iD_RolUsuario") {
      // Convertir el valor a número entero
      const rolId = Number.parseInt(value, 10)

      // Verificar que sea un número válido
      if (!isNaN(rolId)) {
        setUsuario((prevState) => ({
          ...prevState,
          iD_RolUsuario: rolId,
        }))
      } else {
        console.error(`Error al convertir valor: ${value}`)
      }
    } else {
      setUsuario((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setUsuario({ ...usuario, [name]: checked })
  }

  // Función para parsear errores del backend
  const parseBackendError = (errorMessage: string) => {
    const newErrors: Record<string, string> = {}

    // Mapear errores específicos del backend a campos del formulario
    const errorMappings = [
      {
        keywords: ["firebase", "uid", "no se encuentra", "no existe en firebase"],
        field: "uid",
        message: "Este usuario no se encuentra en Firebase. Contacte al administrador.",
      },
      {
        keywords: ["correo", "email", "ya está en uso", "duplicado"],
        field: "correo",
        message: "Este correo electrónico ya está en uso",
      },
      {
        keywords: ["nombre", "usuario", "ya existe"],
        field: "nombreUsuario",
        message: "Este nombre de usuario ya está en uso",
      },
      {
        keywords: ["teléfono", "telefono", "ya registrado"],
        field: "telefono",
        message: "Este teléfono ya está registrado",
      },
      {
        keywords: ["rol", "no válido", "no existe"],
        field: "iD_RolUsuario",
        message: "El rol seleccionado no es válido",
      },
    ]

    // Buscar qué tipo de error es basado en el mensaje
    const errorLower = errorMessage.toLowerCase()

    for (const mapping of errorMappings) {
      if (mapping.keywords.some((keyword) => errorLower.includes(keyword))) {
        newErrors[mapping.field] = mapping.message
        return newErrors
      }
    }

    // Si no se puede mapear a un campo específico, mostrar error general
    newErrors.general = errorMessage
    return newErrors
  }

  // Modificar la función validateForm para incluir validación de duplicados
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!usuario.nombreUsuario?.trim()) {
      newErrors.nombreUsuario = "El nombre de usuario es obligatorio"
    }

    if (!usuario.correo?.trim()) {
      newErrors.correo = "El correo es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(usuario.correo)) {
      newErrors.correo = "El correo no es válido"
    }

    if (!usuario.telefono?.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    }

    if (!usuario.iD_RolUsuario) {
      newErrors.iD_RolUsuario = "Debes seleccionar un rol"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Reemplazar la función handleSubmit para incluir validación de duplicados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    // Limpiar errores previos
    setErrors({})

    try {
      // Verificar si ya existe un usuario con el mismo nombre o correo
      const usuarios = await usuarioService.getAll()

      // Filtrar excluyendo el usuario actual en caso de edición
      const usuariosExistentes = usuarios.filter((u) => (isEditing ? u.iD_Usuario !== usuarioId : true))

      // Verificar nombre de usuario duplicado
      const nombreDuplicado = usuariosExistentes.some(
        (u) => u.nombreUsuario.toLowerCase() === usuario.nombreUsuario.trim().toLowerCase(),
      )

      if (nombreDuplicado) {
        setErrors((prev) => ({ ...prev, nombreUsuario: "Este nombre de usuario ya está en uso" }))
        setLoading(false)
        return
      }

      // Verificar correo duplicado
      const correoDuplicado = usuariosExistentes.some(
        (u) => u.correo.toLowerCase() === usuario.correo.trim().toLowerCase(),
      )

      if (correoDuplicado) {
        setErrors((prev) => ({ ...prev, correo: "Este correo electrónico ya está en uso" }))
        setLoading(false)
        return
      }

      // Crear objeto con los campos necesarios
      const usuarioData = {
        nombreUsuario: usuario.nombreUsuario.trim(),
        correo: usuario.correo.trim(),
        telefono: usuario.telefono.trim(),
        iD_RolUsuario: Number(usuario.iD_RolUsuario),
        uid: usuario.uid?.trim() || "",
        estado: Boolean(usuario.estado),
      }

      // Si estamos editando, incluir el ID del usuario
      if (isEditing && usuarioId) {
        usuarioData.iD_Usuario = usuarioId
      }

      if (isEditing && usuarioId) {
        await usuarioService.update(usuarioId, usuarioData)
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente",
        })
      } else {
        await usuarioService.create(usuarioData)
        toast({
          title: "Éxito",
          description: "Usuario creado correctamente",
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar usuario:", error)

      // Parsear el error del backend y mostrarlo en el campo correspondiente
      if (error instanceof Error) {
        const backendErrors = parseBackendError(error.message)
        setErrors(backendErrors)

        // Si hay un error general, también mostrarlo en el toast
        if (backendErrors.general) {
          toast({
            title: "Error",
            description: backendErrors.general,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: `No se pudo ${isEditing ? "actualizar" : "crear"} el usuario`,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Nuevo"} Usuario</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombreUsuario" className="flex items-center gap-1">
                  Nombre de Usuario {errors.nombreUsuario && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  value={usuario.nombreUsuario || ""}
                  onChange={handleChange}
                  className={errors.nombreUsuario ? "border-destructive" : ""}
                />
                {errors.nombreUsuario && <p className="text-sm text-destructive">{errors.nombreUsuario}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="flex items-center gap-1">
                  Correo Electrónico {errors.correo && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={usuario.correo || ""}
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
                  value={usuario.telefono || ""}
                  onChange={handleChange}
                  className={errors.telefono ? "border-destructive" : ""}
                />
                {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iD_RolUsuario" className="flex items-center gap-1">
                  Rol {errors.iD_RolUsuario && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Select
                  value={usuario.iD_RolUsuario ? usuario.iD_RolUsuario.toString() : ""}
                  onValueChange={(value) => handleSelectChange("iD_RolUsuario", value)}
                >
                  <SelectTrigger className={errors.iD_RolUsuario ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length > 0 ? (
                      roles.map((rol) => {
                        if (!rol) return null
                        return (
                          <SelectItem
                            key={`rol-${rol.iD_RolUsuario}`}
                            value={rol.iD_RolUsuario.toString()}
                            disabled={!rol.estado}
                          >
                            {rol.descripcion}
                          </SelectItem>
                        )
                      })
                    ) : (
                      <>
                        <SelectItem key="rol-1" value="1">
                          Usuario
                        </SelectItem>
                        <SelectItem key="rol-2" value="2">
                          Administrador
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.iD_RolUsuario && <p className="text-sm text-destructive">{errors.iD_RolUsuario}</p>}
              </div>

              {/* Modificar el campo UID para que esté deshabilitado en modo edición */}
              <div className="space-y-2">
                <Label htmlFor="uid">UID</Label>
                <Input
                  id="uid"
                  name="uid"
                  value={usuario.uid || ""}
                  onChange={handleChange}
                  disabled={isEditing}
                  className={isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
                />
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "El UID no se puede modificar una vez creado el usuario"
                    : "Identificador único opcional"}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={usuario.estado}
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
