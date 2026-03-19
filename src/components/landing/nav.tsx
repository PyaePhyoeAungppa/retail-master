"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled 
        ? "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm" 
        : "bg-transparent border-transparent py-5"
    )}>
      <div className="container px-6 mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-black text-2xl tracking-tighter">Retail Master</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Features</Link>
          <Link href="#contact" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Login</Link>
          <Link 
            href="/login" 
            className="px-6 py-2.5 bg-foreground text-background rounded-xl font-black text-sm hover:bg-foreground/90 transition-all active:scale-95"
          >
            Launch POS
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 top-[72px] bg-background z-40 md:hidden transition-transform duration-300 ease-in-out p-6 border-t border-border",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <nav className="flex flex-col gap-6">
          <Link 
            href="#features" 
            className="text-2xl font-black tracking-tighter"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link 
            href="#contact" 
            className="text-2xl font-black tracking-tighter"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link 
            href="/login" 
            className="text-2xl font-black tracking-tighter"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link 
            href="/login" 
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-center text-xl shadow-xl shadow-primary/20"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Launch POS
          </Link>
        </nav>
      </div>
    </header>
  )
}
