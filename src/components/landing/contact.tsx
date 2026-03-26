"use client"

import { Mail, MessageSquare, Send } from "lucide-react"

export function LandingContact() {
  return (
    <section id="contact" className="py-28">
      <div className="container px-6 mx-auto">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative p-10 lg:p-16 shadow-2xl shadow-primary/25">
          {/* Animated decorative orbs */}
          <div className="animate-float absolute top-0 right-0 w-[500px] h-[500px] bg-white/8 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="animate-float-slow absolute bottom-0 left-0 w-[350px] h-[350px] bg-black/8 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,white/3_1px,transparent_1px),linear-gradient(to_bottom,white/3_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-30" />


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-primary-foreground mb-6">
                Ready to transform your retail experience?
              </h2>
              <p className="text-xl text-primary-foreground/80 font-medium mb-12">
                Join hundreds of stores that use Retail Master to streamline their 
                operations and delight their customers.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">General Inquiries</p>
                    <p className="text-lg font-black">hello@retailmaster.io</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-primary-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">24/7 Support</p>
                    <p className="text-lg font-black">support.retailmaster.io</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-8 text-slate-900">Get a Detailed Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Work Email</label>
                    <input 
                      type="email" 
                      placeholder="john@store.com"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="Premium Boutique"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Your Message</label>
                  <textarea 
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-95 group mt-4"
                >
                  Send Message
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
