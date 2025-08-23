import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
          onLogout={onLogout}
          toggleCollapsed={toggleCollapsed}
        />
      </nav>
    </div>
  )
}

export default SidebarContent