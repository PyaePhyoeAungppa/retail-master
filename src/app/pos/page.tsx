"use client"

import { useState } from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartSidebar } from "@/components/pos/cart-sidebar";
import { FloatingCartButton } from "@/components/pos/floating-cart-button";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/use-auth-store";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TerminalSelector } from "@/components/pos/terminal-selector";

export default function POSPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { storeId, role } = useAuthStore();
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);

  const { data: shift, isLoading } = useQuery({
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

  // Show terminal selector if:
  // 1. Role is cashier (or we want to enforce it for everyone)
  // 2. No active shift is found
  // 3. User hasn't just selected one
  const showSelector = !isLoading && !shift && !activeTerminalId && role === 'cashier'

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

      {showSelector && (
        <TerminalSelector onSelect={(id) => setActiveTerminalId(id)} />
      )}
    </div>
  );
}
