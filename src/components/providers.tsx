
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { ToastContainer } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  const { setSession, setStoreId, setProfileLoaded } = useAuthStore()

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', userId)
        .single()
      
      if (!error && data) {
        setStoreId(data.store_id)
      }
      setProfileLoaded(true)
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfileLoaded(true) // No user, so "profile" (null) is as loaded as it'll get
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setStoreId(null)
        setProfileLoaded(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setStoreId, setProfileLoaded])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  )
}
