"use client"

import {
  Zap, Package, Users2, BarChart3, FileText, UserCog,
  History, Share2, ClipboardCheck, Layers, Coins, Settings2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
  { title: "Lightning-Fast POS Terminal",     description: "Optimized checkout with barcode scanning, product search, cart management, and support for Cash, Card, QR, and NFC payments.", icon: Zap,          color: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
  { title: "Inventory Management",            description: "Real-time stock tracking across categories with automated low-stock alerts and bulk product management.",                          icon: Package,       color: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
  { title: "Customer CRM",                    description: "Build rich customer profiles, track complete purchase histories, and manage loyalty programs directly from the terminal.",         icon: Users2,        color: "bg-indigo-500",  text: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100" },
  { title: "Advanced Analytics Dashboard",    description: "Visualize revenue trends, completed orders, average order value, payment distribution, and category performance with live charts.", icon: BarChart3,     color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { title: "Report Centre",                   description: "Generate Sale Summaries, itemized Sale Details, Top Items, and Category Reports — then export to Excel or PDF in one click.",    icon: FileText,      color: "bg-purple-500",  text: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-100" },
  { title: "Staff & Role Management",         description: "Assign Admin or Cashier roles, control access permissions per user, and gain full visibility into staff activity.",               icon: UserCog,       color: "bg-rose-500",    text: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-100" },
  { title: "Transaction History",             description: "Search and filter all past sales by date or customer. View full transaction details and regenerate receipts for any past order.", icon: History,       color: "bg-cyan-500",    text: "text-cyan-600",    bg: "bg-cyan-50",    border: "border-cyan-100" },
  { title: "Receipt Sharing",                 description: "Share digital receipts instantly via WhatsApp or Messenger as high-quality images or PDF attachments — no printer required.",    icon: Share2,        color: "bg-green-500",   text: "text-green-600",   bg: "bg-green-50",   border: "border-green-100" },
  { title: "Shift Management",                description: "Open and close shifts with full cash drawer tracking, reconciliation reports, and shift-level sales summaries.",                  icon: ClipboardCheck, color: "bg-orange-500", text: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-100" },
  { title: "Multi-Store Support",             description: "Manage multiple store locations from one account. Switch between stores, compare performance, and maintain global inventory.",     icon: Layers,        color: "bg-violet-500",  text: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
  { title: "Dynamic Currency & Tax",          description: "Configure currency symbols and tax rates per store. All receipts, carts, and reports automatically reflect your local settings.", icon: Coins,         color: "bg-yellow-500",  text: "text-yellow-700",  bg: "bg-yellow-50",  border: "border-yellow-100" },
  { title: "Configurable App Settings",       description: "Customize store branding, tagline, address, display theme, and notification alerts — no code changes required.",                   icon: Settings2,     color: "bg-slate-500",   text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-100" },
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
            <span className="text-primary">scale your retail business.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Retail Master combines 12 purpose-built modules into one cohesive platform — no third-party integrations needed.
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
