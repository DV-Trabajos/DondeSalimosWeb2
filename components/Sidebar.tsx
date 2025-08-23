import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNavigationForRole } from "@/lib/navigation"
import SidebarNav from "./SidebarNav"
import SidebarFooter from "./SidebarFooter"

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
  const { user, logout } = useAuth()

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

  const userRole = user?.rolUsuario?.descripcion
  const navigation = getNavigationForRole(userRole)

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
              collapsed && "justify-center",
            )}
            title={collapsed ? "Inicio" : undefined}
          >
            {!collapsed && "Volver al inicio"}
          </Button>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <SidebarNav items={navigation} collapsed={collapsed} pathname={pathname} />
        <SidebarFooter
          user={user}
          collapsed={collapsed}
          onLogout={handleLogout}
          toggleCollapsed={() => setCollapsed(!collapsed)}
        />
      </nav>
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
        {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
        </div>
      </div>
    </>
  )
}

export default Sidebar