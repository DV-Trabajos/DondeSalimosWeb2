"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle, Info, Check, ChevronRight, ChevronLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  type Reserva,
  type Comercio,
  type Usuario,
  reservaService,
  comercioService,
  usuarioService,
} from "../../services"
import { useToast } from "@/components/ui/use-toast"

interface ReservaFormInteractivoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reservaId?: number
  usuarioId?: number // Opcional: ID de usuario preseleccionado
}

const initialReserva: Omit<Reserva, "iD_Reserva" | "fechaCreacion"> = {
  iD_Usuario: 0,
  iD_Comercio: 0,
  fechaReserva: "",
  tiempoTolerancia: "15 minutos",
  comenzales: 1,
  estado: true,
}

export function ReservaFormInteractivo({
  isOpen,
  onClose,
  onSuccess,
  reservaId,
  usuarioId,
}: ReservaFormInteractivoProps) {
  // Estados principales
  const [reserva, setReserva] = useState<any>(initialReserva)
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [comercioSeleccionado, setComercioSeleccionado] = useState<Comercio | null>(null)
  const [mesasDisponibles, setMesasDisponibles] = useState<number[]>([])
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<number[]>([])

  // Estados de UI
  const [paso, setPaso] = useState(1)
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

          // Cargar el comercio seleccionado
          if (data.iD_Comercio) {
            comercioService.getById(data.iD_Comercio).then((comercio) => {
              setComercioSeleccionado(comercio)
              generarMesasDisponibles(comercio.mesas)
              // Simular mesas seleccionadas basadas en comenzales
              const mesasNecesarias = Math.ceil(data.comenzales / 4) // Asumimos 4 personas por mesa
              setMesasSeleccionadas(Array.from({ length: mesasNecesarias }, (_, i) => i + 1))
            })
          }

          setLoadingData(false)
          // Si estamos editando, empezamos en el paso 2
          setPaso(2)
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

      // Si se proporciona un ID de usuario, usarlo
      const initialData = {
        ...initialReserva,
        fechaReserva: formattedNow,
        iD_Usuario: usuarioId || 0,
      }

      setReserva(initialData)
      setErrors({})
      setPaso(1)
      setMesasSeleccionadas([])
      setComercioSeleccionado(null)
    }
  }, [isOpen, reservaId, isEditing, onClose, toast, usuarioId])

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

  // Generar mesas disponibles basado en el número total de mesas del comercio
  const generarMesasDisponibles = (totalMesas: number) => {
    setMesasDisponibles(Array.from({ length: totalMesas }, (_, i) => i + 1))
  }

  // Manejar selección de comercio
  const handleComercioSelect = (comercioId: string) => {
    const id = Number.parseInt(comercioId, 10)
    if (isNaN(id)) return

    setReserva({ ...reserva, iD_Comercio: id })
    setErrors({ ...errors, iD_Comercio: "" })

    // Buscar el comercio seleccionado para obtener sus detalles
    const comercio = comercios.find((c) => c.iD_Comercio === id)
    if (comercio) {
      setComercioSeleccionado(comercio)
      generarMesasDisponibles(comercio.mesas)
      setMesasSeleccionadas([]) // Resetear mesas seleccionadas

      // Actualizar comenzales a 1 por defecto
      setReserva((prev) => ({ ...prev, comenzales: 1 }))
    }
  }

  // Manejar selección/deselección de mesa
  const toggleMesa = (mesaId: number) => {
    if (mesasSeleccionadas.includes(mesaId)) {
      setMesasSeleccionadas(mesasSeleccionadas.filter((id) => id !== mesaId))
    } else {
      setMesasSeleccionadas([...mesasSeleccionadas, mesaId])
    }

    // Actualizar el número de comenzales basado en las mesas seleccionadas
    // Asumimos 4 personas por mesa como máximo
    const nuevosComenzales =
      (mesasSeleccionadas.includes(mesaId) ? mesasSeleccionadas.length - 1 : mesasSeleccionadas.length + 1) * 4

    setReserva((prev) => ({
      ...prev,
      comenzales: Math.min(nuevosComenzales, comercioSeleccionado?.capacidad || 0),
    }))
  }

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    // Limpiar error al cambiar el valor
    setErrors((prev) => ({ ...prev, [name]: "" }))

    // Convertir valores numéricos
    if (type === "number") {
      const numValue = Number.parseInt(value, 10) || 0

      if (name === "comenzales" && comercioSeleccionado) {
        // No permitir más comenzales que la capacidad del comercio
        const valorFinal = Math.min(numValue, comercioSeleccionado.capacidad)
        setReserva({ ...reserva, [name]: valorFinal })

        // Actualizar mesas seleccionadas basado en comenzales
        const mesasNecesarias = Math.ceil(valorFinal / 4) // Asumimos 4 personas por mesa
        const mesasDisponiblesTotal = comercioSeleccionado.mesas

        if (mesasNecesarias <= mesasDisponiblesTotal) {
          setMesasSeleccionadas(Array.from({ length: mesasNecesarias }, (_, i) => i + 1))
        }
      } else {
        setReserva({ ...reserva, [name]: numValue })
      }
    } else {
      setReserva({ ...reserva, [name]: value })
    }
  }

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setErrors({ ...errors, [name]: "" })

    // Convertir el valor a número entero
    const numValue = Number.parseInt(value, 10)

    // Verificar que sea un número válido
    if (!isNaN(numValue)) {
      setReserva((prevState) => ({
        ...prevState,
        [name]: numValue,
      }))

      // Si se selecciona un comercio, cargar sus detalles
      if (name === "iD_Comercio") {
        handleComercioSelect(value)
      }
    }
  }

  // Manejar cambio de switch
  const handleSwitchChange = (name: string, checked: boolean) => {
    setReserva({ ...reserva, [name]: checked })
  }

  // Validar formulario según el paso actual
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (paso === 1) {
      if (!reserva.iD_Comercio) {
        newErrors.iD_Comercio = "Debes seleccionar un comercio"
      }

      if (!comercioSeleccionado) {
        newErrors.iD_Comercio = "Debes seleccionar un comercio válido"
      }
    } else if (paso === 2) {
      if (!reserva.fechaReserva) {
        newErrors.fechaReserva = "La fecha de reserva es obligatoria"
      }

      if (!reserva.tiempoTolerancia?.trim()) {
        newErrors.tiempoTolerancia = "El tiempo de tolerancia es obligatorio"
      }

      if (!reserva.iD_Usuario) {
        newErrors.iD_Usuario = "Debes seleccionar un usuario"
      }

      if (reserva.comenzales <= 0) {
        newErrors.comenzales = "El número de comensales debe ser mayor a 0"
      }

      if (mesasSeleccionadas.length === 0) {
        newErrors.mesas = "Debes seleccionar al menos una mesa"
      }

      // Validar que no exceda la capacidad
      if (comercioSeleccionado && reserva.comenzales > comercioSeleccionado.capacidad) {
        newErrors.comenzales = `No puede exceder la capacidad máxima (${comercioSeleccionado.capacidad})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Avanzar al siguiente paso
  const handleNextStep = () => {
    if (validateForm()) {
      setPaso(paso + 1)
    }
  }

  // Retroceder al paso anterior
  const handlePrevStep = () => {
    setPaso(paso - 1)
  }

  // Enviar formulario
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
        // Formatear tiempoTolerancia como TimeSpan (HH:MM:SS)
        tiempoTolerancia: formatearTiempoTolerancia(reserva.tiempoTolerancia.trim()),
        comenzales: Number(reserva.comenzales),
        estado: Boolean(reserva.estado),
        // Agregar el campo reserva requerido por el backend
        reserva: `Reserva para ${reserva.comenzales} personas - Mesas: ${mesasSeleccionadas.join(", ")}`,
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

  const formatearTiempoTolerancia = (tiempo: string): string => {
    // Si ya tiene formato de TimeSpan (00:00:00), devolverlo tal cual
    if (/^\d{2}:\d{2}:\d{2}$/.test(tiempo)) {
      return tiempo
    }

    // Extraer números del string
    const numeros = tiempo.match(/\d+/)
    if (!numeros || numeros.length === 0) {
      return "00:15:00" // Valor por defecto: 15 minutos
    }

    const minutos = Number.parseInt(numeros[0], 10)
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    // Formatear como HH:MM:00
    return `${horas.toString().padStart(2, "0")}:${minutosRestantes.toString().padStart(2, "0")}:00`
  }

  // Renderizar mesa
  const renderMesa = (mesaId: number) => {
    const isSelected = mesasSeleccionadas.includes(mesaId)
    return (
      <div
        key={`mesa-${mesaId}`}
        className={`
          w-20 h-20 rounded-md flex items-center justify-center cursor-pointer transition-all
          ${
            isSelected
              ? "bg-brand-pink text-white shadow-md scale-105"
              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          }
        `}
        onClick={() => toggleMesa(mesaId)}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", mesaId.toString())
        }}
      >
        <div className="text-center">
          <div className="font-bold text-lg">#{mesaId}</div>
          <div className="text-xs">{isSelected ? "Seleccionada" : "Disponible"}</div>
        </div>
      </div>
    )
  }

  // Área de selección de mesas
  const renderMesasArea = () => {
    return (
      <div
        className="mt-4 p-4 border-2 border-dashed rounded-lg min-h-[200px] bg-gray-50 dark:bg-gray-900"
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add("bg-gray-100", "dark:bg-gray-800")
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("bg-gray-100", "dark:bg-gray-800")
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove("bg-gray-100", "dark:bg-gray-800")
          const mesaId = Number.parseInt(e.dataTransfer.getData("text/plain"), 10)
          if (!isNaN(mesaId)) {
            toggleMesa(mesaId)
          }
        }}
      >
        <h3 className="text-center mb-4 font-medium">Mesas seleccionadas: {mesasSeleccionadas.length}</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {mesasSeleccionadas.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              Arrastra mesas aquí o haz clic en ellas para seleccionarlas
            </div>
          ) : (
            mesasSeleccionadas.map((mesaId) => renderMesa(mesaId))
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Nueva"} Reserva</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div>
            {/* Indicador de pasos */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${paso >= 1 ? "text-brand-pink" : "text-gray-400"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      paso >= 1 ? "bg-brand-pink text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {paso > 1 ? <Check className="h-5 w-5" /> : "1"}
                  </div>
                  <span>Seleccionar Comercio</span>
                </div>
                <div className={`h-0.5 flex-1 mx-4 ${paso >= 2 ? "bg-brand-pink" : "bg-gray-200"}`}></div>
                <div className={`flex items-center ${paso >= 2 ? "text-brand-pink" : "text-gray-400"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      paso >= 2 ? "bg-brand-pink text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {paso > 2 ? <Check className="h-5 w-5" /> : "2"}
                  </div>
                  <span>Detalles de Reserva</span>
                </div>
              </div>
            </div>

            {/* Contenido según el paso */}
            {paso === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="iD_Comercio" className="flex items-center gap-1">
                    Selecciona un Comercio {errors.iD_Comercio && <AlertCircle className="h-4 w-4 text-destructive" />}
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

                {comercioSeleccionado && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{comercioSeleccionado.nombre}</h3>
                          <Badge variant={comercioSeleccionado.estado ? "success" : "destructive"}>
                            {comercioSeleccionado.estado ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Capacidad</p>
                            <p className="font-medium">{comercioSeleccionado.capacidad} personas</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Mesas</p>
                            <p className="font-medium">{comercioSeleccionado.mesas} mesas</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Género Musical</p>
                            <p className="font-medium">{comercioSeleccionado.generoMusical || "No especificado"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="font-medium">{comercioSeleccionado.direccion}</p>
                          </div>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Este comercio tiene capacidad para {comercioSeleccionado.capacidad} personas y{" "}
                            {comercioSeleccionado.mesas} mesas disponibles.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {paso === 2 && (
              <div className="space-y-6">
                <Tabs defaultValue="detalles" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="detalles">Detalles</TabsTrigger>
                    <TabsTrigger value="mesas">Selección de Mesas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="detalles" className="space-y-4 pt-4">
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
                      <Label htmlFor="fechaReserva" className="flex items-center gap-1">
                        Fecha y Hora de Reserva{" "}
                        {errors.fechaReserva && <AlertCircle className="h-4 w-4 text-destructive" />}
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
                        {errors.tiempoTolerancia && (
                          <p className="text-sm text-destructive">{errors.tiempoTolerancia}</p>
                        )}
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
                          max={comercioSeleccionado?.capacidad || 999}
                          value={reserva.comenzales || 1}
                          onChange={handleChange}
                          className={errors.comenzales ? "border-destructive" : ""}
                        />
                        {errors.comenzales && <p className="text-sm text-destructive">{errors.comenzales}</p>}
                        {comercioSeleccionado && (
                          <p className="text-xs text-muted-foreground">
                            Capacidad máxima: {comercioSeleccionado.capacidad} personas
                          </p>
                        )}
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
                  </TabsContent>

                  <TabsContent value="mesas" className="pt-4">
                    {comercioSeleccionado ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Mesas Disponibles</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Selecciona las mesas que deseas reservar. Puedes arrastrarlas al área de selección.
                          </p>

                          {errors.mesas && <p className="text-sm text-destructive mb-2">{errors.mesas}</p>}

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {mesasDisponibles.map((mesaId) => renderMesa(mesaId))}
                          </div>
                        </div>

                        {renderMesasArea()}

                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Resumen de Reserva</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Comercio:</div>
                            <div className="font-medium">{comercioSeleccionado.nombre}</div>

                            <div>Mesas seleccionadas:</div>
                            <div className="font-medium">
                              {mesasSeleccionadas.length} de {comercioSeleccionado.mesas}
                            </div>

                            <div>Comensales:</div>
                            <div className="font-medium">{reserva.comenzales} personas</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No se ha seleccionado ningún comercio
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Botones de navegación */}
            <DialogFooter className="mt-6 flex justify-between">
              {paso > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              ) : (
                <div></div> // Espacio vacío para mantener la alineación
              )}

              {paso < 2 ? (
                <Button type="button" onClick={handleNextStep}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Actualizar" : "Crear"} Reserva
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
