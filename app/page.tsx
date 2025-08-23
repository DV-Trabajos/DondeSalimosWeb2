"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Si el usuario está autenticado, redirigir al dashboard
        router.push("/dashboard")
      } else {
        // Si el usuario no está autenticado, redirigir a la landing page
        router.push("/landing")
      }
    }
  }, [user, isLoading, router])

  // Mostrar un indicador de carga mientras se verifica la autenticación
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
