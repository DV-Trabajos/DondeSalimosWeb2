import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/navigation"

interface SidebarNavProps {
  navigation: NavItem[]
  pathname: string
  collapsed: boolean
}

export function SidebarNav({ navigation, pathname, collapsed }: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-1 px-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start",
              collapsed ? "px-2" : "px-3",
              isActive && "bg-secondary text-secondary-foreground",
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

export default SidebarNav