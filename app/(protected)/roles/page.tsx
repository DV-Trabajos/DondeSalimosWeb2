"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RolForm } from "@/components/roles/RolForm"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/hooks/use-toast"
import { type RolUsuario, rolUsuarioService } from "../../../services"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function RolesPage() {
  const [roles, setRoles] = useState<RolUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRolId, setSelectedRolId] = useState<number | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const { checkUserPermission } = useAuth()

  // Verificar permisos
  const hasPermission = checkUserPermission("roles.manage")

  // Cargar roles
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await rolUsuarioService.getAll()
      setRoles(data)
    } catch (error) {
      let errorMessage = "No se pudieron cargar los roles"
      let errorTitle = "Error al cargar roles"

      if (error instanceof Error) {
        errorMessage = error.message

        // Personalizar mensajes según el tipo de error
        const status = (error as any).status
        if (status === 400) {
          errorTitle = "No se puede cargar"
          // El mensaje ya viene de la API
        } else if (status === 404) {
          errorTitle = "Roles no encontrados"
          errorMessage = "No se encontraron roles disponibles"
        } else if (status === 401 || status === 403) {
          errorTitle = "Sin permisos"
          errorMessage = "No tienes permisos para cargar los roles"
        } else if (status === 500) {
          errorTitle = "Error del servidor"
          errorMessage = "Ocurrió un error en el servidor. Por favor, intenta nuevamente"
        }
      }
      toast({
        title: errorTitle,
        description: errorMessage,
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

  // Filtrar roles por término de búsqueda
  const filteredRoles = roles.filter((rol) => rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

  // Abrir formulario para crear nuevo rol
  const handleCreate = () => {
    setSelectedRolId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar rol
  const handleEdit = (id: number) => {
    setSelectedRolId(id)
    setIsFormOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setSelectedRolId(id)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar rol
  const handleDelete = async () => {
    if (!selectedRolId) return

    setDeleteLoading(true)
    try {
      await rolUsuarioService.delete(selectedRolId)
      toast({
        title: "Éxito",
        description: "Rol eliminado correctamente",
      })
      loadData()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      let errorMessage = "No se pudo eliminar el rol"
      let errorTitle = "Error al eliminar"

      if (error instanceof Error) {
        errorMessage = error.message

        // Personalizar mensajes según el tipo de error
        const status = (error as any).status
        if (status === 400) {
          errorTitle = "No se puede eliminar"
          // El mensaje ya viene de la API, lo usamos directamente
        } else if (status === 404) {
          errorTitle = "Rol no encontrado"
          errorMessage = "El rol que intentas eliminar no existe"
        } else if (status === 401 || status === 403) {
          errorTitle = "Sin permisos"
          errorMessage = "No tienes permisos para eliminar este rol"
        } else if (status === 500) {
          errorTitle = "Error del servidor"
          errorMessage = "Ocurrió un error en el servidor. Por favor, intenta nuevamente"
        }
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        {!hasPermission ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso denegado</AlertTitle>
            <AlertDescription>No tienes permisos para gestionar roles.</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Roles de Usuario</CardTitle>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Rol
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar roles..."
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No se encontraron roles
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoles.map((rol) => (
                          <TableRow key={`rol-${rol.iD_RolUsuario}`}>
                            <TableCell>{rol.iD_RolUsuario}</TableCell>
                            <TableCell className="font-medium">{rol.descripcion}</TableCell>
                            <TableCell>
                              <Badge variant={rol.estado ? "success" : "destructive"}>
                                {rol.estado ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(rol.fechaCreacion).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(rol.iD_RolUsuario)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(rol.iD_RolUsuario)}>
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

        {/* Formulario de rol */}
        <RolForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={loadData} rolId={selectedRolId} />

        {/* Diálogo de confirmación para eliminar */}
        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Rol"
          description="¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer."
          loading={deleteLoading}
        />
      </div>
    </ProtectedRoute>
  )
}
