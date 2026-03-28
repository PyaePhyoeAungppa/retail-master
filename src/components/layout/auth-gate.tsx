
"use client"

import { useAuthStore } from "@/store/use-auth-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { LockScreen } from "./lock-screen"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, initialized, isProfileLoaded, storeId, role } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/login"
  const isLandingPage = pathname === "/"
  const isOrderView = pathname?.startsWith("/order-view")
  const isPublicPage = isLoginPage || isLandingPage || isOrderView

  useEffect(() => {
    console.log("AuthGate State:", { initialized, hasUser: !!currentUser, isProfileLoaded, storeId, pathname })
    
    if (initialized && !currentUser && !isPublicPage) {
       console.log("Redirecting to /login")
      router.push("/login")
    }
    if (initialized && currentUser && isLandingPage) {
      const target = role === 'cashier' ? "/pos" : "/dashboard"
      console.log(`Redirecting to ${target}`)
      router.push(target)
    }
    if (initialized && currentUser && isProfileLoaded && !storeId && pathname !== "/setup") {
       console.log("Redirecting to /setup")
      router.push("/setup")
    }
    if (initialized && currentUser && isProfileLoaded && storeId && (isLoginPage || pathname === "/setup")) {
       console.log("Redirecting to /dashboard")
      router.push("/dashboard")
    }

    // Role-Based Route Protection
    if (initialized && currentUser && isProfileLoaded) {
      if (role === 'cashier' && (pathname?.startsWith('/reports') || pathname?.startsWith('/settings') || pathname?.startsWith('/products') || pathname?.startsWith('/staff'))) {
        console.log("Access Denied: Cashier attempting to access restricted route")
        router.push("/pos") // Redirect Cashiers to POS
      }
      
      if (role === 'staff' && pathname?.startsWith('/staff')) {
        console.log("Access Denied: Staff attempting to access admin route")
        router.push("/dashboard")
      }
    }
  }, [currentUser, initialized, isLoginPage, router, storeId, isProfileLoaded, pathname, role])

  if (!initialized || (currentUser && !isProfileLoaded)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">
            {!initialized ? "Initializing Terminal..." : "Fetching Business Profile..."}
          </p>
        </div>
      </div>
    )
  }

  // If we're not logged in, only allow public pages
  if (!currentUser) {
    return isPublicPage ? <main className="flex-1">{children}</main> : null
  }

  // If we're on the login page but authenticated, show a loader while redirecting
  if (isLoginPage) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  // If we're on the setup page or order-view, show a minimal version without navs
  if (pathname === "/setup" || isOrderView) {
    return <main className="flex-1 overflow-y-auto bg-accent/5">{children}</main>
  }

  // If we're logged in, show the full app chrome
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 order-1 lg:order-2">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-accent/10 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <div className="order-2 lg:order-1 shrink-0">
        <Sidebar />
      </div>
      <LockScreen />
    </div>
  )
}
