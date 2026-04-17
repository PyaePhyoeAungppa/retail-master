
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { useLanguageStore } from "@/store/use-language-store"
import { ToastContainer } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore()

  useEffect(() => {
    // Update HTML lang and body class for CSS targeting (e.g., line-height fixes)
    document.documentElement.lang = language
    if (language === 'mm') {
      document.body.classList.add('lang-mm')
    } else {
      document.body.classList.remove('lang-mm')
    }
  }, [language])

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  const { setSession, setStoreId, setRole, setAccessibleStores, setProfileLoaded } = useAuthStore()

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      // 1. Fetch Primary Profile & Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id, role')
        .eq('id', userId)
        .single()
      
      if (profile) {
        setRole(profile.role)
        if (profile.store_id) setStoreId(profile.store_id)
      }

      // 2. Fetch All Accessible Stores (Junction Table)
      const { data: storeLinks } = await supabase
        .from('store_users')
        .select('store_id, stores(name)')
        .eq('user_id', userId)
      
      if (storeLinks && storeLinks.length > 0) {
        const stores = storeLinks.map((link: any) => ({
          id: link.store_id,
          name: link.stores?.name || 'Unknown Store'
        }))
        setAccessibleStores(stores)
        
        // If no primary store_id, use the first accessible one
        if (!profile?.store_id) {
          setStoreId(stores[0].id)
        }
      } else if (profile?.store_id) {
        // Fallback for legacy data: Fetch the single store's name
        const { data: mainStore } = await supabase
          .from('stores')
          .select('id, name')
          .eq('id', profile.store_id)
          .single()
        
        if (mainStore) {
          setAccessibleStores([{ 
            id: mainStore.id, 
            name: mainStore.name || 'Store' 
          }])
        }
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
