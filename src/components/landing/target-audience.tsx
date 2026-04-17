"use client"

import { Smartphone, Store, Instagram, Mail } from "lucide-react"
import { MockReceiptPreview } from "./mock-receipt"
import { useLanguageStore } from "@/store/use-language-store"
import { translations } from "@/lib/translations"

export function LandingTargetAudience() {
  const { language } = useLanguageStore()
  const t = translations[language].audience

  const icons = [Instagram, Smartphone, Store, Mail]
  const audiences = t.items.map((item, i) => ({
    ...item,
    icon: icons[i] || Store
  }))

  return (
    <section className="py-24 lg:py-40 bg-white relative overflow-hidden">
      {/* Background Text Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-slate-50 select-none -z-10 tracking-tighter opacity-50">
        RETAILERS
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 mb-24">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              {t.badge}
            </div>
            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-balance">
              {t.title} <br />
              <span className="text-primary/40">{t.subtitle}</span>
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
              {t.description}
            </p>
          </div>

          <div className="lg:w-1/2 relative flex justify-center pb-12 pr-12 pt-12 group">
            {/* Animated Glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-[4rem] rotate-6 blur-3xl opacity-50 group-hover:rotate-0 transition-transform duration-700" />
            
            <div className="relative z-10 w-full max-w-sm transform group-hover:scale-105 transition-transform duration-500">
               <MockReceiptPreview />
            </div>

            {/* Float Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full animate-pulse-slow" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 blur-2xl rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <div 
              key={index} 
              className="group relative bg-slate-50/50 p-8 rounded-[2.5rem] border border-black/[0.02] hover:bg-white hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-white text-primary flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <audience.icon className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl mb-4 tracking-tight">{audience.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {audience.description}
              </p>
              
              {/* Subtle hover indicator */}
              <div className="absolute bottom-6 right-8 w-8 h-1 bg-primary/10 rounded-full group-hover:w-16 group-hover:bg-primary transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
