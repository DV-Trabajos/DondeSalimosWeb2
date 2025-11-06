"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ReseniaForm } from "@/components/resenias/ReseniaForm"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/components/ui/use-toast"
import { type Resenia, reseniaService } from "../../../services"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ReseniasPage() {
  const [resenias, setResenias] = useState<Resenia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedReseniaId, setSelectedReseniaId] = useState<number | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const { checkUserPermission } = useAuth()
  const { user } = useAuth()

  const hasPermission = user !== null // Todos los usuarios autenticados
  const isAdmin = user?.iD_RolUsuario === 2 // Solo admins pueden ver todo

  // Cargar reseñas
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await reseniaService.getAll()
      setResenias(data)
    } catch (error) {
      console.error("Error al cargar reseñas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las reseñas",
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

  // Filtrar reseñas por término de búsqueda
  const filteredResenias = resenias.filter(
    (resenia) =>
      resenia.comentario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resenia.comercioNombre?.toLowerCase().includes(searchTerm.toLowerCase() || "") ||
      resenia.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase() || ""),
  )

  // Abrir formulario para crear nueva reseña
  const handleCreate = () => {
    setSelectedReseniaId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar reseña
  const handleEdit = (id: number) => {
    setSelectedReseniaId(id)
    setIsFormOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setSelectedReseniaId(id)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar reseña
  const handleDelete = async () => {
    if (!selectedReseniaId) return

    setDeleteLoading(true)
    try {
      await reseniaService.delete(selectedReseniaId)
      toast({
        title: "Éxito",
        description: "Reseña eliminada correctamente",
      })
      loadData()
    } catch (error) {
      console.error("Error al eliminar reseña:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reseñas</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reseña
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar reseñas..."
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
                    <TableHead>Comentario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResenias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron reseñas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResenias.map((resenia) => (
                      <TableRow key={`resenia-${resenia.iD_Resenia}`}>
                        <TableCell>{resenia.iD_Resenia}</TableCell>
                        <TableCell>{resenia.usuarioNombre || "Desconocido"}</TableCell>
                        <TableCell>{resenia.comercioNombre || "Desconocido"}</TableCell>
                        <TableCell className="max-w-xs truncate">{resenia.comentario}</TableCell>
                        <TableCell>
                          <Badge variant={resenia.estado ? "success" : "destructive"}>
                            {resenia.estado ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(resenia.fechaCreacion).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(resenia.iD_Resenia)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(resenia.iD_Resenia)}>
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
        {/* Formulario de reseña */}
        <ReseniaForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
          reseniaId={selectedReseniaId}
        />

        {/* Diálogo de confirmación para eliminar */}
        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Reseña"
          description="¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer."
          loading={deleteLoading}
        />
      </div>
    </ProtectedRoute>
  )
}
