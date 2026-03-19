import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  isLocked: boolean
  currentUser: User | null
  session: Session | null
  initialized: boolean
  storeId: string | null
  role: string | null
  accessibleStores: { id: string, name: string }[]
  isProfileLoaded: boolean
  lock: () => void
  unlock: (pin: string) => boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setStoreId: (id: string | null) => void
  setRole: (role: string | null) => void
  setAccessibleStores: (stores: { id: string, name: string }[]) => void
  setProfileLoaded: (loaded: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLocked: false,
      currentUser: null,
      session: null,
      initialized: false,
      storeId: null,
      role: null,
      accessibleStores: [],
      isProfileLoaded: false,
      lock: () => set({ isLocked: true }),
      unlock: (inputPin: string) => {
        // Fast unlock via PIN (stored in user metadata or hardcoded 1234 for now)
        // In a real app, this should probably verify against a local or metadata secret
        if (inputPin === "1234") {
          set({ isLocked: false })
          return true
        }
        return false
      },
      setUser: (user) => set({ currentUser: user, initialized: true }),
      setSession: (session) => set({ 
        session, 
        currentUser: session?.user ?? null,
        initialized: true,
        // If logging out, profile is effectively unloaded
        isProfileLoaded: session ? get().isProfileLoaded : false,
        role: session ? get().role : null,
        storeId: session ? get().storeId : null,
        accessibleStores: session ? get().accessibleStores : [],
      }),
      setStoreId: (id) => set({ storeId: id }),
      setRole: (role) => set({ role: role }),
      setAccessibleStores: (stores) => set({ accessibleStores: stores }),
      setProfileLoaded: (loaded) => set({ isProfileLoaded: loaded }),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, currentUser: null, isLocked: false, storeId: null, role: null, accessibleStores: [], isProfileLoaded: false })
      }
    }),
    {
      name: 'retail-auth-storage-v3',
      partialize: (state) => ({ isLocked: state.isLocked }), // Only persist lock state
    }
  )
)
