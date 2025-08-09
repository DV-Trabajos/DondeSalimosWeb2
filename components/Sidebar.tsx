"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import {
  LayoutDashboard,
  Users,
  Store,
  Tag,
  Star,
  Calendar,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Usuarios", href: "/usuarios", icon: Users, permission: "users.manage" },
  { name: "Roles", href: "/roles", icon: Settings, permission: "roles.manage" },
  { name: "Comercios", href: "/comercios", icon: Store, permission: "comercios.manage" },
  { name: "Tipos de Comercio", href: "/tipos-comercio", icon: Tag, permission: "tipos-comercio.manage" },
  { name: "Reseñas", href: "/resenias", icon: Star, permission: "resenias.manage" },
  { name: "Reservas", href: "/reservas", icon: Calendar, permission: "reservas.manage" },
  { name: "Publicidades", href: "/publicidades", icon: Megaphone, permission: "publicidades.manage" },
  // Separador visual
  { name: "divider", href: "", icon: null },
  // Secciones para roles específicos
  { name: "Reservas", href: "/reservas", icon: Calendar, permission: "reservas.view" },
  { name: "Reseñas", href: "/resenias", icon: Star, permission: "resenias.view" },
  { name: "Publicidades", href: "/publicidades", icon: Megaphone, permission: "publicidades.view" },
  { name: "Mi Perfil", href: "/profile", icon: User, permission: "profile.view" },
]

// Clave para almacenar el estado del sidebar en localStorage
const SIDEBAR_STATE_KEY = "donde-salimos-sidebar-collapsed"

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
  const { user, logout, checkUserPermission } = useAuth()

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString())
  }, [collapsed])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Filtrar navegación basada en permisos y eliminar duplicados
  const filteredNavigation = navigation
    .filter((item) => {
      // Omitir dividers
      if (item.name === "divider") return false

      // Si no tiene permiso definido, mostrar siempre (como Dashboard)
      if (!item.permission) return true

      // Verificar permiso
      return checkUserPermission(item.permission)
    })
    .reduce(
      (acc, item) => {
        // Eliminar duplicados basados en href
        const exists = acc.find((existing) => existing.href === item.href)
        if (!exists) {
          acc.push(item)
        }
        return acc
      },
      [] as typeof navigation,
    )

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo - Ahora clickeable para ir al landing */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link href="/landing" className="flex items-center gap-2">
          <Image
            src="/logo-donde-salimos.png"
            alt="Donde Salimos"
            width={collapsed ? 32 : 120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Botón Volver al Inicio */}
      <div className="px-4 pb-4">
        <Link href="/landing">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-x-3 text-gray-700 hover:text-brand-pink hover:bg-gray-50 border-gray-200",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Volver al inicio" : undefined}
          >
            <Home className="h-5 w-5 shrink-0" />
            {!collapsed && "Volver al inicio"}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <li key={`${item.name}-${index}`}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                        isActive
                          ? "bg-brand-pink text-white"
                          : "text-gray-700 hover:text-brand-pink hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 shrink-0",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-brand-pink",
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed && item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* User section */}
          <li className="mt-auto">
            <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.nombreUsuario || ""} />
                <AvatarFallback>{user?.nombreUsuario?.charAt(0) || user?.correo?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{user?.nombreUsuario || user?.correo || "Usuario"}</p>
                  <p className="truncate text-xs text-gray-500">{user?.rolUsuario?.descripcion || "Usuario"}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start gap-x-3 px-2 text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:bg-red-900/20",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Cerrar sesión" : undefined}
            >
              <LogOut className="h-6 w-6 shrink-0" />
              {!collapsed && "Cerrar sesión"}
            </Button>
          </li>
        </ul>
      </nav>

      {/* Collapse button - Siempre visible */}
      <div className="flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900">
              <div className="absolute right-0 top-0 flex w-16 justify-center pt-5">
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white dark:bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
          {filteredNavigation.find((item) => item.href === pathname)?.name || "Dashboard"}
        </div>
      </div>
    </>
  )
}

export default Sidebar