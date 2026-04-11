"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 500,  suffix: "+",  label: "Stores Running",             description: "Active retailers on the platform" },
  { value: 1,    suffix: "M+", label: "Transactions Processed",     description: "Successfully completed sales" },
  { value: 12,   suffix: "",   label: "Integrated Modules",         description: "From POS to analytics to CRM" },
  { value: 99.9, suffix: "%",  label: "Uptime Guarantee",           description: "Enterprise-grade reliability" },
]

function useCountUp(target: number, duration: number = 1600, start: boolean = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Number((eased * target).toFixed(target % 1 !== 0 ? 1 : 0)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

function StatItem({ value, suffix, label, description, animate, delay }: {
  value: number; suffix: string; label: string; description: string; animate: boolean; delay: string
}) {
  const count = useCountUp(value, 2200, animate)
  return (
    <div
      className="flex flex-col items-center text-center group p-10 rounded-[2.5rem] border border-black/[0.03] bg-white hover:bg-slate-50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-700 aspect-square justify-center relative overflow-hidden"
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-6xl font-black tracking-tighter text-foreground mb-4 group-hover:text-primary transition-colors duration-500">
        {count}{suffix}
      </div>
      <div className="text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-primary/60">{label}</div>
      <div className="text-xs text-muted-foreground font-medium max-w-[120px] mx-auto leading-relaxed">{description}</div>
    </div>
  )
}

export function LandingStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats" className="py-24 lg:py-40 bg-zinc-50/50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-24 space-y-4">
          <div className="inline-block text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
            Proven Scale
          </div>
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
            Powering retail <br /> <span className="text-primary/40">ambitions globally.</span>
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} animate={visible} delay={`${i * 150}ms`} />
          ))}
        </div>
      </div>
    </section>
  )
}
