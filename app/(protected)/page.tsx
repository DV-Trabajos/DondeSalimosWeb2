"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, Store, Tag, LayoutDashboard } from "lucide-react"
import { usuarioService, comercioService, tipoComercioService, rolUsuarioService } from "../../services"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalComercios: 0,
    comerciosActivos: 0,
    totalTiposComercio: 0,
    totalRoles: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        // Cargar datos de todas las entidades
        const [usuarios, comercios, tiposComercio, roles] = await Promise.all([
          usuarioService.getAll(),
          comercioService.getAll(),
          tipoComercioService.getAll(),
          rolUsuarioService.getAll(),
        ])

        // Calcular estadísticas
        setStats({
          totalUsuarios: usuarios.length,
          usuariosActivos: usuarios.filter((u) => u.estado).length,
          totalComercios: comercios.length,
          comerciosActivos: comercios.filter((c) => c.estado).length,
          totalTiposComercio: tiposComercio.length,
          totalRoles: roles.length,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                  <p className="text-xs text-muted-foreground">{stats.usuariosActivos} activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comercios</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalComercios}</div>
                  <p className="text-xs text-muted-foreground">{stats.comerciosActivos} activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tipos de Comercio</CardTitle>
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTiposComercio}</div>
                  <p className="text-xs text-muted-foreground">Categorías disponibles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Roles</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRoles}</div>
                  <p className="text-xs text-muted-foreground">Perfiles de usuario</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Bienvenido al panel de administración de Donde Salimos. Desde aquí puedes gestionar todos los
                    aspectos de la aplicación.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Gestiona usuarios y sus roles</li>
                    <li>Administra comercios (bares y boliches)</li>
                    <li>Configura tipos de comercio</li>
                    <li>Visualiza estadísticas de uso</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas actualizaciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Sistema inicializado</p>
                        <p className="text-sm text-muted-foreground">Bienvenido a Donde Salimos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analíticas</CardTitle>
                <CardDescription>Estadísticas detalladas del sistema</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <p>Las analíticas detalladas estarán disponibles próximamente.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
