"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/store/use-language-store"
import { translations } from "@/lib/translations"
import { CheckCircle2, Package, AlertTriangle, Download, Filter, Copy, Check, Search, TrendingUp, DollarSign, Users, Layers, ChevronRight, ShoppingBag, Plus, Minus, CreditCard, Share2, ReceiptText, User, Save, Trash2, Send, Phone, MessageSquare, ListTodo } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"

// ─────────────────────────────────────────────
// Shared reveal hook
// ─────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ─────────────────────────────────────────────
// MOCKUP 1: Product Inventory Page (mirrors /products)
// ─────────────────────────────────────────────
function ProductsPageMockup() {
  const products = [
    { name: "Silk Midi Dress",   category: "Clothing",    stock: 3,  price: 890,  status: "low" },
    { name: "Denim Jacket",      category: "Clothing",    stock: 24, price: 1200, status: "ok" },
    { name: "Linen Co-ord Set",  category: "Sets",        stock: 0,  price: 650,  status: "out" },
    { name: "Pearl Earring Set", category: "Accessories", stock: 18, price: 280,  status: "ok" },
    { name: "Satin Slip Skirt",  category: "Clothing",    stock: 7,  price: 520,  status: "low" },
  ]
  return (
    <div className="w-full rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden text-left">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400/60" /><div className="w-2 h-2 rounded-full bg-amber-400/60" /><div className="w-2 h-2 rounded-full bg-emerald-400/60" /></div>
        <div className="flex-1 flex justify-center"><div className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-0.5 rounded-md">retailmaster.store/products</div></div>
      </div>

      {/* Page header — matches real app */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <h2 className="text-sm font-black tracking-tight">Product Inventory</h2>
          <p className="text-[9px] text-slate-400 font-medium">Manage your store products and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-[9px] font-black border-2 border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-2.5 h-2.5" /> Export
          </button>
          <button className="flex items-center gap-1 text-[9px] font-black bg-primary text-white px-2.5 py-1.5 rounded-lg">
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats strip — matches real app */}
      <div className="mx-4 mb-3 flex items-center justify-between bg-slate-50/80 border border-dashed border-slate-200 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-6 text-[9px]">
          <div><p className="text-slate-400 font-medium">Total Products</p><p className="text-base font-bold">38</p></div>
          <div className="w-px h-6 bg-slate-200" />
          <div><p className="text-slate-400 font-medium">Low Stock</p><p className="text-base font-bold text-red-500">4</p></div>
          <div className="w-px h-6 bg-slate-200" />
          <div><p className="text-slate-400 font-medium">Out of Stock</p><p className="text-base font-bold">1</p></div>
        </div>
        <button className="flex items-center gap-1 text-[9px] font-black border border-slate-200 px-2 py-1 rounded-lg bg-white">
          <Filter className="w-2.5 h-2.5" /> Filters
        </button>
      </div>

      {/* Product table — matches real app's ProductTable */}
      <div className="mx-4 mb-4 rounded-xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_60px_70px] bg-slate-50 border-b border-slate-100 px-3 py-2 gap-2">
          {["Product", "Category", "Stock", "Price"].map(h => (
            <p key={h} className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</p>
          ))}
        </div>
        {products.map((p, i) => (
          <div key={i} className={cn("grid grid-cols-[1fr_80px_60px_70px] px-3 py-2.5 gap-2 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors")}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Package className="w-3 h-3 text-primary" /></div>
              <p className="text-[10px] font-black text-slate-800 truncate">{p.name}</p>
            </div>
            <p className="text-[9px] text-slate-500 font-medium truncate">{p.category}</p>
            <div>
              <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-full",
                p.status === "low" ? "bg-amber-50 text-amber-700" : p.status === "out" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
              )}>
                {p.stock === 0 ? "Out" : `${p.stock} left`}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-800">฿{p.price.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MOCKUP 2: Social Commerce Flow — 4 steps
// ─────────────────────────────────────────────
function SocialCommerceFlow() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { label: "Build Cart", icon: ShoppingBag },
    { label: "Share Link", icon: Share2 },
    { label: "Send in DM", icon: MessageSquare },
    { label: "Customer Pays", icon: ReceiptText },
  ]

  return (
    <div className="w-full space-y-4 text-left">
      {/* Step tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border",
              activeStep === i
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white text-slate-500 border-slate-200 hover:border-primary/30"
            )}
          >
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {/* Step connector */}
      <div className="flex items-center gap-1 px-1">
        {steps.map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={cn("h-1 rounded-full flex-1 transition-all duration-500", i <= activeStep ? "bg-primary" : "bg-slate-100")} />
          </div>
        ))}
      </div>

      {/* Step 0: POS Cart with Share Link button */}
      {activeStep === 0 && (
          <div className="flex divide-x divide-slate-100 h-80 sm:h-[480px]">
            {/* Products area */}
            <div className="flex-1 bg-slate-50/50 flex flex-col overflow-hidden">
               {/* Categories - matches real app */}
               <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-100">
                  <div className="px-2.5 py-1 bg-white shadow-sm border border-primary/20 text-primary text-[7px] font-black rounded-md flex-none">All Products</div>
                  <div className="px-2.5 py-1 text-slate-400 text-[7px] font-bold rounded-md flex-none">Apparel</div>
                  <div className="px-2.5 py-1 text-slate-400 text-[7px] font-bold rounded-md flex-none">Accessories</div>
               </div>

               <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Products</p>
                  <Search className="w-3 h-3 text-slate-300" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { name: "Silk Midi Dress", price: "890", active: true, color: "bg-indigo-50", icon: ShoppingBag },
                    { name: "Pearl Earrings",   price: "280", active: false, color: "bg-amber-50", icon: Layers },
                    { name: "Linen Set",        price: "650", active: false, color: "bg-emerald-50", icon: Package },
                    { name: "Denim Jacket",     price: "1,200", active: false, color: "bg-blue-50", icon: ShoppingBag },
                    { name: "Gold Necklace",    price: "450", active: false, color: "bg-yellow-50", icon: Layers },
                    { name: "Leather Boots",    price: "2,400", active: false, color: "bg-orange-50", icon: Package },
                    { name: "Wool Scarf",       price: "320", active: false, color: "bg-rose-50", icon: ShoppingBag },
                    { name: "Cotton Tee",       price: "180", active: false, color: "bg-slate-50", icon: Layers },
                    { name: "Silk Scarf",       price: "550", active: false, color: "bg-violet-50", icon: Layers },
                    { name: "Pearl Ring",       price: "720", active: false, color: "bg-cyan-50", icon: Package },
                    { name: "Canvas Bag",       price: "340", active: false, color: "bg-lime-50", icon: ShoppingBag },
                    { name: "Summer Hat",       price: "290", active: false, color: "bg-orange-50", icon: Layers },
                  ].map((p, i) => (
                    <div key={i} className={cn("rounded-xl p-1.5 border transition-all flex flex-col h-full", p.active ? "bg-white border-primary shadow-sm" : "bg-white border-slate-100 shadow-sm")}>
                      <div className={cn("w-full aspect-[16/10] rounded-lg mb-1 flex items-center justify-center relative overflow-hidden", p.color)}>
                        <p.icon className={cn("w-3 h-3", p.active ? "text-primary" : "text-slate-200")} />
                        {p.active && (
                          <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center text-white text-[6px] font-black">
                             1
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[6px] text-primary/70 font-bold uppercase tracking-widest mb-0.5">Apparel</p>
                        <p className="text-[7px] font-black truncate leading-tight text-slate-700">{p.name}</p>
                      </div>
                      <div className="mt-1 flex items-center justify-between pt-1 border-t border-slate-50">
                        <p className="text-[8px] font-black tracking-tighter">฿{p.price}</p>
                        <div className="flex items-center gap-1">
                           <div className="w-3 h-3 bg-primary rounded-md flex items-center justify-center text-white"><Plus className="w-2 h-2" /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart sidebar mockup */}
            <div className="w-44 bg-white flex flex-col overflow-hidden">
              {/* Cart Header - matches real app */}
              <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="w-2.5 h-2.5" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[7px] font-black uppercase text-slate-400">Customer</p>
                   <p className="text-[8px] font-bold truncate">Nini K.</p>
                </div>
                <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                  <ListTodo className="w-2.5 h-2.5" />
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {[
                  { name: "Silk Midi Dress", qty: 1, price: "฿890" },
                  { name: "Pearl Earrings",  qty: 2, price: "฿560" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 group">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 shrink-0">
                       <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-[8px] font-black truncate pr-1">{item.name}</p>
                        <Trash2 className="w-2.5 h-2.5 text-slate-200" />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center bg-slate-50 rounded-md p-0.5 border border-slate-100 scale-90 -ml-1">
                          <Minus className="w-2 h-2 text-slate-300" />
                          <span className="text-[8px] font-black w-2.5 text-center">{item.qty}</span>
                          <Plus className="w-2 h-2 text-primary" />
                        </div>
                        <span className="text-[8px] font-black text-primary">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Totals */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
                <div className="space-y-1 text-[8px] font-medium text-slate-500">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-700">฿1,450.00</span></div>
                  <div className="flex justify-between">
                    <span>Tax (7%)</span>
                    <span className="text-primary font-black">฿101.50</span>
                  </div>
                </div>
                <div className="flex justify-between items-end pt-1.5 border-t border-slate-200">
                  <span className="text-[9px] font-black uppercase tracking-tight">Total</span>
                  <span className="text-xs font-black text-primary">฿1,551.50</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button className="py-1.5 bg-white border border-slate-200 rounded-lg text-[7px] font-black flex items-center justify-center gap-1 shadow-sm">
                    <Save className="w-2.5 h-2.5" /> Save
                  </button>
                  <button className="py-1.5 bg-primary text-white rounded-lg text-[7px] font-black flex items-center justify-center gap-1 shadow-lg shadow-primary/20">
                    <CreditCard className="w-2.5 h-2.5" /> Pay
                  </button>
                </div>
                <button className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[8px] font-black flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-all">
                  <Share2 className="w-3 h-3" /> Share Order Link
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Step 1: Share link modal */}
      {activeStep === 1 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50">
            <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-400/60" /><div className="w-2 h-2 rounded-full bg-amber-400/60" /><div className="w-2 h-2 rounded-full bg-emerald-400/60" /></div>
            <div className="flex-1 flex justify-center"><p className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">Share Order Link</p></div>
          </div>
          <div className="p-5 space-y-4">
            {/* Order summary */}
            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-700">Order #TX-2847</p>
                <p className="text-[8px] text-slate-400 font-medium">2 items · Nini K.</p>
              </div>
              <p className="text-sm font-black text-primary">฿1,551</p>
            </div>

            {/* Customer name field */}
            <div className="space-y-1">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Customer Name</p>
              <div className="flex items-center h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600">
                Nini K.
              </div>
            </div>

            {/* Generated link */}
            <div className="space-y-1">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Shareable Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-9 px-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center text-[9px] font-bold text-primary truncate">
                  retailmaster.store/order/tx-2847
                </div>
                <button className="h-9 px-3 bg-primary text-white rounded-xl text-[8px] font-black">Copy</button>
              </div>
              <p className="text-[8px] text-slate-400">Expires in 24 hours · Secure & read-only</p>
            </div>

            {/* Share buttons */}
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Share via</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Messenger", icon: MessageSquare, bg: "bg-blue-50 border-blue-100 text-blue-700" },
                { label: "WhatsApp",  icon: Phone, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                { label: "Copy Link", icon: Copy, bg: "bg-slate-50 border-slate-200 text-slate-600" },
              ].map(({ label, icon: Icon, bg }) => (
                <button key={label} className={cn("py-2.5 rounded-xl border text-[9px] font-black flex flex-col items-center gap-1 transition-all hover:scale-[1.02]", bg)}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Messenger DM view */}
      {activeStep === 2 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden">
          {/* Messenger-like header */}
          <div className="bg-[#0084ff] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">N</div>
            <div>
              <p className="text-[10px] font-black text-white">Nini K.</p>
              <p className="text-[8px] text-blue-100">Active now</p>
            </div>
          </div>

          {/* Chat bubbles */}
          <div className="p-4 bg-slate-50 space-y-3">
            {/* Seller message */}
            <div className="flex justify-end">
              <div className="max-w-[75%] space-y-1.5">
                <div className="bg-[#0084ff] text-white rounded-2xl rounded-tr-sm px-3 py-2">
                  <p className="text-[10px] font-medium">Hi Nini! Here's your order summary.</p>
                </div>
                {/* Link card — how Messenger renders links */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="h-1.5 bg-primary w-full" />
                  <div className="p-2.5">
                    <p className="text-[8px] font-black uppercase text-primary tracking-widest mb-0.5">Mon Boutique</p>
                    <p className="text-[10px] font-black">Order #TX-2847 · ฿1,551.50</p>
                    <p className="text-[8px] text-slate-400">Silk Midi Dress + Pearl Earrings</p>
                    <div className="mt-2 text-[8px] font-black text-[#0084ff] flex items-center gap-1">
                      retailmaster.store/order/tx-2847
                    </div>
                  </div>
                </div>
                <p className="text-[8px] text-slate-400 text-right">2:14 PM · Delivered</p>
              </div>
            </div>

            {/* Customer reply */}
            <div className="flex justify-start">
              <div className="max-w-[60%]">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                  <p className="text-[10px] font-medium text-slate-700">Okay! Transferring now.</p>
                </div>
                <p className="text-[8px] text-slate-400 mt-1">2:16 PM · Seen</p>
              </div>
            </div>

            {/* Seller confirms */}
            <div className="flex justify-end">
              <div className="max-w-[70%]">
                <div className="bg-[#0084ff] text-white rounded-2xl rounded-tr-sm px-3 py-2">
                  <p className="text-[10px] font-medium">Received! Order confirmed. Thank you!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message input */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2">
            <div className="flex-1 h-8 bg-slate-100 rounded-full px-3 flex items-center text-[9px] text-slate-400">
              Message...
            </div>
            <button className="w-7 h-7 bg-[#0084ff] rounded-full flex items-center justify-center text-white text-[10px]">→</button>
          </div>
        </div>
      )}

      {/* Step 3: Customer receipt page */}
      {activeStep === 3 && (
        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50">
            <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-400/60" /><div className="w-2 h-2 rounded-full bg-amber-400/60" /><div className="w-2 h-2 rounded-full bg-emerald-400/60" /></div>
            <div className="flex-1 flex justify-center"><p className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">retailmaster.store/order/tx-2847</p></div>
          </div>
          <div className="bg-[#f1f3f5] p-4">
            <div className="bg-white max-w-xs mx-auto shadow-lg" style={{ fontFamily: "monospace" }}>
              <div className="h-1.5 bg-primary" />
              <div className="p-4 text-center space-y-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Mon Boutique</p>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-widest italic">Premium Fashion Online</p>
                  <div className="mt-2 inline-block bg-black text-white text-[7px] font-black px-2 py-0.5 tracking-widest uppercase">Digital Order Summary</div>
                </div>
                <div className="border-t border-dashed border-slate-200" />
                <div className="text-left space-y-1.5 text-[9px]">
                  <div className="flex justify-between"><span className="font-black uppercase">SILK MIDI DRESS</span><span className="font-black">฿890</span></div>
                  <div className="flex justify-between text-slate-400"><span>1 unit @ ฿890</span></div>
                  <div className="flex justify-between"><span className="font-black uppercase">PEARL EARRING SET</span><span className="font-black">฿560</span></div>
                  <div className="flex justify-between text-slate-400"><span>2 units @ ฿280</span></div>
                </div>
                <div className="border-t border-dashed border-slate-200" />
                <div className="text-[9px] space-y-1">
                  <div className="flex justify-between"><span className="font-bold">Subtotal</span><span>฿1,450</span></div>
                  <div className="flex justify-between text-slate-400"><span>Tax (7%)</span><span>฿101.50</span></div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                    <span className="text-sm font-black uppercase">Grand Total</span>
                    <span className="text-base font-black text-primary">฿1,551.50</span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 text-center">Payment Instructions</p>
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[7px] font-black uppercase text-primary">Bank Transfer</p>
                      <p className="text-[10px] font-black">ACC-****-3456</p>
                      <p className="text-[7px] text-slate-400">MON BOUTIQUE</p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest italic text-slate-600">Thank You For Shopping!</p>
              </div>
              <div className="h-4 flex items-center justify-center bg-slate-50 gap-0.5">
                {[...Array(16)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-[#f1f3f5] -mt-4" />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MOCKUP 3: Report Center (mirrors /reports)
// ─────────────────────────────────────────────
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e']

const topItems = [
  { name: "Silk Midi Dress",  qty: 42, rev: 37380 },
  { name: "Linen Co-ord Set", qty: 28, rev: 18200 },
  { name: "Denim Jacket",     qty: 19, rev: 22800 },
  { name: "Pearl Earrings",   qty: 61, rev: 17080 },
]
const categoryData = [
  { name: "Clothing",     rev: 78380 },
  { name: "Accessories",  rev: 24160 },
  { name: "Sets",         rev: 18200 },
  { name: "Footwear",     rev: 9200 },
]
const barData = [
  { name: "Mon", total: 4200 }, { name: "Tue", total: 8600 },
  { name: "Wed", total: 5100 }, { name: "Thu", total: 9400 },
  { name: "Fri", total: 7600 }, { name: "Sat", total: 11200 },
  { name: "Sun", total: 8900 },
]

function ReportCenterMockup() {
  const [activeReport, setActiveReport] = useState<'gallery' | 'summary'>('gallery')

  if (activeReport === 'gallery') {
    return (
      <div className="w-full rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden text-left">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400/60" /><div className="w-2 h-2 rounded-full bg-amber-400/60" /><div className="w-2 h-2 rounded-full bg-emerald-400/60" /></div>
          <div className="flex-1 flex justify-center"><div className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-0.5 rounded-md">retailmaster.store/reports</div></div>
        </div>
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-sm font-black tracking-tight">Report Center</h2>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Select an intelligence module to continue</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          {[
            { id: 'summary', title: 'Sale Summary', desc: 'Aggregated revenue and metrics', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
            { id: 'details', title: 'Sale Details',  desc: 'Itemized transaction lists', icon: Search, color: 'text-purple-500', bg: 'bg-purple-50' },
            { id: 'top-items', title: 'Top Sale Items', desc: 'Best performing products', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { id: 'top-categories', title: 'Category Report', desc: 'Revenue by category', icon: Layers, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => r.id === 'summary' && setActiveReport('summary')}
              className="group text-left p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all bg-white"
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", r.bg, r.color)}>
                <r.icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black tracking-tight">{r.title}</p>
              <p className="text-[8px] text-slate-400 font-medium leading-tight mt-0.5">{r.desc}</p>
              <div className="flex items-center gap-1 text-[8px] font-black text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Launch <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Summary view
  return (
    <div className="w-full rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden text-left">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400/60" /><div className="w-2 h-2 rounded-full bg-amber-400/60" /><div className="w-2 h-2 rounded-full bg-emerald-400/60" /></div>
        <div className="flex-1 flex justify-center"><div className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-0.5 rounded-md">retailmaster.store/reports/summary</div></div>
      </div>
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <button onClick={() => setActiveReport('gallery')} className="text-[8px] font-black text-slate-400 hover:text-primary mb-1">← Return to Center</button>
          <h2 className="text-sm font-black tracking-tight">Sale Summary</h2>
        </div>
        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[8px] font-black">
          {["7d", "30d", "All"].map((r, i) => (
            <span key={r} className={cn("px-2 py-1 rounded-md", i === 0 ? "bg-white shadow-sm text-primary" : "text-slate-400")}>{r}</span>
          ))}
        </div>
      </div>

      {/* KPI Cards — matches real app's report summary cards */}
      <div className="grid grid-cols-4 gap-2 px-4 pb-3">
        {[
          { label: "Grand Total", val: "฿130K", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Net Sales",   val: "฿122K", icon: TrendingUp, color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Avg Order",   val: "฿610",  icon: Users,      color: "text-purple-600",  bg: "bg-purple-50" },
          { label: "Units Sold",  val: "214",    icon: Package,    color: "text-pink-600",    bg: "bg-pink-50" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className={cn("rounded-xl p-2.5 text-center", bg)}>
            <Icon className={cn("w-3 h-3 mx-auto mb-1", color)} />
            <p className={cn("text-xs font-black tracking-tight", color)}>{val}</p>
            <p className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Insight cards — dark bg like real app */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        <div className="bg-slate-900 text-white rounded-xl p-3">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Customer</p>
          <p className="text-[10px] font-black">Nini K.</p>
          <p className="text-[8px] text-primary font-bold">฿14,200 Value</p>
        </div>
        <div className="bg-indigo-600 text-white rounded-xl p-3">
          <p className="text-[7px] font-black text-indigo-200 uppercase tracking-widest mb-1">Peak Hour</p>
          <p className="text-[10px] font-black">2 PM</p>
          <p className="text-[8px] text-indigo-100 font-bold">18 Avg Transactions</p>
        </div>
        <div className="bg-emerald-600 text-white rounded-xl p-3">
          <p className="text-[7px] font-black text-emerald-100 uppercase tracking-widest mb-1">Hero Product</p>
          <p className="text-[10px] font-black truncate">Silk Midi Dress</p>
          <p className="text-[8px] text-emerald-100 font-bold">42 Units Sold</p>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="px-4 pb-4">
        <p className="text-[8px] font-black text-slate-700 mb-2">Daily Performance</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 7, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 7, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 9 }} formatter={(v: any) => [`฿${Number(v).toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="total" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Feature row wrapper with reveal animation
// ─────────────────────────────────────────────
interface FeatureRowProps {
  badge: string; title: string; subtitle: string
  description: string; features: string[]
  mockup: React.ReactNode; reverse?: boolean; fullWidth?: boolean
}

function FeatureRow({ badge, title, subtitle, description, features, mockup, reverse, fullWidth }: FeatureRowProps) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-10 py-16 lg:py-24 transition-all duration-700",
        !fullWidth && "lg:flex-row lg:items-center lg:gap-20",
        reverse && "lg:flex-row-reverse",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
    >
      <div className={cn("space-y-6", fullWidth ? "text-center max-w-5xl mx-auto w-full" : "flex-1 max-w-lg")}>
        <div className={cn(fullWidth && "mb-12 space-y-4")}>
          <span className="inline-block text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            {badge}
          </span>
          <h3 className={cn("font-black tracking-tight leading-[1.1]", fullWidth ? "text-4xl lg:text-5xl" : "text-3xl sm:text-4xl")}>
            {title}
            <span className="block text-primary/50 mt-1">{subtitle}</span>
          </h3>
        </div>

        {fullWidth && (
          <div className="w-full mb-16 relative">
             <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 rounded-[3rem] blur-3xl opacity-50" />
             <div className="relative">{mockup}</div>
          </div>
        )}

        <div className={cn("space-y-6", fullWidth && "text-center")}>
           <p className={cn("text-base lg:text-lg text-muted-foreground font-medium leading-relaxed mx-auto", fullWidth && "max-w-2xl")}>
            {description}
          </p>
          <ul className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", fullWidth ? "max-w-2xl mx-auto" : "")}>
            {features.map((f, i) => (
              <li key={i} className={cn("flex items-start gap-2.5 text-sm font-semibold", fullWidth && "justify-center")}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!fullWidth && (
        <div className="flex-1 w-full">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-primary/8 via-transparent to-violet-500/8 rounded-3xl blur-2xl" />
            <div className="relative">{mockup}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Exported Component
// ─────────────────────────────────────────────
export function LandingShowcase() {
  const { language } = useLanguageStore()
  const t = translations[language].showcase

  return (
    <div className="divide-y divide-slate-100">
      <FeatureRow
        badge={t.inventory_badge}
        title={t.inventory_title}
        subtitle={t.inventory_subtitle}
        description={t.inventory_description}
        features={t.inventory_points}
        mockup={<ProductsPageMockup />}
      />
      <FeatureRow
        badge={t.social_badge}
        title={t.social_title}
        subtitle={t.social_subtitle}
        description={t.social_description}
        features={t.social_points}
        mockup={<SocialCommerceFlow />}
        fullWidth
      />
      <FeatureRow
        badge={t.reports_badge}
        title={t.reports_title}
        subtitle={t.reports_subtitle}
        description={t.reports_description}
        features={t.reports_points}
        mockup={<ReportCenterMockup />}
      />
    </div>
  )
}
