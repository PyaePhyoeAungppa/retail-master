
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings,
  Store,
  Users,
  BarChart3
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useAuthStore()

  const filteredItems = menuItems.filter(item => {
    if (role === 'cashier') {
      // Cashiers only see POS and History
      return item.href === "/pos" || item.href === "/history"
    }
    if (role === 'staff' && (item.href === "/settings" || item.href === "/reports" || item.href === "/staff")) {
      return false
    }
    return true
  })

  return (
    <div className="flex lg:flex-col h-20 lg:h-screen w-full lg:w-[80px] border-t lg:border-t-0 lg:border-r bg-card text-card-foreground shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:shadow-none">
      <div className="hidden lg:flex p-4 items-center justify-center font-bold text-primary border-b bg-muted/20">
        <Store className="w-8 h-8" />
      </div>
      
      <nav className="flex-1 flex lg:flex-col items-center justify-around lg:justify-start px-3 lg:space-y-4 lg:mt-6">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-12 h-12 lg:w-full lg:aspect-square rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 lg:w-6 lg:h-6 z-10",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse -z-0" />
              )}
              
              {/* Tooltip on hover - hidden on mobile */}
              <div className="hidden lg:block absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
                {item.name}
              </div>

              {/* Mobile label */}
              {isActive && (
                <span className="lg:hidden absolute -bottom-1 text-[8px] font-black uppercase tracking-tighter text-primary">
                  {item.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="hidden lg:flex p-4 mt-auto border-t border-border justify-center">
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
      </div>
    </div>
  )
}
