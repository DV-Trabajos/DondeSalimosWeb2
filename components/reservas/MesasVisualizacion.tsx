"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { type Comercio, type Reserva, comercioService, reservaService } from "../../services"

interface MesasVisualizacionProps {
  comercioId: number
}

export function MesasVisualizacion({ comercioId }: MesasVisualizacionProps) {
  const [comercio, setComercio] = useState<Comercio | null>(null)
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [mesasOcupadas, setMesasOcupadas] = useState<number[]>([])

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      try {
        // Cargar datos del comercio
        const comercioData = await comercioService.getById(comercioId)
        setComercio(comercioData)

        // Cargar reservas para hoy
        const todasReservas = await reservaService.getAll()

        // Filtrar reservas para este comercio y para hoy
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const mañana = new Date(hoy)
        mañana.setDate(mañana.getDate() + 1)

        const reservasDelDia = todasReservas.filter((r) => {
          const fechaReserva = new Date(r.fechaReserva)
          return r.iD_Comercio === comercioId && fechaReserva >= hoy && fechaReserva < mañana && r.estado
        })

        setReservasHoy(reservasDelDia)

        // Simular mesas ocupadas (en una app real, esto vendría de la base de datos)
        // Aquí asumimos que cada reserva ocupa un número de mesas basado en comensales
        const mesasOcupadasIds: number[] = []
        reservasDelDia.forEach((reserva) => {
          const mesasNecesarias = Math.ceil(reserva.comenzales / 4) // 4 personas por mesa

          // Asignar mesas secuencialmente (simplificado)
          for (let i = 1; i <= mesasNecesarias && i <= comercioData.mesas; i++) {
            if (!mesasOcupadasIds.includes(i)) {
              mesasOcupadasIds.push(i)
            }
          }
        })

        setMesasOcupadas(mesasOcupadasIds)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (comercioId) {
      cargarDatos()
    }
  }, [comercioId])

  // Renderizar mesa
  const renderMesa = (mesaId: number) => {
    const isOcupada = mesasOcupadas.includes(mesaId)
    return (
      <div
        key={`mesa-${mesaId}`}
        className={`
          w-16 h-16 rounded-md flex items-center justify-center
          ${
            isOcupada
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }
        `}
      >
        <div className="text-center">
          <div className="font-bold text-lg">#{mesaId}</div>
          <div className="text-xs">{isOcupada ? "Ocupada" : "Libre"}</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    )
  }

  if (!comercio) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No se encontró información del comercio</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Estado de Mesas - {comercio.nombre}</CardTitle>
          <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Total de mesas: {comercio.mesas}</span>
            <span>Ocupadas: {mesasOcupadas.length}</span>
            <span>Libres: {comercio.mesas - mesasOcupadas.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-brand-pink h-2.5 rounded-full"
              style={{ width: `${(mesasOcupadas.length / comercio.mesas) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: comercio.mesas }, (_, i) => renderMesa(i + 1))}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Reservas para hoy: {reservasHoy.length}</p>
          <p>Comensales esperados: {reservasHoy.reduce((sum, r) => sum + r.comenzales, 0)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
