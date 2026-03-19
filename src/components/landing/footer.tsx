"use client"

import Link from "next/link"
import { ShoppingBag, Github, Twitter, Linkedin } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border pt-24 pb-12">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-black text-2xl tracking-tighter">Retail Master</span>
            </Link>
            <p className="text-muted-foreground font-medium mb-8">
              The premium, all-in-one POS platform designed for the next generation of retailers. 
              Beautifully engineered, effortlessly powerful.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-foreground">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Point of Sale</Link></li>
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Inventory Management</Link></li>
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Staff Analytics</Link></li>
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Customer CRM</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-foreground">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Our Vision</Link></li>
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Brand Assets</Link></li>
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground font-medium hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground font-medium mb-6">
               Subscribe to our newsletter for major feature announcements.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
              <button className="px-5 py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 Retail Master Inc. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-tighter">Status: All Systems Functional</Link>
            <Link href="#" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-tighter">Asia South-1 Region</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
