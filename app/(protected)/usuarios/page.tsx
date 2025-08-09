"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Pencil, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UsuarioForm } from "@/components/usuarios/UsuarioForm"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/components/ui/use-toast"
import { type Usuario, type RolUsuario, usuarioService, rolUsuarioService } from "../../services"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<RolUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | undefined>(undefined)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const { checkUserPermission } = useAuth()

  // Verificar permisos
  const hasPermission = checkUserPermission("users.manage")

  // Cargar usuarios y roles
  const loadData = async () => {
    setLoading(true)
    try {
      const [usuariosData, rolesData] = await Promise.all([usuarioService.getAll(), rolUsuarioService.getAll()])

      console.log("Roles cargados:", rolesData)

      // Asignar el nombre del rol a cada usuario
      const usuariosConRol = usuariosData.map((usuario) => {
        const rol = rolesData.find((r) => r.iD_RolUsuario === usuario.iD_RolUsuario)
        return {
          ...usuario,
          rolUsuario: rol,
        }
      })

      setUsuarios(usuariosConRol)
      setRoles(rolesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
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

  // Filtrar usuarios por término de búsqueda
  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rolUsuario?.descripcion?.toLowerCase().includes(searchTerm.toLowerCase() || ""),
  )

  // Abrir formulario para crear nuevo usuario
  const handleCreate = () => {
    setSelectedUsuarioId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar usuario
  const handleEdit = (id: number) => {
    setSelectedUsuarioId(id)
    setIsFormOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    const usuario = usuarios.find((u) => u.iD_Usuario === id)
    if (usuario) {
      setSelectedUsuario(usuario)
      setSelectedUsuarioId(id)
      setIsDeleteDialogOpen(true)
    } else {
      toast({
        title: "Error",
        description: "No se encontró el usuario seleccionado",
        variant: "destructive",
      })
    }
  }

  // Eliminar usuario
  const handleDelete = async () => {
    if (!selectedUsuarioId || !selectedUsuario) return

    setDeleteLoading(true)
    try {
      console.log(`Intentando eliminar usuario con ID: ${selectedUsuarioId} y UID: ${selectedUsuario.uid}`)

      // Primero eliminamos el usuario de la API
      await usuarioService.delete(selectedUsuarioId)

      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
      loadData() // Recargar la lista después de eliminar
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario. " + (error instanceof Error ? error.message : ""),
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
      setSelectedUsuario(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        {!hasPermission ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso denegado</AlertTitle>
            <AlertDescription>No tienes permisos para gestionar usuarios.</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuarios</CardTitle>
              {/* Botón de nuevo usuario eliminado */}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar usuarios..."
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
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsuarios.length === 0 ? (
                        <TableRow key="no-data">
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            No se encontraron usuarios
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsuarios.map((usuario) => (
                          <TableRow key={`usuario-${usuario.iD_Usuario || "temp-" + crypto.randomUUID()}`}>
                            <TableCell>{usuario.iD_Usuario}</TableCell>
                            <TableCell>{usuario.nombreUsuario}</TableCell>
                            <TableCell>{usuario.correo}</TableCell>
                            <TableCell>{usuario.telefono}</TableCell>
                            <TableCell>{usuario.rolUsuario?.descripcion || "Sin rol"}</TableCell>
                            <TableCell>
                              <Badge variant={usuario.estado ? "success" : "destructive"}>
                                {usuario.estado ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(usuario.fechaCreacion).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(usuario.iD_Usuario)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(usuario.iD_Usuario)}>
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

        {/* Formulario de usuario */}
        <UsuarioForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
          usuarioId={selectedUsuarioId}
          roles={roles}
        />

        {/* Diálogo de confirmación para eliminar */}
        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Usuario"
          description={`¿Estás seguro de que deseas eliminar al usuario "${selectedUsuario?.nombreUsuario || ""}"? Esta acción eliminará el usuario y no se puede deshacer.`}
          loading={deleteLoading}
        />
      </div>
    </ProtectedRoute>
  )
}
