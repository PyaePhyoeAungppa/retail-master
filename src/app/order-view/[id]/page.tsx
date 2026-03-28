"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, Calendar, User, Loader2, Package, CheckCircle2, QrCode } from "lucide-react"
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // 1. ONLY fetch from orders (pending)
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        
        if (orderErr) throw orderErr

        // If no data is found, it's either an invalid ID or RLS is blocking public access
        if (!orderData) {
          throw new Error("Order not found. If this is a pending order, please check that your Supabase 'orders' table has a public Read policy.")
        }

        // Case-insensitive status check
        const status = orderData.status?.toLowerCase()
        if (status !== 'pending') {
          setIsSold(true)
          throw new Error("This order link has expired or the order has already been processed.")
        }

        setOrder(orderData)

        // 2. Fetch Items
        const { data: itemsData, error: itemsErr } = await supabase
          .from('order_items')
          .select('*')
          .eq('orderId', id)
        
        if (itemsErr) throw itemsErr
        setItems(itemsData || [])

        // 3. Fetch Store Details
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('id', orderData.store_id)
          .single()
        
        setStore(storeData)

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
        <h1 className="text-2xl font-black mb-2 tracking-tight">
          {isSold ? "Order Finalized" : "Order Not Found"}
        </h1>
        <p className="text-muted-foreground max-w-xs mb-10 text-sm leading-relaxed">
          {error || "This order may have been processed or the link is invalid. Please contact the retailer for assistance."}
        </p>
        <div className="space-y-4">
           <img src="/logo.png" alt="Retail Master" className="h-6 mx-auto opacity-30 invert hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Retail Master Digital Terminal</p>
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
          <div className="space-y-3">
             <div className="flex flex-col items-center gap-1">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary mb-2">Retail Master</h3>
                <h1 className="text-2xl font-black text-black leading-none">{store?.name || "The Store"}</h1>
                {store?.address && <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-2 leading-relaxed">{store.address}</p>}
             </div>
             <p className="text-[10px] font-black uppercase bg-primary text-primary-foreground inline-block px-3 py-1 mt-2">Digital Order</p>
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

          <div className="pt-10 flex flex-col items-center gap-6">
             <div className="flex flex-col items-center opacity-30 grayscale saturate-0">
                <QrCode className="w-16 h-16 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-[0.2em]">Verify Order Original</p>
             </div>
             
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
