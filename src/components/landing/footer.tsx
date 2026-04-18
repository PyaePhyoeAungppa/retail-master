"use client"

import Link from "next/link"
import { ShoppingBag, Github, Twitter, Linkedin, Loader2, CheckCircle2, MessageSquare, Phone } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/store/use-language-store"
import { translations } from "@/lib/translations"

const platformLinks = [
  { label: "POS Terminal", href: "#features" },
  { label: "Inventory Management", href: "#features" },
  { label: "Customer CRM", href: "#features" },
  { label: "Analytics Dashboard", href: "#features" },
  { label: "Report Centre", href: "#features" },
  { label: "Staff Management", href: "#features" },
  { label: "Transaction History", href: "#features" },
  { label: "Receipt Sharing", href: "#features" },
  { label: "Shift Management", href: "#features" },
  { label: "Multi-Store Support", href: "#features" },
  { label: "Dynamic Currency & Tax", href: "#features" },
  { label: "App Settings", href: "#features" },
]



export function LandingFooter() {
  const { language } = useLanguageStore()
  const t = translations[language].hero // Use hero description for now or generic if needed

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return

    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.")
      }

      setStatus("success")
      setEmail("")
    } catch (err: any) {
      setStatus("error")
      setErrorMessage(err.message)
    }
  }

  return (
    <footer className="bg-background border-t border-border pt-24 pb-12">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr] gap-12 lg:gap-24 mb-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6" aria-label="Retail Master Home">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 border overflow-hidden">
                <img src="/logo.png" alt="Retail Master" className="w-full h-full object-contain p-1.5" />
              </div>
              <span className="font-black text-2xl tracking-tighter">Retail Master</span>
            </Link>
            <p className="text-muted-foreground font-medium mb-8 text-sm leading-relaxed max-w-sm">
              {language === 'mm' 
                ? "Retail Master သည် ခေတ်မီအွန်လိုင်းရောင်းချသူများအတွက် အထူးဒီဇိုင်းထုတ်ထားသော POS ဖြစ်သည်။ အော်ဒါအမှားများကို လျှော့ချပေးပြီး စီမံခန့်ခွဲမှုအချိန်များကို သက်သာစေကာ လုပ်ငန်းကို ပိုမိုမြန်ဆန်လာစေပါသည်။"
                : t.description}
            </p>
            <div className="flex gap-4">
              {[
                { 
                  label: "WhatsApp", 
                  href: "https://wa.me/66811128174",
                  icon: (props: any) => (
                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.049a11.818 11.818 0 001.592 5.911L0 24l6.147-1.612a11.771 11.771 0 005.907 1.577h.005c6.632 0 12.042-5.412 12.045-12.049a11.829 11.829 0 00-3.536-8.525z"/>
                    </svg>
                  )
                },
                { 
                  label: "Viber", 
                  href: "viber://add?number=66811128174",
                  icon: (props: any) => (
                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                      <path d="M19.742 24a30.137 30.137 0 00-2.484-1.695c-.86-.543-1.425-1.306-1.556-2.316-.017-.132-.016-.217.027-.336.353-.984.81-1.92 1.31-2.812.28-.49.323-.972.13-1.472a11.583 11.583 0 00-5.748-6.027c-.894-.431-1.848-.485-2.731-.055-.472.23-.815.602-1.026 1.066a9.544 9.544 0 00-.773 2.528.917.917 0 01-.197.458.749.749 0 01-.433.242 16.516 16.516 0 01-4.148-.567c-.156-.04-.326-.017-.502-.017A10.887 10.887 0 010 10.887a10.888 10.888 0 0121.775 0c0 1.258-.214 2.47-.615 3.601-.143.4-.33.784-.55 1.15a.732.732 0 00-.097.359c.007.135.04.267.108.384a29.837 29.837 0 001.605 2.502c.48.694.516 1.396.113 2.103a2.053 2.053 0 01-1.802 1.014c-.266-.002-.53-.004-.795-.004zM10.887 2.177a8.71 8.71 0 00-8.71 8.71c0 4.81 3.9 8.71 8.71 8.71 4.81 0 8.71-3.9 8.71-8.71a8.71 8.71 0 00-8.71-8.71z"/>
                    </svg>
                  )
                },
                { 
                  label: "Telegram", 
                  href: "https://t.me/xenon_miller155",
                  icon: (props: any) => (
                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                      <path d="M11.944 0C5.356 0 0 5.356 0 11.944s5.356 11.944 11.944 11.944 11.944-5.356 11.944-11.944S18.532 0 11.944 0zm5.862 7.533c-.157 1.667-2.182 10.223-2.327 10.806-.11.432-.42.597-.732.617-.687.042-1.206-.474-1.871-.91-1.04-.683-1.628-1.108-2.636-1.772-1.166-.767-.41-1.189.255-1.878.174-.18 3.197-2.924 3.255-3.172.007-.03.014-.145-.054-.206-.068-.06-.17-.039-.243-.022-.1-.023-1.734 1.055-4.885 3.18-.462.318-.88.473-1.254.464-.413-.01-1.21-.235-1.8-.426-.723-.235-1.3-.359-1.25-.758.026-.208.312-.421.859-.64 3.354-1.46 5.588-2.423 6.703-2.89 3.193-1.336 3.854-1.569 4.288-1.577.095-.002.308.022.446.134.116.094.152.221.164.312a.965.965 0 01.033.272z"/>
                    </svg>
                  )
                }
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="flex flex-col">
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-8 text-foreground/30">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground font-medium hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* Newsletter */}
          <div className="flex flex-col">
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-8 text-foreground/30">Stay Updated</h4>
            <p className="text-sm text-muted-foreground font-medium mb-6">
              Subscribe for major feature announcements and retail industry insights.
            </p>
            
            {status === "success" ? (
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-xs font-black uppercase tracking-widest">You're Subscribed!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Newsletter email"
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                  <button 
                    disabled={status === "loading"}
                    className="px-5 py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center min-w-[80px]"
                  >
                    {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}

            <div className="mt-8 p-4 rounded-2xl bg-muted/60 border border-border">
              <p className="text-xs font-black text-foreground mb-0.5">Need Help?</p>
              <address className="not-italic text-xs text-muted-foreground font-medium">
                <a href="mailto:hello@retailmaster.store" className="hover:text-primary transition-colors">hello@retailmaster.store</a>
              </address>
              <p className="text-xs text-muted-foreground mt-1 font-medium">24/7 support available</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 Retail Master. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            {/* Removed Systems Status text as requested */}
          </div>
        </div>
      </div>
    </footer>
  )
}
