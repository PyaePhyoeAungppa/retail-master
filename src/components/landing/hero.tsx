"use client"

import Link from "next/link"
import { ArrowRight, Terminal, BarChart3, Receipt, Zap } from "lucide-react"
import { useEffect, useRef } from "react"

export function LandingHero() {
  const mockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mockRef.current
    if (!el) return
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
    <section className="relative overflow-hidden bg-background pt-28 pb-20 lg:pt-40 lg:pb-32">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-purple-400/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-indigo-300/6 blur-[100px]" />
        {/* Floating dots */}
        <div className="animate-float absolute top-1/3 left-[8%] w-3 h-3 rounded-full bg-primary/30" />
        <div className="animate-float-slow absolute top-1/4 right-[12%] w-2 h-2 rounded-full bg-purple-400/40" style={{animationDelay:"1s"}} />
        <div className="animate-float absolute bottom-1/3 left-[15%] w-4 h-4 rounded-full bg-indigo-400/20" style={{animationDelay:"2s"}} />
        <div className="animate-float-slow absolute bottom-1/4 right-[8%] w-2 h-2 rounded-full bg-primary/25" style={{animationDelay:"0.5s"}} />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black mb-8 tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary/60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            The Next-Gen Retail Platform
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.08]">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60">
              The POS System Built for{" "}
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-500 to-purple-600 animate-gradient-x">
              Modern Retail
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-up delay-200 text-lg lg:text-xl text-muted-foreground font-medium mb-10 max-w-2xl leading-relaxed">
            Lightning-fast checkout, real-time analytics, smart inventory,
            receipt sharing, and full staff & customer management —
            all in one premium platform.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] transition-all duration-200 active:scale-[0.97]"
            >
              Launch POS Terminal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground rounded-2xl font-black text-base border border-border hover:border-primary/40 hover:bg-muted transition-all duration-200 active:scale-[0.97]"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-muted-foreground font-bold text-base hover:text-primary transition-colors duration-200"
            >
              Explore Features ↓
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-6 mt-8 text-sm font-bold text-muted-foreground">
            {[
              { icon: BarChart3, text: "Real-time Analytics" },
              { icon: Receipt, text: "Receipt Sharing" },
              { icon: Zap, text: "Multi-Payment Support" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                <Icon className="w-4 h-4 text-primary" />
                {text}
              </div>
            ))}
          </div>

          {/* Mock POS Dashboard UI — 3-D tilt on hover */}
          <div
            ref={mockRef}
            className="animate-fade-up delay-500 relative mt-16 w-full max-w-5xl"
            style={{ transition: "transform 0.15s ease-out" }}
          >
            {/* Glow ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-violet-500 to-purple-600 rounded-[2.8rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-gradient-x" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none rounded-[2.5rem]" />

            <div className="relative bg-card border border-border/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-gradient-to-r from-muted/50 to-muted/20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background/70 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Terminal className="w-3 h-3" />
                    pos.retailmaster.io / dashboard
                  </div>
                </div>
              </div>

              {/* Mock Dashboard */}
              <div className="bg-slate-50 p-5 grid grid-cols-12 gap-4" style={{minHeight: "340px"}}>
                {/* Sidebar */}
                <div className="col-span-2 bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-2 border border-slate-100">
                  <div className="w-full h-7 bg-primary/10 rounded-xl" />
                  <div className="w-full h-6 bg-slate-100 rounded-lg" />
                  <div className="w-full h-6 bg-slate-100 rounded-lg" />
                  <div className="w-full h-6 bg-primary/20 rounded-lg" />
                  <div className="w-full h-6 bg-slate-100 rounded-lg" />
                  <div className="w-full h-6 bg-slate-100 rounded-lg" />
                  <div className="w-full h-6 bg-slate-100 rounded-lg" />
                </div>

                {/* Main area */}
                <div className="col-span-10 flex flex-col gap-4">
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Revenue", val: "$4,821", color: "text-indigo-600", bg: "bg-indigo-50", bar: "bg-indigo-500 w-3/4" },
                      { label: "Orders",  val: "134",    color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500 w-2/3" },
                      { label: "Avg Order", val: "$35.98", color: "text-purple-600", bg: "bg-purple-50", bar: "bg-purple-500 w-1/2" },
                      { label: "Low Stock", val: "3 items", color: "text-red-600", bg: "bg-red-50", bar: "bg-red-400 w-1/4" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg w-fit mb-1.5 ${stat.bg} ${stat.color}`}>{stat.label}</div>
                        <div className="font-black text-sm text-slate-800 mb-2">{stat.val}</div>
                        <div className="h-1 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${stat.bar}`} /></div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Trend — 7 Days</div>
                      <div className="flex items-end gap-1 h-20">
                        {[40,65,45,75,55,90,70,85,60,95,80,100].map((h,i)=>(
                          <div key={i} className="flex-1 rounded-t transition-all" style={{height:`${h}%`, backgroundColor: i===11 ? "#6366f1" : i>=9 ? "#a5b4fc" : "#e0e7ff"}} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Payments</div>
                      <div className="flex flex-col gap-2.5">
                        {[
                          {l:"Cash", w:"60%", c:"bg-indigo-500"},
                          {l:"Card", w:"25%", c:"bg-purple-500"},
                          {l:"QR/NFC", w:"15%", c:"bg-emerald-500"},
                        ].map((p,i)=>(
                          <div key={i}>
                            <div className="text-[8px] text-slate-400 font-bold mb-1 flex justify-between"><span>{p.l}</span><span>{p.w}</span></div>
                            <div className="h-1.5 bg-slate-100 rounded-full"><div className={`h-full ${p.c} rounded-full`} style={{width:p.w}} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alerts row */}
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 flex gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-[9px] font-bold px-2.5 py-1.5 rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Low Stock: Espresso Beans (2 left)
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2.5 py-1.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      Shift Started — John D.
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2.5 py-1.5 rounded-full border border-indigo-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      New sale: $48.50 via QR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
