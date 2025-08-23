"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TipoComercioForm } from "@/components/tipos-comercio/TipoComercioForm"
import { DeleteConfirmation } from "@/components/comercios/DeleteConfirmation"
import { useToast } from "@/components/ui/use-toast"
import { type TipoComercio, tipoComercioService } from "../../../services"

export default function TiposComercioPage() {
  const [tiposComercio, setTiposComercio] = useState<TipoComercio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTipoId, setSelectedTipoId] = useState<number | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  // Cargar tipos de comercio
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await tipoComercioService.getAll()
      setTiposComercio(data)
    } catch (error) {
      console.error("Error al cargar tipos de comercio:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de comercio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar tipos de comercio por término de búsqueda
  const filteredTipos = tiposComercio.filter((tipo) =>
    tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Abrir formulario para crear nuevo tipo
  const handleCreate = () => {
    setSelectedTipoId(undefined)
    setIsFormOpen(true)
  }

  // Abrir formulario para editar tipo
  const handleEdit = (id: number) => {
    setSelectedTipoId(id)
    setIsFormOpen(true)
  }

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setSelectedTipoId(id)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar tipo de comercio
  const handleDelete = async () => {
    if (!selectedTipoId) return

    setDeleteLoading(true)
    try {
      await tipoComercioService.delete(selectedTipoId)
      toast({
        title: "Éxito",
        description: "Tipo de comercio eliminado correctamente",
      })
      loadData()
    } catch (error) {
      console.error("Error al eliminar tipo de comercio:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de comercio",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tipos de Comercio</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tipo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tipos de comercio..."
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
                  {filteredTipos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No se encontraron tipos de comercio
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTipos.map((tipo) => (
                      <TableRow key={tipo.iD_TipoComercio}>
                        <TableCell>{tipo.iD_TipoComercio}</TableCell>
                        <TableCell className="font-medium">{tipo.descripcion}</TableCell>
                        <TableCell>
                          <Badge variant={tipo.estado ? "success" : "destructive"}>
                            {tipo.estado ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(tipo.fechaCreacion).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(tipo.iD_TipoComercio)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(tipo.iD_TipoComercio)}>
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

      {/* Formulario de tipo de comercio */}
      <TipoComercioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadData}
        tipoComercioId={selectedTipoId}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Tipo de Comercio"
        description="¿Estás seguro de que deseas eliminar este tipo de comercio? Esta acción no se puede deshacer."
        loading={deleteLoading}
      />
    </div>
  )
}
