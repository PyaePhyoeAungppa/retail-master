"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, Calendar, User, Loader2, Package, CheckCircle2, QrCode, CreditCard, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function OrderViewPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSold, setIsSold] = useState(false)
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // 1. Try to find the order or transaction to get the store_id
        let storeId = null
        let isFinalized = false

        // First check pending orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        
        if (orderData) {
          storeId = orderData.store_id
          const status = orderData.status?.toLowerCase()
          if (status !== 'pending') {
            isFinalized = true
          } else {
            setOrder(orderData)
          }
        } else {
          // If not in pending, check completed transactions
          const { data: txData } = await supabase
            .from('transactions')
            .select('store_id')
            .eq('id', id)
            .maybeSingle()
          
          if (txData) {
            storeId = txData.store_id
            isFinalized = true
          }
        }

        // 2. Fetch Store Details if we found a storeId
        if (storeId) {
          const { data: storeData } = await supabase
            .from('stores')
            .select('*')
            .eq('id', storeId)
            .single()
          setStore(storeData)

          if (isFinalized) {
            setIsSold(true)
            throw new Error("This order has been processed and and is no longer available for public viewing. Please contact the retailer for a final receipt.")
          }

          // 3. Fetch Items only if it's pending and we have the order
          if (orderData && !isFinalized) {
            const { data: itemsData } = await supabase
              .from('order_items')
              .select('*')
              .eq('orderId', id)
            setItems(itemsData || [])

            const { data: accountsData } = await supabase
              .from('store_payment_accounts')
              .select('*')
              .eq('store_id', storeId)
            setPaymentAccounts(accountsData || [])
          }
        } else {
          throw new Error("Order not found. Please verify the link or contact your retailer.")
        }

      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Verifying Digital Order...</p>
      </div>
    )
  }

  if (isSold || error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa] text-center">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/10">
          <Package className="w-10 h-10" />
        </div>
        <div className="flex flex-col items-center gap-1 mb-6">
           <h1 className="text-xl font-black text-black uppercase tracking-tight">{store?.name || "The Store"}</h1>
           {store?.address && <p className="text-[10px] text-muted-foreground font-medium">{store.address}</p>}
        </div>
        
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/10">
          <Package className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black mb-2 tracking-tight">
          {isSold ? "Order Finalized" : "Order Not Found"}
        </h1>
        <p className="text-muted-foreground max-w-xs mb-10 text-sm leading-relaxed">
          {error || "This order may have been processed or the link is invalid. Please contact the retailer for assistance."}
        </p>
        <div className="space-y-4 pt-10 border-t border-black/5 w-full">
           <img src="/logo.png" alt="Retail Master" className="h-6 mx-auto opacity-30 invert hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">Retail Master Digital Terminal</p>
        </div>
      </div>
    )
  }

  const currency = store?.currency ?? "$"

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex items-center justify-center p-4 sm:p-8 font-mono">
      {/* Centered Receipt Paper */}
      <Card className="w-full max-w-[450px] bg-white rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col border-none">
        {/* Decorative Top Edge */}
        <div className="h-2 bg-primary w-full" />
        
        <CardContent className="p-8 pt-10 text-center space-y-8">
          {/* Brand & Store Info */}
          <div className="space-y-2">
             <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-black text-black leading-none uppercase tracking-tight">{store?.name || "The Store"}</h1>
                {store?.brand && (
                  <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mt-1 italic">
                    {store.brand}
                  </p>
                )}
                {store?.address && (
                  <p className="text-[10px] text-muted-foreground max-w-[250px] mx-auto mt-2 leading-relaxed font-medium">
                    {store.address}
                  </p>
                )}
             </div>
             <div className="pt-4 flex justify-center">
                <p className="text-[10px] font-black uppercase bg-black text-white inline-block px-4 py-1.5 tracking-[0.1em]">
                  Digital Order Summary
                </p>
             </div>
          </div>

          <Separator className="border-dashed border-black/10" />

          {/* Table Header Style */}
          <div className="text-left space-y-1">
             <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                <span>Description</span>
                <span>Subtotal</span>
             </div>
             <div className="h-[2px] w-full bg-black/5" />
          </div>

          {/* Items List */}
          <div className="space-y-4 text-left">
             {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                   <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-black uppercase leading-tight">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {item.quantity} UNIT @ {currency}{item.price.toFixed(2)}
                      </p>
                   </div>
                   <span className="text-sm font-black tabular-nums">{currency}{item.subtotal.toFixed(2)}</span>
                </div>
             ))}
          </div>

          <Separator className="border-dashed border-black/10" />

          {/* Vertical Order Calculation */}
          <div className="space-y-3 text-[12px]">
             <div className="flex justify-between items-center font-bold">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span className="tabular-nums">{currency}{(order.subtotal || order.total).toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-muted-foreground">
                <span className="uppercase tracking-wider">Discount ({currency})</span>
                <span className="tabular-nums">- {currency}0.00</span>
             </div>
             <div className="flex justify-between items-center text-muted-foreground">
                <span className="uppercase tracking-wider">Sales Tax ({currency})</span>
                <span className="tabular-nums">+ {currency}{order.tax?.toFixed(2) || "0.00"}</span>
             </div>
             
             <div className="flex flex-col gap-2 pt-4">
                <div className="h-[1px] w-full bg-black/10" />
                <div className="flex justify-between items-center">
                   <span className="text-lg font-black uppercase">Grand Total</span>
                   <span className="text-2xl font-black text-primary tracking-tighter tabular-nums">{currency}{order.total.toFixed(2)}</span>
                </div>
                <div className="h-[1px] w-full bg-black/10" />
             </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 text-left border-t border-black/5">
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Cashier / Staff</p>
                <p className="text-xs font-bold truncate">{order.cashierName}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Customer</p>
                <p className="text-xs font-bold truncate">{order.customerName}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Date / Time</p>
                <p className="text-xs font-bold">{new Date(order.created_at || order.date).toLocaleDateString()}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Order Ref</p>
                <p className="text-xs font-bold uppercase">{order.id.slice(-8)}</p>
             </div>
          </div>

          {!isSold && paymentAccounts.length > 0 && (
            <div className="space-y-4 pt-6 mt-6 border-t border-black/5">
               <div className="flex items-center gap-2">
                  <div className="h-[1px] flex-1 bg-black/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payment Instructions</span>
                  <div className="h-[1px] flex-1 bg-black/10" />
               </div>
               <div className="space-y-3">
                  {paymentAccounts.map((acc) => (
                    <div key={acc.id} className="bg-muted/30 p-4 rounded-2xl border border-dashed border-black/10 flex items-center justify-between group">
                       <div className="text-left space-y-0.5">
                          <p className="text-[10px] font-black uppercase text-primary leading-tight">{acc.payment_name}</p>
                          <p className="text-sm font-black text-black tabular-nums">{acc.account_number}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[150px]">{acc.account_name}</p>
                       </div>
                       <button 
                         onClick={() => {
                            navigator.clipboard.writeText(acc.account_number)
                            setCopiedId(acc.id)
                            setTimeout(() => setCopiedId(null), 2000)
                         }}
                         className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm transition-all active:scale-95 ${
                            copiedId === acc.id 
                            ? "bg-green-500 text-white border-green-600" 
                            : "bg-white hover:bg-primary hover:text-white"
                         }`}
                         title="Copy Account Number"
                       >
                          {copiedId === acc.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                       </button>
                    </div>
                  ))}
               </div>
               <p className="text-[9px] text-muted-foreground italic max-w-[280px] mx-auto leading-relaxed">
                 Please send the exact total amount and provide proof of payment to the store.
               </p>
            </div>
          )}

          <div className="pt-6 flex flex-col items-center gap-4">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-black uppercase leading-relaxed tracking-widest italic">
                  Thank You For Shopping With Us!
                </p>
                <p className="text-[9px] text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                   This is a self-expiring digital document generated by Retail Master Terminal.
                </p>
             </div>
          </div>
        </CardContent>

        {/* Decorative Bottom Edge */}
        <div className="h-6 flex items-center justify-center bg-muted/5 gap-1">
           {[...Array(20)].map((_, i) => (
             <div key={i} className="w-4 h-4 rounded-full bg-[#f1f3f5] -mt-6" />
           ))}
        </div>
      </Card>
    </div>
  )
}
