"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X, Globe } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/store/use-language-store"

const navLinks = [
  { label: "Features",  href: "#features" },
]

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguageStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled
        ? "bg-background/90 backdrop-blur-md border-border py-3 shadow-sm"
        : "bg-transparent border-transparent py-4 sm:py-5"
    )}>
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0" aria-label="Retail Master Home">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-105 transition-transform border overflow-hidden">
            <img src="/logo.png" alt="Retail Master" className="w-full h-full object-contain p-1.5" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tighter">Retail Master</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}

          <div className="flex items-center bg-muted/50 rounded-xl p-1 border">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                language === 'en' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('mm')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                language === 'mm' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              MM
            </button>
          </div>

          <Link
            href="#contact"
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Get Started →
          </Link>
        </nav>

        {/* Mobile right side: Hamburger only */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="p-2 rounded-xl bg-muted/60 text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed inset-0 h-[100dvh] bg-white z-[60] md:hidden transition-all duration-300 ease-in-out flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 border overflow-hidden">
              <img src="/logo.png" alt="Retail Master" className="w-full h-full object-contain p-1" />
            </div>
            <span className="font-black text-xl tracking-tighter">Retail Master</span>
          </Link>
          <button
            className="p-2.5 rounded-xl bg-muted/50 text-foreground hover:bg-muted transition-colors border"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer content */}
        <nav className="flex flex-col px-6 pt-8 pb-10 flex-1 overflow-y-auto no-scrollbar" aria-label="Mobile navigation">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-5 py-4 rounded-2xl font-black text-2xl tracking-tight hover:bg-muted transition-all active:scale-95 text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-8">
            {/* Language Switcher in Mobile Menu */}
            <div className="pt-8 border-t border-border/60">
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-4 px-1 tracking-widest">Select Language</p>
              <div className="flex items-center bg-muted/50 rounded-2xl p-1.5 border border-border/50">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex-1 py-3.5 rounded-xl text-xs font-black uppercase transition-all",
                    language === 'en' ? "bg-white text-primary shadow-lg shadow-black/5 border border-border/50" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('mm')}
                  className={cn(
                    "flex-1 py-3.5 rounded-xl text-xs font-black uppercase transition-all",
                    language === 'mm' ? "bg-white text-primary shadow-lg shadow-black/5 border border-border/50" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                   ဗမာ (MM)
                </button>
              </div>
            </div>

            <Link
              href="#contact"
              className="flex items-center justify-center w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started →
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
