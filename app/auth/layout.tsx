"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser } = useAuth()

  // Redirigir al dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <header className="w-full py-4 px-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/landing">
              <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/logo-donde-salimos.png"
                  alt="Donde Salimos Logo"
                  width={150}
                  height={50}
                  className="h-10 w-auto"
                />
              </div>
            </Link>
          </div>
          <Link href="/landing">
            <Button variant="ghost">Volver al inicio</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">{children}</main>

      {/* Footer */}
      <footer className="bg-brand-gradient text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image
                src="/logo-donde-salimos.png"
                alt="Donde Salimos Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-white/80 text-sm">© 2023 Donde Salimos. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
