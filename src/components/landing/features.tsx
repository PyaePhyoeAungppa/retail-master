"use client"

import {
  Zap, Package, Users2, BarChart3, FileText, UserCog,
  History, Share2, ClipboardCheck, Layers, Coins, Settings2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
  { title: "Smart Stock Management",         description: "Track inventory variations precisely, or toggle 'Track Stock' off for made-to-order items and dropshipping products.", icon: Package,          color: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
  { title: "Order & Cart Management",        description: "Draft orders, save pending carts, and add custom discounts or shipping fees before finalizing the sale.",                          icon: Zap,           color: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
  { title: "Digital Receipt Sharing",        description: "Generate self-expiring web links, high-res images, or PDF receipts. Share instantly via WhatsApp, Messenger, or Email.",         icon: Share2,        color: "bg-green-500",   text: "text-green-600",   bg: "bg-green-50",   border: "border-green-100" },
  { title: "Payment Account Setup",          description: "Add your KPay, WavePay, or Bank details. These instructions automatically appear on your customer's digital checkout page.", icon: Coins,         color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { title: "Multiple Store Setup",           description: "Manage several online brands from one account. Separate your inventory, receipts, and settings per brand.",    icon: Layers,        color: "bg-purple-500",  text: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-100" },
  { title: "Multi-User & Permissions",       description: "Invite your staff or virtual assistants. Assign custom roles to restrict access to sensitive revenue data.",               icon: UserCog,       color: "bg-rose-500",    text: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-100" },
  { title: "Customer Relationship",          description: "Build rich profiles. Track total spend, view past orders, and assign default customers to speed up repeat checkouts.", icon: Users2,        color: "bg-indigo-500",  text: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100" },
  { title: "Dashboard & Analytics",          description: "Visualize revenue trends, track top-selling items, and monitor low-stock alerts through an intuitive real-time dashboard.",    icon: BarChart3,        color: "bg-cyan-500",   text: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-100" },
  { title: "Detailed Sale Reports",          description: "Generate itemized sales summaries and category reports. Export your financial data to Excel or PDF in one click.",                  icon: FileText, color: "bg-orange-500", text: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-100" },
]

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

export function LandingFeatures() {
  const { ref, visible } = useReveal(0.05)

  return (
    <section id="features" className="py-28 bg-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-400/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-5">
            Full Feature Suite
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 leading-tight">
            Everything you need to{" "}
            <span className="text-primary">run your online store.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Replace chaotic spreadsheets and messy direct messages with one unified dashboard designed for modern digital sellers.
          </p>
        </div>

        {/* Feature grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-7 bg-card border border-border rounded-3xl hover:border-transparent hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-400 overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.5s ease ${Math.floor(i / 3) * 80 + (i % 3) * 60}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${Math.floor(i / 3) * 80 + (i % 3) * 60}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
              }}
            >
              {/* Hover tint overlay */}
              <div className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-400 rounded-3xl`} />

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg ${feature.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black mb-2.5 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
