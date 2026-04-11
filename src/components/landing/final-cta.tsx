"use client"

import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

export function LandingFinalCTA() {
  return (
    <section className="py-16 lg:py-24 bg-background border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary via-primary to-violet-600 px-8 py-16 lg:px-20 lg:py-24 text-center shadow-2xl shadow-primary/30">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
              <Zap className="w-3 h-3" />
              Full 1-Month Free Trial — All Plans
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95]">
              Your competitors are<br />already using this.
            </h2>

            <p className="text-base lg:text-lg text-white/80 font-medium leading-relaxed max-w-xl mx-auto">
              500+ online sellers in Southeast Asia use Retail Master daily to close more sales, look more professional, and spend less time on admin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 h-12 px-8 bg-white text-primary rounded-xl font-black text-sm shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all"
              >
                Start Your Free Trial Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center h-12 px-7 bg-white/10 border border-white/20 text-white rounded-xl font-black text-sm hover:bg-white/20 transition-all"
              >
                Talk to Sales
              </Link>
            </div>

            <p className="text-white/50 text-xs font-medium pt-2">
              1 month full access · No credit card · ฿750/mo after trial
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
