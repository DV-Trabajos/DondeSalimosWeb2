"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Users,
  Store,
  Tag,
  LayoutDashboard,
  Calendar,
  Activity,
  MessageSquare,
  BadgePercent,
} from "lucide-react"
import {
  usuarioService,
  comercioService,
  tipoComercioService,
  rolUsuarioService,
  publicidadService,
  reseniaService,
  reservaService,
} from "../../../services"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Importamos el componente de gráficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalComercios: 0,
    comerciosActivos: 0,
    totalTiposComercio: 0,
    totalRoles: 0,
    totalPublicidades: 0,
    publicidadesActivas: 0,
    totalResenias: 0,
    reseniasActivas: 0,
    totalReservas: 0,
    reservasActivas: 0,
    comerciosPorTipo: [] as { tipo: string; cantidad: number; porcentaje: number }[],
    comerciosRecientes: [] as any[],
    usuariosRecientes: [] as any[],
    reseniasRecientes: [] as any[],
    reservasRecientes: [] as any[],
    actividadReciente: [] as { tipo: string; descripcion: string; fecha: Date }[],
    // Datos para gráficos
    datosBarras: [] as any[],
    datosPie: [] as any[],
    datosLinea: [] as any[],
  })

  // Colores para los gráficos
  const COLORS = ["#e6007e", "#662d91", "#ff4da6", "#8c52b8", "#b30062", "#4d2170", "#ff85c0", "#a980d1"]

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        // Cargar datos de todas las entidades
        const [usuarios, comercios, tiposComercio, roles, publicidades, resenias, reservas] = await Promise.all([
          usuarioService.getAll(),
          comercioService.getAll(),
          tipoComercioService.getAll(),
          rolUsuarioService.getAll(),
          publicidadService.getAll(),
          reseniaService.getAll(),
          reservaService.getAll(),
        ])

        // Calcular distribución de comercios por tipo
        const tiposMap = new Map()
        tiposComercio.forEach((tipo) => {
          tiposMap.set(tipo.iD_TipoComercio, tipo.descripcion)
        })

        const comerciosPorTipo: { tipo: any; cantidad: any; porcentaje: number }[] = []
        const tipoCount = new Map()

        // Contar comercios por tipo
        comercios.forEach((comercio) => {
          const tipoId = comercio.iD_TipoComercio
          const tipoNombre = tiposMap.get(tipoId) || "Desconocido"
          tipoCount.set(tipoNombre, (tipoCount.get(tipoNombre) || 0) + 1)
        })

        // Calcular porcentajes
        tipoCount.forEach((cantidad, tipo) => {
          comerciosPorTipo.push({
            tipo,
            cantidad,
            porcentaje: (cantidad / comercios.length) * 100,
          })
        })

        // Ordenar por cantidad (descendente)
        comerciosPorTipo.sort((a, b) => b.cantidad - a.cantidad)

        // Obtener comercios recientes (últimos 5)
        const comerciosRecientes = [...comercios]
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 5)
          .map((c) => ({
            id: c.iD_Comercio,
            nombre: c.nombre,
            tipo: tiposMap.get(c.iD_TipoComercio) || "Desconocido",
            fecha: new Date(c.fechaCreacion),
          }))

        // Obtener usuarios recientes (últimos 5)
        const usuariosRecientes = [...usuarios]
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 5)
          .map((u) => ({
            id: u.iD_Usuario,
            nombre: u.nombreUsuario,
            correo: u.correo,
            fecha: new Date(u.fechaCreacion),
          }))

        // Obtener reseñas recientes (últimas 5)
        const reseniasRecientes = [...resenias]
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 5)
          .map((r) => ({
            id: r.iD_Resenia,
            usuario: r.usuarioNombre || "Desconocido",
            comercio: r.comercioNombre || "Desconocido",
            comentario: r.comentario,
            fecha: new Date(r.fechaCreacion),
          }))

        // Obtener reservas recientes (últimas 5)
        const reservasRecientes = [...reservas]
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 5)
          .map((r) => ({
            id: r.iD_Reserva,
            usuario: r.usuarioNombre || "Desconocido",
            comercio: r.comercioNombre || "Desconocido",
            fecha: new Date(r.fechaCreacion),
            fechaReserva: new Date(r.fechaReserva),
          }))

        // Crear actividad reciente combinada
        const actividadReciente = [
          ...comerciosRecientes.map((c) => ({
            tipo: "comercio",
            descripcion: `Nuevo comercio: ${c.nombre}`,
            fecha: c.fecha,
          })),
          ...usuariosRecientes.map((u) => ({
            tipo: "usuario",
            descripcion: `Nuevo usuario: ${u.nombre}`,
            fecha: u.fecha,
          })),
          ...reseniasRecientes.map((r) => ({
            tipo: "resenia",
            descripcion: `Nueva reseña para ${r.comercio} por ${r.usuario}`,
            fecha: r.fecha,
          })),
          ...reservasRecientes.map((r) => ({
            tipo: "reserva",
            descripcion: `Nueva reserva para ${r.comercio} por ${r.usuario}`,
            fecha: r.fecha,
          })),
        ]
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
          .slice(0, 8)

        // Preparar datos para gráficos
        // 1. Datos para gráfico de barras (comercios por tipo)
        const datosBarras = comerciosPorTipo.map((item) => ({
          name: item.tipo,
          value: item.cantidad,
        }))

        // 2. Datos para gráfico de pie (distribución de entidades)
        const datosPie = [
          { name: "Usuarios", value: usuarios.length },
          { name: "Comercios", value: comercios.length },
          { name: "Reseñas", value: resenias.length },
          { name: "Reservas", value: reservas.length },
          { name: "Publicidades", value: publicidades.length },
        ]

        // 3. Datos para gráfico de línea (actividad por mes)
        // Agrupar todas las entidades por mes
        const últimos6Meses = Array.from({ length: 6 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          return {
            month: date.toLocaleString("default", { month: "short" }),
            year: date.getFullYear(),
            timestamp: date.getTime(),
          }
        }).reverse()

        const datosLinea = últimos6Meses.map((mes) => {
          const startOfMonth = new Date(mes.year, new Date(mes.timestamp).getMonth(), 1)
          const endOfMonth = new Date(mes.year, new Date(mes.timestamp).getMonth() + 1, 0)

          const usuariosMes = usuarios.filter((u) => {
            const fecha = new Date(u.fechaCreacion)
            return fecha >= startOfMonth && fecha <= endOfMonth
          }).length

          const comerciosMes = comercios.filter((c) => {
            const fecha = new Date(c.fechaCreacion)
            return fecha >= startOfMonth && fecha <= endOfMonth
          }).length

          const reseniasMes = resenias.filter((r) => {
            const fecha = new Date(r.fechaCreacion)
            return fecha >= startOfMonth && fecha <= endOfMonth
          }).length

          const reservasMes = reservas.filter((r) => {
            const fecha = new Date(r.fechaCreacion)
            return fecha >= startOfMonth && fecha <= endOfMonth
          }).length

          return {
            name: `${mes.month} ${mes.year}`,
            usuarios: usuariosMes,
            comercios: comerciosMes,
            resenias: reseniasMes,
            reservas: reservasMes,
          }
        })

        // Calcular estadísticas
        setStats({
          totalUsuarios: usuarios.length,
          usuariosActivos: usuarios.filter((u) => u.estado).length,
          totalComercios: comercios.length,
          comerciosActivos: comercios.filter((c) => c.estado).length,
          totalTiposComercio: tiposComercio.length,
          totalRoles: roles.length,
          totalPublicidades: publicidades.length,
          publicidadesActivas: publicidades.filter((p) => p.estado).length,
          totalResenias: resenias.length,
          reseniasActivas: resenias.filter((r) => r.estado).length,
          totalReservas: reservas.length,
          reservasActivas: reservas.filter((r) => r.estado).length,
          comerciosPorTipo,
          comerciosRecientes,
          usuariosRecientes,
          reseniasRecientes,
          reservasRecientes,
          actividadReciente,
          datosBarras,
          datosPie,
          datosLinea,
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
                  <div className="mt-2">
                    <Progress value={(stats.usuariosActivos / stats.totalUsuarios) * 100} className="h-1" />
                  </div>
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
                  <div className="mt-2">
                    <Progress value={(stats.comerciosActivos / stats.totalComercios) * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reseñas</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalResenias}</div>
                  <p className="text-xs text-muted-foreground">{stats.reseniasActivas} activas</p>
                  <div className="mt-2">
                    <Progress
                      value={stats.totalResenias ? (stats.reseniasActivas / stats.totalResenias) * 100 : 0}
                      className="h-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReservas}</div>
                  <p className="text-xs text-muted-foreground">{stats.reservasActivas} activas</p>
                  <div className="mt-2">
                    <Progress
                      value={stats.totalReservas ? (stats.reservasActivas / stats.totalReservas) * 100 : 0}
                      className="h-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Distribución por Tipo de Comercio</CardTitle>
                  <CardDescription>Porcentaje de comercios por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.comerciosPorTipo.map((item) => (
                      <div key={item.tipo} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-medium">{item.tipo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{item.cantidad} comercios</span>
                            <span className="text-sm font-medium">{Math.round(item.porcentaje)}%</span>
                          </div>
                        </div>
                        <Progress value={item.porcentaje} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas actualizaciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.actividadReciente.length > 0 ? (
                      stats.actividadReciente.map((actividad, index) => (
                        <div key={index} className="flex items-center">
                          <div className="mr-2">
                            {actividad.tipo === "comercio" ? (
                              <Store className="h-4 w-4 text-brand-pink" />
                            ) : actividad.tipo === "usuario" ? (
                              <Users className="h-4 w-4 text-brand-purple" />
                            ) : actividad.tipo === "resenia" ? (
                              <MessageSquare className="h-4 w-4 text-green-500" />
                            ) : (
                              <Calendar className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="ml-2 space-y-1">
                            <p className="text-sm font-medium leading-none">{actividad.descripcion}</p>
                            <p className="text-xs text-muted-foreground">
                              {actividad.fecha.toLocaleDateString()}{" "}
                              {actividad.fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>No hay actividad reciente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Comercios Recientes</CardTitle>
                  <CardDescription>Últimos comercios registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.comerciosRecientes.length > 0 ? (
                    <div className="space-y-4">
                      {stats.comerciosRecientes.map((comercio) => (
                        <div key={comercio.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{comercio.nombre}</p>
                            <p className="text-xs text-muted-foreground">{comercio.tipo}</p>
                          </div>
                          <Badge variant="outline">{comercio.fecha.toLocaleDateString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No hay comercios recientes</p>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Reseñas Recientes</CardTitle>
                  <CardDescription>Últimas reseñas registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.reseniasRecientes.length > 0 ? (
                    <div className="space-y-4">
                      {stats.reseniasRecientes.map((resenia) => (
                        <div key={resenia.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{resenia.comercio}</p>
                            <p className="text-xs text-muted-foreground">
                              Por {resenia.usuario} - {resenia.comentario.substring(0, 30)}
                              {resenia.comentario.length > 30 ? "..." : ""}
                            </p>
                          </div>
                          <Badge variant="outline">{resenia.fecha.toLocaleDateString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No hay reseñas recientes</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Comercios por Tipo</CardTitle>
                  <CardDescription>Cantidad de comercios por categoría</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.datosBarras}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Cantidad" fill="#e6007e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader>
                  <CardTitle>Distribución de Entidades</CardTitle>
                  <CardDescription>Proporción de cada tipo de entidad en el sistema</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.datosPie}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.datosPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card> */}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Crecimiento</CardTitle>
                <CardDescription>Evolución de entidades en los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.datosLinea}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="usuarios" stroke="#e6007e" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="comercios" stroke="#662d91" />
                    <Line type="monotone" dataKey="resenias" stroke="#4CAF50" />
                    <Line type="monotone" dataKey="reservas" stroke="#2196F3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publicidades</CardTitle>
                  <BadgePercent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPublicidades}</div>
                  <p className="text-xs text-muted-foreground">{stats.publicidadesActivas} activas</p>
                  <div className="mt-2">
                    <Progress
                      value={stats.totalPublicidades ? (stats.publicidadesActivas / stats.totalPublicidades) * 100 : 0}
                      className="h-1"
                    />
                  </div>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Actividad</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      ((stats.usuariosActivos +
                        stats.comerciosActivos +
                        stats.reseniasActivas +
                        stats.reservasActivas) /
                        (stats.totalUsuarios + stats.totalComercios + stats.totalResenias + stats.totalReservas)) *
                        100,
                    )}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Entidades activas vs. total</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
