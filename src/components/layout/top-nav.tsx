
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, User, Clock, Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/use-auth-store"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Store, Info, AlertTriangle, CheckCircle } from "lucide-react"

export function TopNav() {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const { currentUser, signOut, storeId } = useAuthStore()

  const { data: shift } = useQuery({
    queryKey: ['activeShift', storeId],
    queryFn: async () => {
      if (!storeId) return null
      const { data, error } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('status', 'active')
        .eq('store_id', storeId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!storeId
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const { data: settings } = useQuery({
    queryKey: ['settings', storeId],
    queryFn: async () => {
      if (!storeId) return null
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const initials = currentUser?.email?.substring(0, 2).toUpperCase() || "AD"
  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0

  return (
    <header className="h-16 border-b bg-card px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
      <div className="flex items-center gap-4 lg:gap-8 min-w-0">
        <div className="flex flex-col truncate">
          <h1 className="text-lg lg:text-xl font-black tracking-tighter leading-none truncate">{settings?.name || "Retail Master"}</h1>
          <p className="text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">{settings?.brand || "Store Management"}</p>
        </div>

        <div className="hidden lg:flex items-center gap-4 pl-8 border-l">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Active Shift</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{shift?.name || "Morning Shift"}</span>
              <Badge variant="secondary" className="rounded-lg py-0 px-1.5 text-[10px] font-black uppercase">
                {shift?.terminal || "Term 01"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground font-medium bg-muted/30 px-4 py-2 rounded-xl border">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold font-mono">
            {mounted ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "00:00:00"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors h-11 w-11"
            onClick={() => useAuthStore.getState().lock()}
          >
            <Lock className="w-5 h-5" />
          </Button>

          <Dialog>
            <DialogTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full h-11 w-11 hover:bg-muted" />}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-card text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="p-6 bg-primary text-primary-foreground">
                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                  Notifications
                  <Badge className="bg-white/20 text-white border-none">{notifications?.length || 0}</Badge>
                </DialogTitle>
                <p className="text-primary-foreground/70 text-sm font-medium mt-1">Stay updated with store activities</p>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-2">
                  {notifications?.map((notification: any) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-2xl border transition-all hover:bg-muted/50 group ${!notification.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                          notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {notification.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                           notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pt-1">
                            {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                      </div>
                    </div>
                  ))}
                  {(!notifications || notifications.length === 0) && (
                    <div className="text-center py-20 opacity-50">
                      <Bell className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-bold">No notifications yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 bg-muted/30 text-center">
                <Button variant="ghost" size="sm" className="font-bold text-xs hover:bg-transparent hover:text-primary">
                  Mark all as read
                </Button>
              </div>
            </DialogContent>
          </Dialog>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-black lowercase leading-none mb-1">{currentUser?.email || "Admin User"}</p>
              <button 
                onClick={() => signOut()}
                className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
              >
                Sign Out
              </button>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20 shadow-inner">
              {currentUser?.email?.substring(0, 2).toUpperCase() || "AD"}
            </div>
        </div>
      </div>
    </header>
  )
}
