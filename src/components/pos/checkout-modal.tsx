"use client"

import { useState } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Banknote, Smartphone, CheckCircle2, QrCode, Printer, Check, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { supabase } from "@/lib/supabase"
import { Transaction, TransactionItem } from "@/lib/data"
import { ReceiptPreview } from "./receipt-preview"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { total, items, clearCart, selectedCustomer, receiptTemplate, setReceiptTemplate } = useCartStore()
  const { currentUser, storeId } = useAuthStore()
  const { toast } = useToastStore()
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false)
  const [transactionId, setTransactionId] = useState("")

  const tax = total * 0.1
  const grandTotal = total + tax

  const handleCheckout = async () => {
    if (!paymentMethod || !currentUser || !storeId) return
    setLoading(true)
    
    const newTxId = `TX-${Date.now()}`
    setTransactionId(newTxId)

    const transaction = {
      id: newTxId,
      store_id: storeId,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id || null, // Allow null for walk-in if column is nullable
      customerName: selectedCustomer?.name || "Walk In",
      cashierId: currentUser.id,
      cashierName: currentUser.email || "Unknown Cashier",
      terminalId: "TERM-01",
      itemsCount: items.length,
      total: grandTotal,
      method: paymentMethod,
      status: 'completed'
    }

    const transactionItems = items.map(item => ({
      transactionId: newTxId,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    try {
      // 1. Save Transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
      
      if (txError) throw txError

      // 2. Save Transaction Items
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)
      
      if (itemsError) throw itemsError

      // 3. Update Product Stock (Optional but recommended)
      // We could use an RPC or just individual updates here
      // For now, let's stick to the persistence and verify the flow

      setIsSuccess(true)
      toast({
        title: "Checkout Successful",
        description: `Transaction ${newTxId} has been completed.`,
        variant: "success"
      })
    } catch (error: any) {
      console.error("Checkout failed:", error)
      toast({
        title: "Checkout Failed",
        description: error.message || "Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    clearCart()
    setIsSuccess(false)
    setPaymentMethod(null)
    onOpenChange(false)
  }

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'text-green-600 bg-green-50' },
    { id: 'card', name: 'Card', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
    { id: 'qr', name: 'QR Pay', icon: QrCode, color: 'text-purple-600 bg-purple-50' },
    { id: 'nfc', name: 'NFC', icon: Smartphone, color: 'text-orange-600 bg-orange-50' },
  ]

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] text-center p-12 rounded-[2rem]">
          <div className="flex flex-col items-center">
             <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
             </div>
             <DialogTitle className="text-2xl font-black mb-2">Payment Successful!</DialogTitle>
             <DialogDescription className="text-base mb-8">
               Transaction {transactionId} has been completed successfully.
             </DialogDescription>
             
             <div className="w-full bg-muted/30 rounded-2xl p-6 mb-8 text-left space-y-3 border border-dashed border-muted-foreground/30">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Items Count</span>
                    <span className="font-bold">{items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Payment Method</span>
                    <Badge variant="outline" className="capitalize bg-white">{paymentMethod}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="font-bold">Total Paid</span>
                    <span className="text-xl font-black text-primary">${grandTotal.toFixed(2)}</span>
                </div>
             </div>

             <div className="flex flex-col gap-3 w-full">
                <Button 
                  className="w-full h-12 rounded-xl flex gap-2" 
                  variant="outline"
                  onClick={() => setReceiptPreviewOpen(true)}
                >
                    <Printer className="w-4 h-4" />
                    Print Receipt
                </Button>
                <Button className="w-full h-12 rounded-xl" onClick={handleDone}>
                    Next Order
                </Button>
             </div>
          </div>
          <ReceiptPreview 
            open={receiptPreviewOpen} 
            onOpenChange={setReceiptPreviewOpen}
            transactionId={transactionId}
            paymentMethod={paymentMethod || "Cash"}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Finalize Payment</DialogTitle>
          <DialogDescription>
            Select a payment method to complete the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 gap-3 ${
                  paymentMethod === method.id 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-muted bg-card hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <div className={`p-3 rounded-xl ${method.color}`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <span className="font-bold">{method.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Receipt Template</p>
            <div className="grid grid-cols-3 gap-2">
              {['standard', 'thermal', 'modern'].map((t) => (
                <button
                  key={t}
                  onClick={() => setReceiptTemplate(t as any)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2",
                    receiptTemplate === t 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {t}
                  {receiptTemplate === t && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Summary</span>
                <span className="font-bold">{items.length} Products</span>
            </div>
            <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total to Pay</span>
                <span className="text-3xl font-black text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-4 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-8 h-12">
            Cancel
          </Button>
          <Button 
            onClick={handleCheckout} 
            disabled={!paymentMethod || loading}
            className="flex-1 rounded-xl h-12 text-base font-bold shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Processing..." : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
