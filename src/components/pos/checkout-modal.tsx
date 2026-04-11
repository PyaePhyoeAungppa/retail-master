"use client"

import { useState } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { useQueryClient } from "@tanstack/react-query"
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
import { CreditCard, Banknote, Smartphone, CheckCircle2, QrCode, Printer, Check, Loader2, Mail, Trash2, Share2, Percent } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { supabase } from "@/lib/supabase"
import { Transaction, TransactionItem, Store } from "@/lib/data"
import { useQuery } from "@tanstack/react-query"
import { ReceiptPreview } from "./receipt-preview"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const queryClient = useQueryClient()
  const { 
    total, 
    items, 
    clearCart, 
    selectedCustomer, 
    receiptTemplate, 
    setReceiptTemplate, 
    orderId, 
    setOrderId,
    includeTax,
    setIncludeTax
  } = useCartStore()
  const { currentUser, storeId, shiftId, terminalId } = useAuthStore()
  const { toast } = useToastStore()
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [sendEmail, setSendEmail] = useState(false)

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

  const handleCheckout = async () => {
    if (!paymentMethod) return
    if (!currentUser || !storeId) return
    
    setLoading(true)
    
    // Always new transaction ID for finalized sales
    const newTxId = `TX-${Date.now()}`
    setTransactionId(newTxId)

    const transaction = {
      id: newTxId,
      store_id: storeId,
      shift_id: shiftId, // LINK TRANSACTION DIRECTLY TO SHIFT
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id || null,
      customerName: selectedCustomer?.name || "Walk In",
      cashierId: currentUser.id,
      cashierName: currentUser.email || "Unknown Cashier",
      terminalId: terminalId || "TERM-01",
      itemsCount: items.length,
      subtotal: total,
      tax: tax,
      total: grandTotal,
      tax_included: includeTax,
      method: paymentMethod as any,
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
      // 1. Deduct Stock via Atomic RPC (includes stock check)
      const { error: rpcError } = await supabase.rpc('process_order_stock', { 
        order_items: transactionItems 
      })
      
      if (rpcError) throw new Error(rpcError.message)

      // 2. Process Checkout
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([transaction])
      
      if (txError) throw txError

      // 3. Save Transaction Items
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)
      
      if (itemsError) throw itemsError
      
      // 4. Update order status if this was a recalled order
      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', orderId)
      }

      toast({
        title: "Checkout Successful",
        description: sendEmail && selectedCustomer?.email 
          ? `Receipt sent to ${selectedCustomer.email}`
          : "Transaction completed successfully",
        variant: "success",
      })
      
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactionItems'] })
      setIsSuccess(true)
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
    setOrderId(null)
    setIsSuccess(false)
    setPaymentMethod(null)
    setSendEmail(false)
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
      <Dialog open={open} onOpenChange={(val) => !val && handleDone()}>
        <DialogContent className="sm:max-w-[425px] text-center p-0 rounded-[2rem] max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
               </div>
               <DialogTitle className="2xl font-black mb-2">Payment Successful!</DialogTitle>
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
                      <span className="text-xl font-black text-primary">{currency}{grandTotal.toFixed(2)}</span>
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
                  <Button 
                    className="w-full h-12 rounded-xl flex gap-2" 
                    variant="ghost"
                    onClick={() => {
                        const link = `${window.location.origin}/order-view/${transactionId}`
                        navigator.clipboard.writeText(link)
                        toast({ title: "Link Copied!", description: "Order link copied to clipboard.", variant: "success" })
                    }}
                  >
                      <Share2 className="w-4 h-4" />
                      Share Order Link
                  </Button>
                  <Button className="w-full h-12 rounded-xl" onClick={handleDone}>
                      Next Order
                  </Button>
               </div>
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
      <DialogContent className="sm:max-w-[800px] rounded-[2rem] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-8 pb-4 border-b">
          <DialogTitle className="text-2xl font-black">Finalize Payment</DialogTitle>
          <DialogDescription>
            Choose your payment method and receipt preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Payment Methods */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 gap-2 ${
                      paymentMethod === method.id 
                        ? 'border-primary bg-primary/5 shadow-inner' 
                        : 'border-muted bg-card hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${method.color}`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Templates & Options */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Receipt Style</p>
                <div className="grid grid-cols-3 gap-2">
                  {['standard', 'thermal', 'modern'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setReceiptTemplate(t as any)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2",
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

              {/* Email Receipt Toggle */}
              <div 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                  selectedCustomer?.email 
                    ? sendEmail 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/30"
                    : "opacity-50 grayscale border-muted cursor-not-allowed"
                )}
                onClick={() => selectedCustomer?.email && setSendEmail(!sendEmail)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    sendEmail ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Email Receipt</p>
                    <p className="text-[9px] text-muted-foreground font-medium truncate max-w-[120px]">
                      {selectedCustomer?.email ? selectedCustomer.email : "No email linked"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-10 h-5 rounded-full p-1 transition-colors",
                  sendEmail ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "w-3 h-3 rounded-full bg-white transition-transform",
                    sendEmail ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>

              {/* Tax Inclusion Toggle */}
              <div 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                  includeTax ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
                )}
                onClick={() => setIncludeTax(!includeTax)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    includeTax ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Calculate Tax ({taxRate * 100}%)</p>
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {includeTax ? "Tax is added to total" : "Tax is excluded"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-10 h-5 rounded-full p-1 transition-colors",
                  includeTax ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "w-3 h-3 rounded-full bg-white transition-transform",
                    includeTax ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>

              {/* Compact Summary */}
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Grand Total</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{items.length} Items</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black text-primary tracking-tighter">{currency}{grandTotal.toFixed(2)}</span>
                  <Badge variant="outline" className={cn("bg-white h-5 text-[9px]", includeTax ? "border-primary/20 text-primary" : "border-muted text-muted-foreground italic")}>
                    {includeTax ? "TAX INCL." : "TAX EXCL."}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-4 p-8 pt-4 border-t bg-card/50">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-4 h-12">
              Cancel
            </Button>
            <Button 
                variant="outline" 
                onClick={() => {
                   if (confirm("Void entire cart? This cannot be undone.")) {
                      handleDone()
                   }
                }} 
                disabled={loading || items.length === 0}
                className="rounded-xl px-4 h-12 text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Void
            </Button>
          </div>
          <Button 
            onClick={() => handleCheckout()} 
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
