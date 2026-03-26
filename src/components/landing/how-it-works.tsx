"use client"

import { Store, Package, Zap, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
    <section id="how-it-works" className="py-28 bg-muted/30 relative overflow-hidden">
      {/* Decorative orb */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-5">
            Getting Started
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">
            Up and running{" "}
            <span className="text-primary">in under an hour.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            No lengthy onboarding. No steep learning curve. Four simple steps and you're ready to sell.
          </p>
        </div>

        <div ref={ref} className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[58px] left-[13%] right-[13%] h-px bg-gradient-to-r from-indigo-200 via-emerald-200 to-amber-200 z-0" />

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center text-center"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
              }}
            >
              {/* Icon bubble */}
              <div className={`relative w-[72px] h-[72px] rounded-2xl ${step.color} text-white flex items-center justify-center shadow-xl ${step.shadow} mb-6 hover:scale-110 transition-transform duration-300 ring-4 ${step.ring}`}>
                <step.icon className="w-8 h-8" />
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-[9px] font-black text-foreground shadow-sm">
                  {step.number}
                </div>
              </div>

              <div className={`p-6 rounded-3xl bg-gradient-to-b ${step.highlight} border w-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                <h3 className={`text-base font-black mb-3 tracking-tight ${step.textColor}`}>{step.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
