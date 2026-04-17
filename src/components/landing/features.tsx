"use client"

import { LandingShowcase } from "./showcase"
import { useLanguageStore } from "@/store/use-language-store"
import { translations } from "@/lib/translations"

export function LandingFeatures() {
  const { language } = useLanguageStore()
  const t = translations[language].features

  return (
    <section id="features" className="py-12 bg-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-4">
          <div className="inline-block text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-5">
            {t.badge}
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-5 leading-[0.95]">
            {t.title}{" "}
            <span className="text-primary/60">{t.subtitle}</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        <LandingShowcase />
      </div>
    </section>
  )
}
