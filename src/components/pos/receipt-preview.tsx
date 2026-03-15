
"use client"

import { useCartStore } from "@/store/use-cart-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Printer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

interface ReceiptPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  paymentMethod: string
}

export function ReceiptPreview({ open, onOpenChange, transactionId, paymentMethod }: ReceiptPreviewProps) {
  const { items, total, receiptTemplate, selectedCustomer } = useCartStore()
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stores').select('*').single()
      if (error) throw error
      return data
    }
  })

  const tax = total * 0.1
  const grandTotal = total + tax
  const date = new Date().toLocaleString()

  const renderStandard = () => (
    <div className="bg-white p-8 text-slate-800 font-sans shadow-inner rounded-xl border">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tighter">{settings?.name || "Retail POS"}</h3>
        <p className="text-xs text-muted-foreground">{settings?.brand || "Flagship Store"}</p>
        <p className="text-xs text-muted-foreground">{settings?.address || "123 Business Avenue, Shopville, ST 12345"}</p>
      </div>

      <div className="space-y-1 text-xs mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transaction:</span>
          <span className="font-medium">{transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Customer:</span>
          <span className="font-medium">{selectedCustomer?.name || "Walk In"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cashier:</span>
          <span className="font-medium">Admin</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-bold">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
            </div>
            <span className="font-bold">${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4 border-dashed" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black pt-2 border-t">
          <span>GRAND TOTAL</span>
          <span className="text-primary">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-dashed text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest">Payment Method: {paymentMethod}</p>
        <p className="text-[10px] text-muted-foreground">Thank you for shopping with us!</p>
      </div>
    </div>
  )

  const renderThermal = () => (
    <div className="bg-[#f8f9fa] p-6 text-black font-mono text-xs w-full max-w-[300px] mx-auto shadow-inner rounded-sm border-x-8 border-y-4 border-white">
      <div className="text-center mb-4 leading-tight">
        <p className="font-bold text-sm">{(settings?.name || "RETAIL POS TERMINAL").toUpperCase()}</p>
        <p>{(settings?.brand || "STORE #001").toUpperCase()}</p>
        <p>SHOPVILLE, ST</p>
      </div>

      <p className="mb-2">----------------------------</p>
      
      <div className="space-y-0.5 mb-2">
        <p>DATE: {new Date().toLocaleDateString()}</p>
        <p>TIME: {new Date().toLocaleTimeString()}</p>
        <p>TXN : {transactionId.split('-').pop()}</p>
        <p>CUST: {selectedCustomer?.name.toUpperCase() || "WALK IN"}</p>
      </div>

      <p className="mb-2">----------------------------</p>

      <div className="space-y-2 mb-2">
        {items.map((item) => (
          <div key={item.id}>
            <p className="font-bold overflow-hidden whitespace-nowrap">{item.name.toUpperCase()}</p>
            <div className="flex justify-between">
              <span>{item.quantity} @ {item.price.toFixed(2)}</span>
              <span>{(item.quantity * item.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mb-2">----------------------------</p>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>TAX (10%)</span>
          <span>{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1">
          <span>TOTAL</span>
          <span>{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <p className="my-2">----------------------------</p>
      
      <div className="text-center space-y-1">
        <p>PAID BY {paymentMethod.toUpperCase()}</p>
        <p className="mt-4">*** THANK YOU ***</p>
        <p>PLEASE VISIT AGAIN</p>
      </div>
    </div>
  )

  const renderModern = () => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white rounded-3xl relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 blur-3xl -ml-16 -mb-16" />
      
      <div className="relative z-10 flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter text-primary">{(settings?.name || "RETAIL").toUpperCase()}.</h3>
          <p className="text-xs text-white/50 mt-1 font-medium">{settings?.brand || "Digital Receipt"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase text-white/40 tracking-widest">Date</p>
          <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Customer</p>
          <p className="text-sm font-bold">{selectedCustomer?.name || "Walk In"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Method</p>
          <p className="text-sm font-bold capitalize">{paymentMethod}</p>
        </div>
      </div>

      <div className="relative z-10 space-y-4 mb-10">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">
                {item.quantity}x
              </div>
              <p className="text-sm font-medium text-white/90">{item.name}</p>
            </div>
            <p className="text-sm font-black">${(item.quantity * item.price).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 bg-white/5 rounded-2xl p-6 space-y-3 backdrop-blur-md border border-white/10">
        <div className="flex justify-between text-xs text-white/50 font-medium">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-white/50 font-medium">
          <span>Sales Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-primary italic uppercase tracking-wider">Total Amount</span>
          <span className="text-3xl font-black tracking-tighter">${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      
      <p className="relative z-10 text-[10px] text-center text-white/30 font-black tracking-widest uppercase mt-8">
        Ref: {transactionId}
      </p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <div className="p-6 border-b bg-card flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-black">Receipt Preview</DialogTitle>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Style: {receiptTemplate}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onOpenChange(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-8 bg-muted/30 flex justify-center overflow-y-auto max-h-[70vh]">
          <div className="w-full h-fit animate-in zoom-in-95 duration-300">
            {receiptTemplate === 'standard' && renderStandard()}
            {receiptTemplate === 'thermal' && renderThermal()}
            {receiptTemplate === 'modern' && renderModern()}
          </div>
        </div>

        <div className="p-6 bg-card border-t flex gap-4">
          <Button 
            variant="ghost" 
            className="flex-1 h-12 rounded-xl font-bold"
            onClick={() => onOpenChange(false)}
          >
            Go Back
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-black flex gap-2 shadow-xl shadow-primary/20"
            onClick={() => {
              window.print()
              onOpenChange(false)
            }}
          >
            <Printer className="w-4 h-4" />
            Print Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
