"use client"

import { Store, Package, Zap, TrendingUp } from "lucide-react"
import { MockPOSPreview } from "./mock-pos"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    icon: Store,
    title: "Set Up Your Store",
    description: "Register your store in minutes. Configure name, branding, currency, tax rate, and add your team members with the right roles.",
    color: "bg-indigo-500",
    shadow: "shadow-indigo-500/30",
    ring: "ring-indigo-100",
    highlight: "from-indigo-50/80 to-white border-indigo-100",
    textColor: "text-indigo-600",
  },
  {
    number: "02",
    icon: Package,
    title: "Add Your Products",
    description: "Import or manually add your product catalogue with categories, pricing, and stock quantities. Set low-stock alerts so you never run out.",
    color: "bg-purple-500",
    shadow: "shadow-purple-500/30",
    ring: "ring-purple-100",
    highlight: "from-purple-50/80 to-white border-purple-100",
    textColor: "text-purple-600",
  },
  {
    number: "03",
    icon: Zap,
    title: "Launch Your POS",
    description: "Open a shift and start selling immediately. Accept cash, card, QR, or NFC and share digital receipts via WhatsApp or Messenger.",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/30",
    ring: "ring-emerald-100",
    highlight: "from-emerald-50/80 to-white border-emerald-100",
    textColor: "text-emerald-600",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track & Grow",
    description: "Monitor revenue, top-sellers, peak hours, and customer loyalty from your analytics dashboard and report centre.",
    color: "bg-amber-500",
    shadow: "shadow-amber-500/30",
    ring: "ring-amber-100",
    highlight: "from-amber-50/80 to-white border-amber-100",
    textColor: "text-amber-600",
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

export function LandingHowItWorks() {
  const { ref, visible } = useReveal()
  return (
    <section id="how-it-works" className="py-24 lg:py-40 bg-slate-50 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-block text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
             The Onboarding Flow
          </div>
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
            Up and running in <span className="text-primary/60">minutes.</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Our platform is designed for speed. No lengthy setups or complex hardware required — just your browser and a passion to sell.
          </p>
        </div>

        <div ref={ref} className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Progress Indicator — Desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-primary/30 via-indigo-500/30 to-emerald-500/30 -z-10" />

          {steps.map((step, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white border border-black/[0.03] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.8s ease ${i * 150}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 150}ms`,
              }}
            >
              {/* Step Icon */}
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl relative group-hover:scale-110 transition-transform duration-500",
                step.color,
                step.shadow
              )}>
                <step.icon className="w-9 h-9" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-xs font-black text-slate-800 shadow-lg">
                  {step.number}
                </div>
              </div>

              <h3 className="text-lg font-black mb-4 tracking-tight">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Live Preview Section */}
        <div className="mt-32 lg:mt-48 max-w-6xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500 rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition" />
            <div className="relative p-2 lg:p-4 rounded-[3rem] bg-white border border-black/[0.05] shadow-2xl overflow-hidden">
               <div className="flex items-center gap-3 px-6 py-4 border-b border-black/[0.03] bg-slate-50/50 mb-6 rounded-t-[2.5rem]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/30" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/30" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/30" />
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pl-4">LIVE POS INTERFACE PREVIEW</div>
               </div>
               <div className="px-4 pb-4">
                  <MockPOSPreview />
               </div>
            </div>
          </div>
          <div className="mt-12 text-center space-y-4">
            <h3 className="text-2xl font-black tracking-tight">Zero learning curve. Pure efficiency.</h3>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">
              Our interface is built for high-volume retailers. Tap to add, swipe to remove, and share links instantly. It's the POS experience you've always wanted.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
