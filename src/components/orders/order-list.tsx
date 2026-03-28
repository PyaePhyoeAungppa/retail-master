
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
  Trash2,
  Eye,
  Share2
} from "lucide-react"
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Transaction, Order, Store } from "@/lib/data"
import { useCartStore } from "@/store/use-cart-store"
import { useRouter } from "next/navigation"
import { useToastStore } from "@/store/use-toast-store"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface OrderListProps {
  searchQuery?: string
  activeFilter?: 'pending' | 'completed' | 'all'
}

export function OrderList({ searchQuery = "", activeFilter = 'pending' }: OrderListProps) {
  const { storeId } = useAuthStore()
  const { setOrderId, setCustomer, addItem, clearCart } = useCartStore()
  const router = useRouter()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', storeId, activeFilter, searchQuery],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase.from('orders')
        .select('*')
        .eq('store_id', storeId)
      
      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter)
      }

      if (searchQuery) {
        // Simple search logic for ID or Customer Name
        query = query.or(`id.ilike.%${searchQuery}%,customerName.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
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

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
    setLoadingItems(true)
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('orderId', order.id)
      
      if (error) throw error
      setOrderItems(data || [])
    } catch (error: any) {
      toast({
        title: "Details Failed",
        description: "Could not load order items.",
        variant: "destructive"
      })
    } finally {
      setLoadingItems(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      // 1. Delete order items first (explicitly)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('orderId', orderToDelete)
      
      if (itemsError) throw itemsError

      // 2. Delete the order itself
      const { error: txError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete)
      
      if (txError) throw txError

      toast({
        title: "Order Deleted",
        description: `Order ${orderToDelete} has been removed.`,
        variant: "success"
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setOrderToDelete(null)
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
            <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors shrink-0">
                  <ShoppingCart className="w-6 h-6" />
               </div>
               
               <div className="flex-1 space-y-1 min-w-0">
                   <div className="flex flex-wrap items-center gap-2">
                     <span className="font-bold text-lg truncate max-w-[150px]">{order.id}</span>
                     <Badge className={`${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} hover:bg-opacity-100 text-[10px] uppercase font-black px-1.5 py-0 rounded-md border-none`}>
                        {order.status} ORDER
                     </Badge>
                     {order.customerName && (
                       <span className="text-xs text-muted-foreground ml-2 truncate">Customer: {order.customerName}</span>
                     )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                     <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="truncate">{new Date(order.date).toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="truncate">Cashier: {order.cashierName}</span>
                     </div>
                  </div>
               </div>

               <div className="md:text-right space-y-1 shrink-0">
                  <p className="text-2xl font-black text-primary">{currency}{order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground font-medium">{order.itemsCount} Items</p>
               </div>

               <div className="md:pl-4 md:border-l flex items-center gap-2 w-full md:w-auto">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-primary hover:bg-primary/10"
                    onClick={() => handleViewDetails(order)}
                  >
                     <Eye className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setOrderToDelete(order.id)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                     <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-primary hover:bg-primary/10"
                    onClick={() => {
                      const link = `${window.location.origin}/order-view/${order.id}`
                      navigator.clipboard.writeText(link)
                      toast({ title: "Link Copied!", description: "Order link copied to clipboard.", variant: "success" })
                    }}
                  >
                     <Share2 className="w-5 h-5" />
                  </Button>
                  {order.status === 'pending' && (
                    <Button 
                      className="flex-1 md:w-auto md:min-w-[120px] h-11 rounded-2xl flex gap-2 font-bold shadow-lg shadow-primary/20"
                      onClick={() => handleCheckout(order)}
                    >
                       Checkout
                       <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
               </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-primary-foreground">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-8 h-8" />
              Order Details
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 font-medium">
              Order ID: {selectedOrder?.id} • {selectedOrder?.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="p-8">
            <ScrollArea className="h-[300px] mb-6 pr-4">
              {loadingItems ? (
                <div className="flex justify-center items-center h-full py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-muted/50">
                      <TableHead className="font-bold text-foreground">Item</TableHead>
                      <TableHead className="text-right font-bold text-foreground">Qty</TableHead>
                      <TableHead className="text-right font-bold text-foreground">Price</TableHead>
                      <TableHead className="text-right font-bold text-foreground">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id} className="border-muted/50">
                        <TableCell className="font-medium text-xs">{item.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums">{currency}{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold tabular-nums">{currency}{item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>

            <div className="bg-muted/30 p-6 rounded-3xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold tabular-nums">{currency}{selectedOrder?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-bold tabular-nums">{currency}{selectedOrder?.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black border-t pt-4 mt-2">
                <span>Total Amount</span>
                <span className="text-primary tabular-nums">{currency}{selectedOrder?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteOrder}
        title="Delete Order?"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Remove Order"
        variant="destructive"
      />
    </div>
  )
}
