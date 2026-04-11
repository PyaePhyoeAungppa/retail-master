"use client"

import { useState } from "react"
import { Send, CheckCircle2, Loader2, Mail, Phone } from "lucide-react"

const BUSINESS_SIZES = [
  "Just me (solo seller)",
  "2–5 people",
  "6–15 people",
  "16–50 people",
  "50+ people",
]

type FormState = "idle" | "loading" | "success" | "error"

export function LandingContact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessSize: "",
    message: "",
  })
  const [status, setStatus] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed.")
      setStatus("success")
    } catch (err: any) {
      setStatus("error")
      setErrorMsg(err.message ?? "Something went wrong. Please try again.")
    }
  }

  const inputClass =
    "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container px-6 mx-auto">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative shadow-2xl shadow-primary/25">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 relative z-10 p-5 sm:p-10 lg:p-16">

            {/* Left: Info */}
            <div className="max-w-xl flex flex-col justify-center">
              <div className="inline-block text-[10px] font-black text-white/70 uppercase tracking-[0.2em] bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-6 w-fit">
                Book a Demo
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white leading-[1.05] mb-5">
                See Retail Master in action — free for 1 month.
              </h2>
              <p className="text-base text-white/75 font-medium leading-relaxed mb-10">
                Tell us a bit about your business and we'll set up a personalised demo and get you started within 24 hours.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Email Us</p>
                    <p className="font-black">hello@retailmaster.store</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Response Time</p>
                    <p className="font-black">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl w-full">

              {status === "success" ? (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] gap-5">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Inquiry Received!</h3>
                  <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
                    Thanks! We'll reach out within 24 hours to schedule your personalised demo.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-7">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Book a Free Demo</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">Share your requirements to begin your 1-month trial.</p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Your name"
                          value={form.name}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="you@store.com"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Phone + Business Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Contact Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="+66 / 09-xxx-xxxxx"
                          value={form.phone}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Business Size
                        </label>
                        <select
                          name="businessSize"
                          value={form.businessSize}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="">Select size…</option>
                          {BUSINESS_SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>



                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Tell us about your store, what you sell, any questions…"
                        value={form.message}
                        onChange={handleChange}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {/* Error */}
                    {status === "error" && (
                      <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                        {errorMsg}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Inquiry
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      We'll respond within 24 hours · No spam, ever.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
