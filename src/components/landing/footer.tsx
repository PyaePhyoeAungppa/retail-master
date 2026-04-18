"use client"

import Link from "next/link"
import { ShoppingBag, Loader2, CheckCircle2 } from "lucide-react"
import { SiWhatsapp, SiTelegram } from "react-icons/si"
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

            <div className="mt-8">
              <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 text-foreground/30">Contact Us</h4>
              <div className="flex gap-4">
                {[
                  { label: "WhatsApp", href: "https://wa.me/66811128174", icon: SiWhatsapp, color: "#25D366" },
                  { label: "Telegram", href: "https://t.me/xenon_miller155", icon: SiTelegram, color: "#26A5E4" }
                ].map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-6 h-6" style={{ color: social.color }} />
                  </Link>
                ))}
              </div>
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
