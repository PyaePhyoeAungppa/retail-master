"use client"

import { useState } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckoutModal } from "./checkout-modal"
import { RecallOrderModal } from "./recall-order-modal"
import Image from "next/image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Customer, Store } from "@/lib/data"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ReceiptText, User as UserIcon, Search, X, Check, ListTodo, Save, Loader2 } from "lucide-react"
import { useToastStore } from "@/store/use-toast-store"

export function CartSidebar({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    total, 
    selectedCustomer, 
    setCustomer, 
    orderId,
    includeTax,
    setIncludeTax
  } = useCartStore()
  const { storeId, currentUser } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isRecallOpen, setIsRecallOpen] = useState(false)
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('name')
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone?.includes(customerSearchQuery)
  ) || []

  const { data: store } = useQuery<Store>({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) throw new Error("No store ID")
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

  const taxRate = store?.tax_rate ?? 0.1
  const currency = store?.currency ?? "$"
  const tax = includeTax ? (total * taxRate) : 0
  const grandTotal = total + tax

  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToastStore()

  const handleSaveOrder = async () => {
    if (!storeId) return
    setIsSaving(true)
    
    // Logic similar to CheckoutModal but for saving as pending
    const newTxId = orderId || `TX-${Date.now()}`
    
    const order = {
      id: newTxId,
      store_id: storeId,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id || null,
      customerName: selectedCustomer?.name || "Walk In",
      cashierId: currentUser?.id || null,
      cashierName: currentUser?.email || "POS Terminal",
      terminalId: "TERM-01",
      itemsCount: items.length,
      subtotal: total,
      tax: tax,
      total: grandTotal,
      status: 'pending'
    }

    const orderItems = items.map(item => ({
      orderId: newTxId,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    try {
      // 1. Save Order
      const { error: txError } = await supabase
        .from('orders')
        .upsert([order])
      
      if (txError) throw txError

      // 2. Cleanup old items
      if (orderId) {
        await supabase.from('order_items').delete().eq('orderId', newTxId)
      }

      // 3. Save new items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) throw itemsError

      toast({
        title: "Order Saved",
        description: `Order ${newTxId} has been saved.`,
        variant: "success"
      })
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      clearCart()
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full lg:w-[450px] lg:max-w-[450px] bg-card flex flex-col h-full overflow-hidden shrink-0 relative">
      <div className="p-4 border-b flex items-center gap-4 bg-muted/20">
        {onOpenChange && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-full shrink-0" 
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        <button 
          onClick={() => setIsCustomerSearchOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-primary/5 p-1 rounded-xl transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Customer</p>
            <p className="text-sm font-bold truncate pr-2">
              {selectedCustomer?.name || "Select Customer"}
            </p>
          </div>
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
        </button>
        {orderId && (
          <Badge variant="outline" className="rounded-full px-2 py-1 bg-orange-50 text-orange-600 border-orange-200 shrink-0 font-black text-[10px] animate-pulse">
            #{orderId.toString().startsWith('TX-') ? orderId.toString().split('-')[1].slice(-4) : orderId.toString().slice(-4)}
          </Badge>
        )}
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shrink-0 border-2"
          onClick={() => setIsRecallOpen(true)}
        >
          <ListTodo className="w-4 h-4" />
        </Button>
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-white shrink-0 font-bold border-2">
          {items.length} Items
        </Badge>
      </div>

      {/* Customer Search Dialog */}
      <Dialog open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 bg-primary text-primary-foreground">
            <h2 className="text-2xl font-black tracking-tight">Select Customer</h2>
            <p className="text-primary-foreground/70 text-sm font-medium">Search by name or phone number</p>
            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" />
              <input 
                autoFocus
                type="text"
                placeholder="Find a customer..."
                className="w-full bg-white/10 border-none rounded-2xl h-14 pl-12 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/20 transition-all font-medium"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[400px] p-2">
            <div className="space-y-1">
               {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                        setCustomer(customer)
                        setIsCustomerSearchOpen(false)
                        setCustomerSearchQuery("")
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      selectedCustomer?.id === customer.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedCustomer?.id === customer.id ? 'bg-primary text-white' : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}>
                         <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone || customer.email || 'No contact info'}</p>
                      </div>
                    </div>
                    {selectedCustomer?.id === customer.id && <Check className="w-5 h-5" />}
                  </button>
               ))}
               {filteredCustomers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                     <p className="font-medium">No customers found</p>
                  </div>
               )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex-1 min-h-0 p-4">
        {items.length === 0 ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
               <ShoppingBag className="w-10 h-10" />
            </div>
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm">Add some products to start an order</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 group animate-in slide-in-from-right-4 duration-300">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-muted-foreground transition-all group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary relative overflow-hidden shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    item.name.substring(0, 2)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold truncate pr-2">{item.name}</h4>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 rounded-md hover:bg-card flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[10px] font-bold w-3 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 rounded-md hover:bg-card flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <p className="font-bold text-xs">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 bg-muted/20 border-t space-y-4">
         <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Subtotal</span>
              <span className="text-foreground">{currency}{total.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => setIncludeTax(!includeTax)}
              className={`w-full flex justify-between items-center py-1 transition-all rounded-lg px-2 -mx-2 hover:bg-primary/5 group ${!includeTax ? 'opacity-50' : ''}`}
            >
              <span className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                Tax ({(taxRate * 100).toFixed(0)}%)
                <Badge variant="outline" className={`text-[9px] h-4 px-1 uppercase font-black transition-colors ${includeTax ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-muted'}`}>
                  {includeTax ? 'Incl' : 'Excl'}
                </Badge>
              </span>
              <span className={`font-bold transition-all ${includeTax ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                {currency}{tax.toFixed(2)}
              </span>
            </button>
            <Separator className="my-2" />
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-black text-primary">{currency}{grandTotal.toFixed(2)}</span>
            </div>
         </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              variant="outline" 
              className="h-12 rounded-xl flex gap-2 border-2 px-2 text-primary hover:bg-primary/5" 
              onClick={handleSaveOrder} 
              disabled={items.length === 0 || isSaving}
            >
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}
               <span className="truncate">{isSaving ? 'Saving...' : 'Save Order'}</span>
            </Button>
            <Button className="h-12 rounded-xl flex gap-2 shadow-lg shadow-primary/20 px-2" disabled={items.length === 0} onClick={() => setIsCheckoutOpen(true)}>
               <CreditCard className="w-4 h-4 shrink-0" />
               <span className="truncate">{orderId ? 'Collect' : 'Checkout'}</span>
            </Button>
          </div>
      </div>

      <CheckoutModal 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
      />

      <RecallOrderModal
        open={isRecallOpen}
        onOpenChange={setIsRecallOpen}
      />
    </div>
  )
}
