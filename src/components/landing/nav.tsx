"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Features",  href: "#features" },
  { label: "Pricing",   href: "#pricing" },
]

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
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
        "fixed inset-0 top-0 bg-background/98 backdrop-blur-md z-40 md:hidden transition-all duration-300 ease-in-out flex flex-col",
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl tracking-tighter">Retail Master</span>
          </Link>
          <button
            className="p-2 rounded-xl bg-muted text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-col px-4 pt-6 pb-8 gap-1 flex-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-4 py-4 rounded-2xl font-black text-xl tracking-tight hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-auto pt-8">
            <Link
              href="#contact"
              className="flex items-center justify-center w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-colors"
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
