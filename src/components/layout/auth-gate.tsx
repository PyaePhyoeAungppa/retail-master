
"use client"

import { useAuthStore } from "@/store/use-auth-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { LockScreen } from "./lock-screen"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, initialized, isProfileLoaded } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/login"

  useEffect(() => {
    if (initialized && !currentUser && !isLoginPage) {
      router.push("/login")
    }
    if (initialized && currentUser && isLoginPage) {
      router.push("/")
    }
  }, [currentUser, initialized, isLoginPage, router])

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

  // If we're not logged in, only allow the login page
  if (!currentUser) {
    return isLoginPage ? <main className="flex-1">{children}</main> : null
  }

  // If we're logged in, show the full app chrome
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-accent/10">
          {children}
        </main>
      </div>
      <LockScreen />
    </div>
  )
}
