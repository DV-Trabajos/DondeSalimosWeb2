"use client"

import type React from "react"
import { Sidebar } from "@/components/Sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        {/* Contenido principal con margen dinámico */}
        <main className="lg:pl-16 xl:pl-64 transition-all duration-300">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
