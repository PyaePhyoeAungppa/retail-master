"use client"

import { useState } from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartSidebar } from "@/components/pos/cart-sidebar";
import { FloatingCartButton } from "@/components/pos/floating-cart-button";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/use-auth-store";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Info, Home, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function POSPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { storeId, role, shiftId, terminalId, currentUser, setSessionContext } = useAuthStore();

  // 1. AUTO-DETECTION: Look for an active assignment if we don't have one in state
  const { data: assignedShift, isLoading: isDetecting } = useQuery({
    queryKey: ['myAssignment', currentUser?.id, storeId],
    queryFn: async () => {
      if (!storeId || !currentUser?.id) return null
      const { data, error } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('store_id', storeId)
        .eq('cashier_id', currentUser.id)
        .eq('status', 'active')
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!storeId && !!currentUser?.id && !shiftId
  })

  // Sync assignment to state
  useEffect(() => {
    if (assignedShift && !shiftId) {
      setSessionContext(assignedShift.id, assignedShift.terminal_id)
    }
  }, [assignedShift, shiftId, setSessionContext])

  // 2. Hydrate the active shift we are working on
  const { data: shift, isLoading: isShiftLoading } = useQuery({
    queryKey: ['activeShift', shiftId],
    queryFn: async () => {
      if (!shiftId) return null
      const { data, error } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('id', shiftId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!shiftId
  })

  const isReady = !!shiftId && !!terminalId && !!shift;
  const showWaitingScreen = !isDetecting && !isShiftLoading && !isReady && role === 'cashier';

  if (role && role !== 'cashier') {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-muted/20">
        <div className="text-center max-w-sm w-full p-10 bg-card rounded-[3rem] shadow-2xl border flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">POS Access Only</h2>
          <p className="text-muted-foreground font-medium text-sm mb-8">
            The checkout interface is designed exclusively for cashiers. You are currently browsing as a <strong>{role}</strong>, so transactions are disabled for your safety.
          </p>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2">
               <Home className="w-5 h-5" />
               Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (showWaitingScreen) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-muted/20">
        <div className="text-center max-w-sm w-full p-12 bg-card rounded-[3rem] shadow-2xl border flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-8 relative">
            <Clock className="w-12 h-12 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-3">Awaiting Assignment</h2>
          <p className="text-muted-foreground font-medium text-sm mb-10 leading-relaxed px-2">
            Hello, <strong>{currentUser?.email?.split('@')[0]}</strong>! Please contact your manager to assign you to a terminal and open your shift session.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
                onClick={() => window.location.reload()}
            >
               <Loader2 className="w-4 h-4" />
               Check for Assignment
            </Button>
            <Link href="/dashboard" className="w-full">
                <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground">
                Back to Dashboard
                </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
        <div className="p-8 flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
        </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className="flex-1 overflow-auto h-full min-h-0">
        <ProductGrid />
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full border-l overflow-hidden bg-card">
        <CartSidebar />
      </div>

      {/* Mobile Cart Overlay */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out",
        isCartOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <CartSidebar onOpenChange={setIsCartOpen} />
      </div>

      <FloatingCartButton onClick={() => setIsCartOpen(true)} />
    </div>
  );
}
