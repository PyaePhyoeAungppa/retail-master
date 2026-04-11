"use client"

import Link from "next/link"
import { Check, X, Star, ShieldCheck, Zap, ArrowRight, Phone } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    tagline: "Try the full platform, free.",
    trial: "1-Month Free Trial",
    price: "฿750",
    period: "/month after trial",
    highlight: false,
    popular: false,
    features: [
      { text: "1 Storefront",                    included: true },
      { text: "Unlimited Products & Stock",       included: true },
      { text: "Digital receipts & share links",   included: true },
      { text: "POS & order management",           included: true },
      { text: "Basic sales analytics",            included: true },
      { text: "Customer profiles",                included: true },
      { text: "Multiple storefronts",             included: false },
      { text: "Staff accounts & roles",           included: false },
      { text: "Advanced reports & exports",       included: false },
    ],
    cta: "Start Free Trial",
    ctaSub: "No card required · Cancel anytime",
    href: "/login",
  },
  {
    name: "Pro Seller",
    tagline: "Everything for growing brands.",
    trial: "1-Month Free Trial",
    price: "฿1,550",
    period: "/month after trial",
    highlight: true,
    popular: true,
    features: [
      { text: "Up to 5 Storefronts",              included: true },
      { text: "Unlimited Products & Stock",        included: true },
      { text: "Digital receipts & share links",    included: true },
      { text: "POS & order management",            included: true },
      { text: "Advanced analytics & reports",      included: true },
      { text: "Customer profiles & loyalty",       included: true },
      { text: "Multiple storefronts",              included: true },
      { text: "Up to 10 staff accounts & roles",   included: true },
      { text: "PDF & email receipt export",        included: true },
    ],
    cta: "Start Free Trial",
    ctaSub: "No card required · Cancel anytime",
    href: "/login",
  },
  {
    name: "Enterprise",
    tagline: "High-volume teams & agencies.",
    trial: "Custom onboarding",
    price: "Custom",
    period: "tailored to your volume",
    highlight: false,
    popular: false,
    features: [
      { text: "Unlimited Storefronts",             included: true },
      { text: "Unlimited Products & Stock",        included: true },
      { text: "Digital receipts & share links",    included: true },
      { text: "POS & order management",            included: true },
      { text: "Advanced analytics & reports",      included: true },
      { text: "Customer profiles & loyalty",       included: true },
      { text: "Multiple storefronts",              included: true },
      { text: "Unlimited staff accounts & roles",  included: true },
      { text: "Dedicated account manager",         included: true },
    ],
    cta: "Contact Sales",
    ctaSub: "We'll respond within 24 hours",
    href: "#contact",
  },
]

const testimonials = [
  { name: "Mya T.",   role: "Fashion Boutique, Yangon",    quote: "I used to manage stock in 3 different notebooks. Now it's all here and I never run out." },
  { name: "Ko Aung",  role: "Accessories Seller, Mandalay", quote: "My customers love getting the receipt link — feels so professional compared to just typing in Messenger." },
  { name: "Su Su",    role: "Multi-brand online seller",    quote: "The analytics showed me my top products clearly. I doubled reorders that week." },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px]" />

      <div className="container mx-auto px-6 relative">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-block text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05]">
            One month free. <span className="text-primary/60">Then grow with us.</span>
          </h2>
          <p className="text-base text-muted-foreground font-medium">
            Every plan starts with a full 1-month free trial. No credit card required.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start mb-16">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-3xl flex flex-col transition-all duration-300 ${
                tier.highlight
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.03] border border-primary"
                  : "bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow">
                  <Star className="w-2.5 h-2.5 fill-amber-900" /> Most Popular
                </div>
              )}

              {/* Top */}
              <div className="p-7 pb-5">
                {/* Trial badge */}
                <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${
                  tier.highlight ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}>
                  <Zap className="w-2.5 h-2.5" />
                  {tier.trial}
                </div>

                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${tier.highlight ? "text-primary-foreground/60" : "text-primary"}`}>
                  {tier.name}
                </p>
                <p className={`text-sm font-medium mb-5 ${tier.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {tier.tagline}
                </p>

                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black tracking-tighter">{tier.price}</span>
                  {tier.price !== "Custom" && (
                    <span className={`text-xs font-medium mb-1 ${tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                {tier.price === "Custom" && (
                  <p className={`text-xs font-medium ${tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{tier.period}</p>
                )}
              </div>

              {/* Divider */}
              <div className={`mx-7 border-t ${tier.highlight ? "border-white/20" : "border-slate-100"}`} />

              {/* Features */}
              <ul className="px-7 py-5 space-y-2.5 flex-1">
                {tier.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.highlight ? "text-white" : "text-emerald-500"}`} />
                    ) : (
                      <X className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
                    )}
                    <span className={`text-sm font-medium ${
                      !f.included
                        ? (tier.highlight ? "text-primary-foreground/30" : "text-slate-300")
                        : (tier.highlight ? "text-primary-foreground" : "text-foreground")
                    }`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="p-7 pt-4 space-y-2">
                <Link
                  href={tier.href}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all text-center flex items-center justify-center gap-2 group ${
                    tier.highlight
                      ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                      : tier.name === "Enterprise"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {tier.name === "Enterprise" ? <Phone className="w-4 h-4" /> : null}
                  {tier.cta}
                  {tier.name !== "Enterprise" && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Link>
                <p className={`text-[10px] text-center font-medium ${tier.highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                  {tier.ctaSub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantees */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: ShieldCheck, text: "No credit card for trial" },
            { icon: Zap,        text: "Full access from day 1" },
            { icon: ShieldCheck, text: "Cancel or pause anytime" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex mb-3">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">"{t.quote}"</p>
              <div>
                <p className="text-xs font-black text-slate-800">{t.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
