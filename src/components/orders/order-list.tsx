
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ChevronRight, 
  Calendar, 
  User as UserIcon, 
  ShoppingCart,
  Loader2,
  Trash2
} from "lucide-react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Transaction, Order, Store } from "@/lib/data"
import { useCartStore } from "@/store/use-cart-store"
import { useRouter } from "next/navigation"
import { useToastStore } from "@/store/use-toast-store"

export function OrderList() {
  const { storeId } = useAuthStore()
  const { setOrderId, setCustomer, addItem, clearCart } = useCartStore()
  const router = useRouter()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase.from('orders')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const { data: store } = useQuery<Store>({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) throw new Error("Store ID required")
      const { data, error } = await supabase.from('stores')
        .select('*')
        .eq('id', storeId)
        .single()
      if (error) throw error
      return data as Store
    },
    enabled: !!storeId
  })

  const handleCheckout = async (order: any) => {
    try {
      // 1. Fetch items
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('orderId', order.id)
      
      if (error) throw error

      // 2. Fetch latest product data (to get correct stock and info)
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', items.map(i => i.productId))
      
      if (prodError) throw prodError

      // 3. Clear cart and load order
      clearCart()
      setOrderId(order.id)
      
      // Set customer
      if (order.customerId) {
        const { data: customer, error: custError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order.customerId)
          .maybeSingle()
        
        if (customer) {
          console.log("Setting customer:", customer)
          setCustomer(customer)
        } else if (custError) {
          console.error("Error fetching customer:", custError)
        }
      } else {
        setCustomer(null)
      }

      // 3. Add items to cart
      // We do this after clearing to ensure fresh state
      items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          addItem(product, item.quantity)
        }
      })

      toast({
        title: "Order Loaded",
        description: `Order ${order.id} is now in the POS cart.`,
        variant: "success"
      })

      // Small delay to ensure state updates propagate before navigation
      setTimeout(() => {
        router.push('/pos')
      }, 100)
    } catch (error: any) {
      console.error("Failed to load order:", error)
      toast({
        title: "Load Failed",
        description: "Could not load order into POS. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return

    try {
      // Items will be deleted via CASCADE if set up, but let's be explicit if needed
      // Based on schema, transactionId in transaction_items references transactions(id)
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .delete()
        .eq('transactionId', orderId)
      
      if (itemsError) throw itemsError

      const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', orderId)
      
      if (txError) throw txError

      toast({
        title: "Order Deleted",
        description: `Order ${orderId} has been removed.`,
        variant: "success"
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const currency = store?.currency ?? "$"

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-2xl border flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
           <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">No Pending Orders</h3>
        <p className="text-muted-foreground">Orders saved in the POS will appear here.</p>
        <Button 
          variant="outline" 
          className="mt-6 rounded-xl border-2"
          onClick={() => router.push('/pos')}
        >
          Go to POS
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="group hover:ring-1 hover:ring-primary/20 transition-all border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-6 gap-6">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
               </div>
               
               <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-lg">{order.id}</span>
                     <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 text-[10px] uppercase font-black px-1.5 py-0 rounded-md border-none">
                        PENDING ORDER
                     </Badge>
                     {order.customerName && (
                       <span className="text-xs text-muted-foreground ml-2">Customer: {order.customerName}</span>
                     )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                     <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.date).toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Cashier: {order.cashierName}</span>
                     </div>
                  </div>
               </div>

               <div className="text-right space-y-1">
                  <p className="text-2xl font-black text-primary">{currency}{order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground font-medium">{order.itemsCount} Items</p>
               </div>

               <div className="pl-4 border-l flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                     <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    className="w-full h-11 rounded-2xl flex gap-2 font-bold shadow-lg shadow-primary/20"
                    onClick={() => handleCheckout(order)}
                  >
                     Checkout
                     <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
