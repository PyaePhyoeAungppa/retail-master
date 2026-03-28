"use client"

import Link from "next/link"
import { ArrowRight, Terminal, BarChart3, Receipt, Zap } from "lucide-react"
import { useEffect, useRef } from "react"

export function LandingHero() {
  const mockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mockRef.current
    if (!el) return
    // Only apply 3-D tilt on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      el.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`
    }
    const handleMouseLeave = () => {
      el.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)"
    }
    el.addEventListener("mousemove", handleMouseMove)
    el.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      el.removeEventListener("mousemove", handleMouseMove)
      el.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-40 lg:pb-32">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full bg-purple-400/8 blur-[120px]" />
        {/* Floating dots — hidden on mobile to reduce clutter */}
        <div className="hidden sm:block animate-float absolute top-1/3 left-[8%] w-3 h-3 rounded-full bg-primary/30" />
        <div className="hidden sm:block animate-float-slow absolute top-1/4 right-[12%] w-2 h-2 rounded-full bg-purple-400/40" style={{animationDelay:"1s"}} />
        <div className="hidden sm:block animate-float absolute bottom-1/3 left-[15%] w-4 h-4 rounded-full bg-indigo-400/20" style={{animationDelay:"2s"}} />
        <div className="hidden sm:block animate-float-slow absolute bottom-1/4 right-[8%] w-2 h-2 rounded-full bg-primary/25" style={{animationDelay:"0.5s"}} />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] sm:bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] sm:text-xs font-black mb-6 sm:mb-8 tracking-widest uppercase">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary/60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            For Digital & Social Commerce
          </div>

          {/* Headline — smaller on mobile */}
          <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-5 sm:mb-6 leading-[1.1]">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60">
              The Complete Platform for
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-500 to-purple-600 animate-gradient-x">
              Online Retailers
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60">
              Without the Storefront.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-up delay-200 text-base sm:text-lg lg:text-xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-xl sm:max-w-2xl leading-relaxed px-2 mx-auto">
            Manage inventory, process orders, track customers, and share beautiful, self-expiring digital receipts directly to Messenger, Instagram, or Email — all from your digital dashboard.
          </p>

          {/* CTAs — fully stacked on mobile, row on sm+ */}
          <div className="animate-fade-up delay-300 flex flex-col gap-3 w-full max-w-xs sm:max-w-none sm:flex-row sm:w-auto">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm sm:text-base shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97]"
            >
              Launch POS Terminal
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-card text-foreground rounded-2xl font-black text-sm sm:text-base border border-border hover:border-primary/40 hover:bg-muted transition-all duration-200 active:scale-[0.97]"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="hidden sm:inline-flex items-center justify-center gap-2 px-6 py-4 text-muted-foreground font-bold text-base hover:text-primary transition-colors duration-200"
            >
              Explore Features ↓
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm font-bold text-muted-foreground">
            {[
              { icon: Receipt, text: "Self-Expiring Web Receipts" },
              { icon: Zap, text: "Seamless Order Sharing" },
              { icon: BarChart3, text: "Multi-Store Analytics" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Mock Dashboard — hidden on very small screens, simplified on mobile */}
          <div
            ref={mockRef}
            className="animate-fade-up delay-500 relative mt-10 sm:mt-16 w-full max-w-5xl"
            style={{ transition: "transform 0.15s ease-out" }}
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-violet-500 to-purple-600 rounded-[2rem] sm:rounded-[2.8rem] blur-xl opacity-20 animate-gradient-x" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none rounded-[2rem] sm:rounded-[2.5rem]" />

            <div className="relative bg-card border border-border/60 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-gradient-to-r from-muted/50 to-muted/20">
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-background/70 border border-border text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                    <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="hidden xs:inline">retailmaster.store</span>
                    <span className="xs:hidden">dashboard</span>
                  </div>
                </div>
              </div>

                {/* Mobile-simplified dashboard view */}
              <div className="bg-slate-50 p-3 sm:p-5">
                {/* Stat cards — 2 cols on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {[
                    { label: "Online Rev", val: "$8,420", color: "text-indigo-600", bg: "bg-indigo-50", bar: "bg-indigo-500 w-[85%]" },
                    { label: "Links Shared",  val: "342",    color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500 w-3/4" },
                    { label: "Customers", val: "1,204", color: "text-purple-600", bg: "bg-purple-50", bar: "bg-purple-500 w-2/3" },
                    { label: "Pending Carts", val: "18", color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-400 w-1/3" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm border border-slate-100">
                      <div className={`text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md sm:rounded-lg w-fit mb-1 sm:mb-1.5 ${stat.bg} ${stat.color}`}>{stat.label}</div>
                      <div className="font-black text-xs sm:text-sm text-slate-800 mb-1.5 sm:mb-2">{stat.val}</div>
                      <div className="h-1 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${stat.bar}`} /></div>
                    </div>
                  ))}
                </div>

                {/* Chart row — only on sm+ */}
                <div className="hidden sm:grid grid-cols-3 gap-3 mb-4">
                  <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Trend — 7 Days</div>
                    <div className="flex items-end gap-1 h-20">
                      {[40,65,45,75,55,90,70,85,60,95,80,100].map((h,i)=>(
                        <div key={i} className="flex-1 rounded-t" style={{height:`${h}%`, backgroundColor: i===11 ? "#6366f1" : i>=9 ? "#a5b4fc" : "#e0e7ff"}} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Payments</div>
                    <div className="flex flex-col gap-2.5">
                      {[{l:"Cash",w:"60%",c:"bg-indigo-500"},{l:"Card",w:"25%",c:"bg-purple-500"},{l:"QR/NFC",w:"15%",c:"bg-emerald-500"}].map((p,i)=>(
                        <div key={i}>
                          <div className="text-[8px] text-slate-400 font-bold mb-1 flex justify-between"><span>{p.l}</span><span>{p.w}</span></div>
                          <div className="h-1.5 bg-slate-100 rounded-full"><div className={`h-full ${p.c} rounded-full`} style={{width:p.w}} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm border border-slate-100 flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    Receipt sent to John D.
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    Order #TX-882 Paid via KPay
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-[9px] font-bold px-2.5 py-1.5 rounded-full border border-orange-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    Pending Web Order: $120.00
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
