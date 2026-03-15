
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings,
  Store,
  Users
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen w-[80px] border-r bg-card text-card-foreground">
      <div className="p-4 flex items-center justify-center font-bold text-primary border-b bg-muted/20">
        <Store className="w-8 h-8" />
      </div>
      
      <nav className="flex-1 px-3 space-y-4 mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 z-10",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse -z-0" />
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border flex justify-center">
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
      </div>
    </div>
  )
}
