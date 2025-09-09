"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNavigationForRole } from "@/lib/navigation"
import SidebarContent from "./SidebarContent"

// Clave para almacenar el estado del sidebar en localStorage
const SIDEBAR_STATE_KEY = "donde-salimos-sidebar-collapsed"

const getRoleNameById = (roleId: number): string => {
  switch (roleId) {
    case 1:
      return "Usuario"
    case 2:
      return "Administrador"
    case 3:
      return "Comercio"
    default:
      return "Usuario"
  }
}

export function Sidebar() {
  // Inicializar estado desde localStorage si está disponible
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
      return savedState === "true"
    }
    return false
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString())
  }, [collapsed])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const userRoleId = user?.iD_RolUsuario || user?.rolUsuario?.iD_RolUsuario
  const userRole = userRoleId ? getRoleNameById(userRoleId) : user?.rolUsuario?.descripcion || "Usuario"

  console.log("[v0] Usuario actual:", user)
  console.log("[v0] ID del rol:", userRoleId)
  console.log("[v0] Nombre del rol:", userRole)

  const navigation = getNavigationForRole(userRole)
  console.log(
    "[v0] Navegación filtrada para rol",
    userRole,
    ":",
    navigation.map((n) => n.name),
  )

  const toggleCollapsed = () => setCollapsed(!collapsed)

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "block" : "hidden")}>
        {mobileOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75">
            <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-16 items-center justify-between px-4">
                <span className="text-xl font-semibold">Donde Salimos</span>
                <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <SidebarContent
                collapsed={false}
                navigation={navigation}
                pathname={pathname}
                user={user}
                onLogout={handleLogout}
                toggleCollapsed={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          navigation={navigation}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
          toggleCollapsed={toggleCollapsed}
        />
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
        </div>
      </div>
    </>
  )
}

export default Sidebar