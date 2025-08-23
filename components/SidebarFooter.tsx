import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import type { Usuario } from "@/services"

interface SidebarFooterProps {
  user: Usuario | null
  collapsed: boolean
  onLogout: () => void
  toggleCollapsed: () => void
}

export function SidebarFooter({ user, collapsed, onLogout, toggleCollapsed }: SidebarFooterProps) {
  return (
    <>
      <div className="mt-auto">
        <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
          <Avatar className="h-8 w-8">
            <AvatarImage src={/*user?.photoURL ||*/ ""} alt={user?.nombreUsuario || ""} />
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
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-x-3 px-2 text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:bg-red-900/20",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-6 w-6 shrink-0" />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </div>
      <div className="flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </>
  )
}

export default SidebarFooter