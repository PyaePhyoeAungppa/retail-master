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
  const count = useCountUp(value, 1800, animate)
  return (
    <div
      className="flex flex-col items-center text-center group p-8 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
      style={{ animationDelay: delay }}
    >
      <div className="text-5xl lg:text-6xl font-black tracking-tighter text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
        {count}{suffix}
      </div>
      <div className="text-sm font-black mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-muted-foreground font-medium">{description}</div>
    </div>
  )
}

export function LandingStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.25 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats" className="py-28 bg-background relative overflow-hidden">
      {/* Subtle background grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,black,transparent)]" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-5">
            Trusted by Retailers
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">
            Numbers that <span className="text-primary">speak for themselves.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            From boutique shops to multi-location chains, Retail Master powers real businesses every day.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} animate={visible} delay={`${i * 100}ms`} />
          ))}
        </div>
      </div>
    </section>
  )
}
