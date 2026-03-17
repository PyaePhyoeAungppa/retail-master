
"use client"

import { useState } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ReceiptText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CheckoutModal } from "./checkout-modal"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Customer } from "@/lib/data"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { User as UserIcon, Search, X, Check } from "lucide-react"

export function CartSidebar({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const { items, removeItem, updateQuantity, clearCart, total, selectedCustomer, setCustomer } = useCartStore()
  const { storeId } = useAuthStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
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

  const tax = total * 0.1
  const grandTotal = total + tax

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
                    <p className="font-bold text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 bg-muted/20 border-t space-y-4">
         <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (10%)</span>
              <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-black text-primary">${grandTotal.toFixed(2)}</span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" className="h-12 rounded-xl flex gap-2 border-2 px-2" onClick={clearCart} disabled={items.length === 0}>
               <ReceiptText className="w-4 h-4 shrink-0" />
               <span className="truncate">Void</span>
            </Button>
            <Button className="h-12 rounded-xl flex gap-2 shadow-lg shadow-primary/20 px-2" disabled={items.length === 0} onClick={() => setIsCheckoutOpen(true)}>
               <CreditCard className="w-4 h-4 shrink-0" />
               <span className="truncate">Checkout</span>
            </Button>
         </div>
      </div>

      <CheckoutModal 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
      />
    </div>
  )
}
