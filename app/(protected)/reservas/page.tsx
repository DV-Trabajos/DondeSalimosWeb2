"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ReservaFormInteractivo } from "@/components/reservas/ReservaFormInteractivo"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/components/ui/use-toast"
import { type Reserva, reservaService } from "../../../services"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedReservaId, setSelectedReservaId] = useState<number | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const { checkUserPermission, user } = useAuth()

  // Verificar permisos
  const hasPermission = checkUserPermission("reservas.view")

  // Cargar reservas
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await reservaService.getAll()
      setReservas(data)
    } catch (error) {
      console.error("Error al cargar reservas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission) {
      loadData()
    }
  }, [hasPermission])

  // Filtrar reservas por término de búsqueda
  const filteredReservas = reservas.filter(
    (reserva) =>
      reserva.comercioNombre?.toLowerCase().includes(searchTerm.toLowerCase() || "") ||
      reserva.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase() || ""),
  )

  // Abrir formulario para crear nueva reserva
  const handleCreate = () => {
    setSelectedReservaId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar reserva
  const handleEdit = (id: number) => {
    setSelectedReservaId(id)
    setIsFormOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setSelectedReservaId(id)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar reserva
  const handleDelete = async () => {
    if (!selectedReservaId) return

    setDeleteLoading(true)
    try {
      await reservaService.delete(selectedReservaId)
      toast({
        title: "Éxito",
        description: "Reserva eliminada correctamente",
      })
      loadData()
    } catch (error) {
      console.error("Error al eliminar reserva:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        {!hasPermission ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso denegado</AlertTitle>
            <AlertDescription>No tienes permisos para gestionar reservas.</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reservas</CardTitle>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Reserva
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar reservas..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Comercio</TableHead>
                        <TableHead>Fecha Reserva</TableHead>
                        <TableHead>Tiempo Tolerancia</TableHead>
                        <TableHead>Comensales</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No se encontraron reservas
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReservas.map((reserva) => (
                          <TableRow key={`reserva-${reserva.iD_Reserva}`}>
                            <TableCell>{reserva.iD_Reserva}</TableCell>
                            <TableCell>{reserva.usuarioNombre || "Desconocido"}</TableCell>
                            <TableCell>{reserva.comercioNombre || "Desconocido"}</TableCell>
                            <TableCell>{formatDateTime(reserva.fechaReserva)}</TableCell>
                            <TableCell>{reserva.tiempoTolerancia}</TableCell>
                            <TableCell>{reserva.comenzales}</TableCell>
                            <TableCell>
                              <Badge variant={reserva.estado ? "success" : "destructive"}>
                                {reserva.estado ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(reserva.fechaCreacion).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(reserva.iD_Reserva)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(reserva.iD_Reserva)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Formulario interactivo de reserva */}
        <ReservaFormInteractivo
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
          reservaId={selectedReservaId}
          usuarioId={user?.uid ? undefined : undefined} // Aquí podrías pasar el ID del usuario actual si lo necesitas
        />

        {/* Diálogo de confirmación para eliminar */}
        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Reserva"
          description="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
          loading={deleteLoading}
        />
      </div>
    </ProtectedRoute>
  )
}
