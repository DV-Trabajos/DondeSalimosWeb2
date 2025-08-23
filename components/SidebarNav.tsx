import Link from "next/link"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/navigation"

interface SidebarNavProps {
  items: NavItem[]
  collapsed: boolean
  pathname: string
}

export function SidebarNav({ items, collapsed, pathname }: SidebarNavProps) {
  return (
    <ul role="list" className="-mx-2 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <li key={item.href}>
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
  )
}

export default SidebarNav