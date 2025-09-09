import Link from "next/link"
import { Button } from "@/components/ui/button"
import SidebarNav from "./SidebarNav"
import SidebarFooter from "./SidebarFooter"
import type { NavItem } from "@/lib/navigation"
import type { Usuario } from "@/services"

interface SidebarContentProps {
  collapsed: boolean
  navigation: NavItem[]
  pathname: string
  user: Usuario | null
  onLogout: () => void
  toggleCollapsed: () => void
}

export function SidebarContent({
  collapsed,
  navigation,
  pathname,
  user,
  onLogout,
  toggleCollapsed,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo - Ahora clickeable para ir al landing */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link href="/landing" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">DS</span>
          </div>
          {!collapsed && <span className="text-lg font-semibold">Donde Salimos</span>}
        </Link>
      </div>

      {/* Botón Volver al Inicio */}
      <div className="px-4 pb-4">
        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
          <Link href="/landing">
            <span className="mr-2">←</span>
            {!collapsed && "Volver al inicio"}
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <SidebarNav navigation={navigation} pathname={pathname} collapsed={collapsed} />

      {/* Footer */}
      <SidebarFooter user={user} onLogout={onLogout} collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
    </div>
  )
}

export default SidebarContent