"use client"

import Link from "next/link"
import { ShoppingBag, Github, Twitter, Linkedin } from "lucide-react"

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

const companyLinks = [
  { label: "Our Vision", href: "#" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Brand Assets", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
]

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border pt-24 pb-12">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6" aria-label="Retail Master Home">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-black text-2xl tracking-tighter">Retail Master</span>
            </Link>
            <p className="text-muted-foreground font-medium mb-8 text-sm leading-relaxed">
              The premium, all-in-one POS platform designed for the next generation of retailers.
              12 integrated modules. One beautiful interface.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-foreground">Platform</h4>
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

          {/* Company */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-foreground">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground font-medium hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground font-medium mb-6">
              Subscribe for major feature announcements and retail industry insights.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                aria-label="Newsletter email"
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
              <button className="px-5 py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                Join
              </button>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-muted/60 border border-border">
              <p className="text-xs font-black text-foreground mb-0.5">Need Help?</p>
              <address className="not-italic text-xs text-muted-foreground font-medium">
                <a href="mailto:hello@retailmaster.io" className="hover:text-primary transition-colors">hello@retailmaster.io</a>
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
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              All Systems Operational
            </span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
              Asia South-1 Region
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
