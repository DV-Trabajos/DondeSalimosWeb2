"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PublicidadForm } from "@/components/publicidades/PublicidadForm"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/components/ui/use-toast"
import { type Publicidad, publicidadService } from "../../services"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PublicidadesPage() {
  const [publicidades, setPublicidades] = useState<Publicidad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPublicidadId, setSelectedPublicidadId] = useState<number | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const { checkUserPermission } = useAuth()

  // Verificar permisos
  const hasPermission = checkUserPermission("users.manage")

  // Cargar publicidades
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await publicidadService.getAll()
      setPublicidades(data)
    } catch (error) {
      console.error("Error al cargar publicidades:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las publicidades",
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

  // Filtrar publicidades por término de búsqueda
  const filteredPublicidades = publicidades.filter(
    (publicidad) =>
      publicidad.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publicidad.comercioNombre?.toLowerCase().includes(searchTerm.toLowerCase() || ""),
  )

  // Abrir formulario para crear nueva publicidad
  const handleCreate = () => {
    setSelectedPublicidadId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar publicidad
  const handleEdit = (id: number) => {
    setSelectedPublicidadId(id)
    setIsFormOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setSelectedPublicidadId(id)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar publicidad
  const handleDelete = async () => {
    if (!selectedPublicidadId) return

    setDeleteLoading(true)
    try {
      await publicidadService.delete(selectedPublicidadId)
      toast({
        title: "Éxito",
        description: "Publicidad eliminada correctamente",
      })
      loadData()
    } catch (error) {
      console.error("Error al eliminar publicidad:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicidad",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        {!hasPermission ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso denegado</AlertTitle>
            <AlertDescription>No tienes permisos para gestionar publicidades.</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Publicidades</CardTitle>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Publicidad
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar publicidades..."
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
                        <TableHead>Descripción</TableHead>
                        <TableHead>Comercio</TableHead>
                        <TableHead>Visualizaciones</TableHead>
                        <TableHead>Tiempo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPublicidades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No se encontraron publicidades
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPublicidades.map((publicidad) => (
                          <TableRow key={`publicidad-${publicidad.iD_Publicidad}`}>
                            <TableCell>{publicidad.iD_Publicidad}</TableCell>
                            <TableCell className="max-w-xs truncate">{publicidad.descripcion}</TableCell>
                            <TableCell>{publicidad.comercioNombre || "Desconocido"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                {publicidad.visualizaciones}
                              </div>
                            </TableCell>
                            <TableCell>{publicidad.tiempo}</TableCell>
                            <TableCell>
                              <Badge variant={publicidad.estado ? "success" : "destructive"}>
                                {publicidad.estado ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(publicidad.fechaCreacion)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(publicidad.iD_Publicidad)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(publicidad.iD_Publicidad)}
                              >
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

        {/* Formulario de publicidad */}
        <PublicidadForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
          publicidadId={selectedPublicidadId}
        />

        {/* Diálogo de confirmación para eliminar */}
        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Publicidad"
          description="¿Estás seguro de que deseas eliminar esta publicidad? Esta acción no se puede deshacer."
          loading={deleteLoading}
        />
      </div>
    </ProtectedRoute>
  )
}
