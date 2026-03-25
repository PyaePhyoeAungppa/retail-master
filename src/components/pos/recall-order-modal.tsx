
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ShoppingCart, Calendar, User as UserIcon, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Transaction, Order } from "@/lib/data"
import { useCartStore } from "@/store/use-cart-store"
import { useToastStore } from "@/store/use-toast-store"

interface RecallOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecallOrderModal({ open, onOpenChange }: RecallOrderModalProps) {
  const { storeId } = useAuthStore()
  const { setOrderId, setCustomer, addItem, clearCart } = useCartStore()
  const { toast } = useToastStore()
  const [searchQuery, setSearchQuery] = useState("")

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['pending-orders', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase.from('orders')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: open
  })

  const filteredOrders = orders?.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleSelectOrder = async (order: any) => {
    try {
      // 1. Fetch items
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('orderId', order.id)
      
      if (error) throw error

      // 2. Fetch products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', items.map(i => i.productId))

      // 3. Clear and Load
      clearCart()
      setOrderId(order.id)
      
      if (order.customerId) {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order.customerId)
          .maybeSingle()
        if (customer) setCustomer(customer)
      } else {
        setCustomer(null)
      }

      items.forEach(item => {
        const product = products?.find(p => p.id === item.productId)
        if (product) {
          addItem(product, item.quantity)
        }
      })

      toast({
        title: "Order Loaded",
        description: `Order ${order.id} has been loaded.`,
        variant: "success"
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Selection Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-card">
        <DialogHeader className="p-8 bg-primary text-primary-foreground">
          <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
             <ShoppingCart className="w-8 h-8" />
             Recall Order
          </DialogTitle>
          <p className="text-primary-foreground/70 font-medium">Select a pending order to continue in POS</p>
          
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" />
            <input 
              type="text"
              placeholder="Search orders or customers..."
              className="w-full bg-white/10 border-none rounded-2xl h-14 pl-12 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="h-[450px]">
          <div className="p-4 space-y-3">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground font-bold italic">Scanning for orders...</p>
               </div>
            ) : filteredOrders.length === 0 ? (
               <div className="text-center py-20 opacity-50">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-bold">No pending orders found</p>
               </div>
            ) : filteredOrders.map((order) => (
              <button 
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                className="w-full text-left group transition-all"
              >
                <div className="bg-muted/30 hover:bg-muted/60 p-5 rounded-[1.5rem] border border-transparent hover:border-primary/20 transition-all flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                      <ShoppingCart className="w-6 h-6" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-black text-lg">#{order.id.toString().split('-')[1]?.slice(-4) || order.id.toString().slice(-4)}</span>
                         <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 text-[10px] font-black uppercase px-2 py-0 border-none">PENDING</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                         <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>{order.customerName}</span>
                         </div>
                      </div>
                   </div>

                   <div className="text-right flex items-center gap-4">
                      <div className="space-y-0.5">
                         <p className="text-xl font-black text-primary">${order.total.toFixed(2)}</p>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{order.itemsCount} Items</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
