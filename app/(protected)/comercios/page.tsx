"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ComercioForm } from "@/components/comercios/ComercioForm"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  type Comercio,
  type TipoComercio,
  type Usuario,
  comercioService,
  tipoComercioService,
  usuarioService,
} from "@/services"

export default function ComerciosPage() {
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [tiposComercio, setTiposComercio] = useState<TipoComercio[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedComercioId, setSelectedComercioId] = useState<number | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const { toast } = useToast()

  // Cargar comercios, tipos de comercio y usuarios
  const loadData = async () => {
    setLoading(true)
    try {
      const [comerciosData, tiposComercioData, usuariosData] = await Promise.all([
        comercioService.getAll(),
        tipoComercioService.getAll(),
        usuarioService.getAll(),
      ])

      // Asignar el nombre del tipo de comercio y usuario a cada comercio
      const comerciosConDetalles = comerciosData.map((comercio) => {
        const tipo = tiposComercioData.find((t) => t.iD_TipoComercio === comercio.iD_TipoComercio)
        const usuario = usuariosData.find((u) => u.iD_Usuario === comercio.iD_Usuario)
        return {
          ...comercio,
          tipoComercioNombre: tipo?.descripcion || "Desconocido",
          usuarioNombre: usuario?.nombreUsuario || "Desconocido",
        }
      })

      setComercios(comerciosConDetalles)
      setTiposComercio(tiposComercioData)
      setUsuarios(usuariosData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los comercios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar comercios por término de búsqueda
  const filteredComercios = comercios.filter(
    (comercio) =>
      comercio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comercio.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comercio.tipoComercioNombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Abrir formulario para crear nuevo comercio
  const handleCreate = () => {
    setSelectedComercioId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar comercio
  const handleEdit = (id: number) => {
    setSelectedComercioId(id)
    setIsFormOpen(true)
  }

  // Ver detalles del comercio
  const handleViewDetails = (comercio: Comercio) => {
    setSelectedComercio(comercio)
    setIsDetailDialogOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setSelectedComercioId(id)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar comercio
  const handleDelete = async () => {
    if (!selectedComercioId) {
      console.error("No hay ID de comercio seleccionado para eliminar")
      toast({
        title: "Error",
        description: "No se pudo identificar el comercio a eliminar",
        variant: "destructive",
      })
      return
    }

    setDeleteLoading(true)
    try {
      await comercioService.delete(selectedComercioId)
      toast({
        title: "Éxito",
        description: "Comercio eliminado correctamente",
      })
      await loadData()
    } catch (error) {
      console.error("Error al eliminar comercio:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el comercio. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Comercios</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Comercio
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar comercios..."
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead className="min-w-[150px]">Nombre</TableHead>
                      <TableHead className="min-w-[120px]">Tipo</TableHead>
                      <TableHead className="w-20">Cap.</TableHead>
                      <TableHead className="w-20">Mesas</TableHead>
                      <TableHead className="min-w-[150px]">Dirección</TableHead>
                      <TableHead className="min-w-[120px]">Usuario</TableHead>
                      <TableHead className="w-20">Estado</TableHead>
                      <TableHead className="w-32 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComercios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No se encontraron comercios
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComercios.map((comercio) => (
                        <TableRow key={`comercio-${comercio.iD_Comercio || `temp-${Date.now()}-${Math.random()}`}`}>
                          <TableCell className="font-medium">{comercio.iD_Comercio}</TableCell>
                          <TableCell className="font-medium">{comercio.nombre}</TableCell>
                          <TableCell>{comercio.tipoComercioNombre}</TableCell>
                          <TableCell>{comercio.capacidad}</TableCell>
                          <TableCell>{comercio.mesas}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={comercio.direccion}>
                            {comercio.direccion}
                          </TableCell>
                          <TableCell>{comercio.usuarioNombre}</TableCell>
                          <TableCell>
                            <Badge variant={comercio.estado ? "success" : "destructive"}>
                              {comercio.estado ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(comercio)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(comercio.iD_Comercio)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(comercio.iD_Comercio)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de detalles del comercio */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Comercio</DialogTitle>
          </DialogHeader>
          {selectedComercio && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm">{selectedComercio.iD_Comercio}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <Badge variant={selectedComercio.estado ? "success" : "destructive"}>
                      {selectedComercio.estado ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-sm">{selectedComercio.nombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <p className="text-sm">{selectedComercio.tipoComercioNombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Género Musical</label>
                  <p className="text-sm">{selectedComercio.generoMusical || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacidad</label>
                  <p className="text-sm">{selectedComercio.capacidad}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mesas</label>
                  <p className="text-sm">{selectedComercio.mesas}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-sm">{selectedComercio.direccion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo Documento</label>
                  <p className="text-sm">{selectedComercio.tipoDocumento}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nro. Documento</label>
                  <p className="text-sm">{selectedComercio.nroDocumento}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Correo</label>
                  <p className="text-sm">{selectedComercio.correo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm">{selectedComercio.telefono}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Usuario</label>
                  <p className="text-sm">{selectedComercio.usuarioNombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Creación</label>
                  <p className="text-sm">{new Date(selectedComercio.fechaCreacion).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Formulario de comercio */}
      <ComercioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadData}
        comercioId={selectedComercioId}
        tiposComercio={tiposComercio}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Comercio"
        description="¿Estás seguro de que deseas eliminar este comercio? Esta acción no se puede deshacer."
        loading={deleteLoading}
      />
    </div>
  )
}
