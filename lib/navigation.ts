import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, Users, Store, Tag, Star, Calendar, Megaphone, Settings, User } from "lucide-react"

export type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  roles?: string[]
}

export const navigationConfig: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Usuarios", href: "/usuarios", icon: Users, roles: ["Administrador"] },
  { name: "Roles", href: "/roles", icon: Settings, roles: ["Administrador"] },
  { name: "Comercios", href: "/comercios", icon: Store, roles: ["Administrador"] },
  { name: "Tipos de Comercio", href: "/tipos-comercio", icon: Tag, roles: ["Administrador"] },
  { name: "Reseñas", href: "/resenias", icon: Star, roles: ["Administrador", "Usuario"] },
  { name: "Reservas", href: "/reservas", icon: Calendar, roles: ["Administrador", "Comercio", "Usuario"] },
  { name: "Publicidades", href: "/publicidades", icon: Megaphone, roles: ["Administrador", "Comercio"] },
  { name: "Mi Perfil", href: "/profile", icon: User, roles: ["Administrador", "Comercio", "Usuario"] },
]

export function getNavigationForRole(role?: string) {
  return navigationConfig.filter((item) => !item.roles || item.roles.includes(role ?? ""))
}