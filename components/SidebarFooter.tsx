"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Usuario } from "@/services"

interface SidebarFooterProps {
  user: Usuario | null
  onLogout: () => void
  collapsed: boolean
  toggleCollapsed: () => void
}

export function SidebarFooter({ user, onLogout, collapsed, toggleCollapsed }: SidebarFooterProps) {
  const userInitials = user?.nombreUsuario
    ? user.nombreUsuario
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <div className="border-t p-4 space-y-2">
      {/* User Info */}
      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.nombreUsuario || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.rolUsuario?.descripcion || "Usuario"}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onLogout} className={cn("flex-1", collapsed && "px-2")}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Salir</span>}
        </Button>

        <Button variant="ghost" size="sm" onClick={toggleCollapsed} className="px-2">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

export default SidebarFooter