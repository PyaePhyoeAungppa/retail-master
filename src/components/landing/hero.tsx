"use client"

import Link from "next/link"
import { ArrowRight, Terminal } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            NEXT-GEN RETAIL SOLUTION
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 leading-[1.1]">
            Master Your Business With <span className="text-primary">Retail Master</span>
          </h1>
          
          <p className="text-xl text-muted-foreground font-medium mb-10 max-w-2xl balance px-4">
            The premium POS platform for modern retailers. Integrated inventory, 
            deep analytics, and seamless multi-store management in one stunning interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary/90 transition-all active:scale-95 group"
            >
              Launch POS Terminal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-black text-lg border border-border hover:bg-muted transition-all active:scale-95"
            >
              Explore Features
            </Link>
          </div>

          {/* Floating UI Elements Mockup */}
          <div className="relative mt-20 w-full max-w-5xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-background/50 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Terminal className="w-3 h-3" />
                    pos.retailmaster.io
                  </div>
                </div>
              </div>
              <div className="aspect-[16/10] bg-slate-100 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-black text-4xl transform -rotate-12">
                   POS PREVIEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
