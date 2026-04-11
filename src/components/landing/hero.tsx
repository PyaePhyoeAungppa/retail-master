"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Receipt, Zap } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"
import { cn } from "@/lib/utils"
import {
  DollarSign, ShoppingCart, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, Package
} from "lucide-react"

// ─── Dummy data mirroring real dashboard ───────────────────────
const salesTrend = [
  { name: "Mon", total: 4200 },
  { name: "Tue", total: 6800 },
  { name: "Wed", total: 5100 },
  { name: "Thu", total: 9400 },
  { name: "Fri", total: 7600 },
  { name: "Sat", total: 11200 },
  { name: "Sun", total: 8900 },
]

const paymentData = [
  { name: "Cash", value: 42 },
  { name: "KPay",  value: 28 },
  { name: "Card", value: 18 },
  { name: "NFC",  value: 12 },
]

const lowStock = [
  { name: "Silk Midi Dress", stock: 3 },
  { name: "Pearl Earring Set", stock: 6 },
]

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"]

// ─── Mini StatCard matching the real app ─────────────────────
function StatCard({
  title, value, trend, trendType, icon: Icon,
}: {
  title: string; value: string; trend: string
  trendType: "up" | "down" | "neutral"; icon: any
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <span className={cn(
          "text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5",
          trendType === "up"   && "bg-emerald-50 text-emerald-600",
          trendType === "down" && "bg-red-50 text-red-500",
          trendType === "neutral" && "bg-slate-100 text-slate-500",
        )}>
          {trendType === "up" && <ArrowUpRight className="w-2.5 h-2.5" />}
          {trendType === "down" && <ArrowDownRight className="w-2.5 h-2.5" />}
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-lg font-black tracking-tight">{value}</p>
      </div>
    </div>
  )
}

// ─── The hero dashboard preview ───────────────────────────────
function HeroDashboardPreview() {
  return (
    <div className="w-full rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden text-left">
      {/* Browser chrome */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 px-3 py-0.5 rounded-lg bg-white border border-slate-200 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            retailmaster.store/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h2 className="text-sm font-black tracking-tight">Analytics Dashboard</h2>
          <p className="text-[9px] text-slate-400 font-medium">Overview of your store's performance</p>
        </div>
        {/* Range tabs — matches real app */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[8px] font-bold">
          {["Daily", "Weekly", "Monthly"].map((r, i) => (
            <span key={r} className={cn("px-2 py-1 rounded-md", i === 1 ? "bg-white shadow-sm text-foreground" : "text-slate-400")}>
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Stat cards — exactly 4 like real app */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 px-4 pb-3">
        <StatCard title="Total Revenue"      value="฿53,200" trend="+12.5%" trendType="up"      icon={DollarSign} />
        <StatCard title="Completed Orders"   value="214"      trend="+5.2%"  trendType="up"      icon={ShoppingCart} />
        <StatCard title="Avg. Order Value"   value="฿248"     trend="-2.1%"  trendType="down"    icon={TrendingUp} />
        <StatCard title="Voided Transactions" value="4"       trend="+1"     trendType="neutral" icon={AlertCircle} />
      </div>

      {/* Charts row — 2/3 + 1/3 like real app */}
      <div className="grid grid-cols-3 gap-2.5 px-4 pb-4">
        {/* Revenue Trend area chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
          <p className="text-[9px] font-black text-slate-700 mb-0.5">Revenue Trend</p>
          <p className="text-[8px] text-slate-400 font-medium mb-2">Daily sales for the last 7 days.</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 7, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `฿${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 10 }}
                  formatter={(v: any) => [`฿${Number(v).toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#heroGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Distribution pie chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col">
          <p className="text-[9px] font-black text-slate-700 mb-0.5">Payment Distribution</p>
          <p className="text-[8px] text-slate-400 font-medium mb-1">Volume by gateway.</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={22} outerRadius={38} paddingAngle={4} dataKey="value">
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {paymentData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[8px] font-bold text-slate-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alerts — matching real app's "Quick Alerts" card */}
      <div className="mx-4 mb-4 rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <p className="text-[9px] font-black text-slate-700">Quick Alerts</p>
          <p className="text-[8px] text-slate-400">Critical notifications and stock warnings.</p>
        </div>
        <div className="p-3 space-y-2">
          {lowStock.map((p) => (
            <div key={p.name} className="flex items-center justify-between p-2.5 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500 rounded-lg text-white">
                  <Package className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-red-900">{p.name}</p>
                  <p className="text-[8px] text-red-500 font-semibold uppercase tracking-widest">Low Stock Alert</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-red-600">{p.stock}</p>
                <p className="text-[8px] font-bold text-red-400 uppercase">Units Left</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Exported Hero Section ────────────────────────────────────
export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-background pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_60%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* LEFT: Text */}
          <div className="flex-1 space-y-7 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black tracking-[0.18em] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Built for Online Retailers
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[1.05]">
              The POS platform for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-500 to-indigo-600">
                selling smarter online.
              </span>
            </h1>

            <p className="text-sm lg:text-base text-muted-foreground font-medium leading-relaxed max-w-md lg:max-w-none">
              Stop managing orders in chat apps and stock in spreadsheets. Upgrade to a modern Point of Sale (POS) system offering complete inventory management, digital receipts, and actionable analytics — built for social sellers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/login"
                className="group h-12 px-7 bg-primary text-primary-foreground rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Start 1-Month Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="h-12 px-7 bg-card text-foreground border border-border rounded-xl font-bold text-sm hover:bg-muted/50 transition-all flex items-center justify-center"
              >
                See All Features
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground justify-center lg:justify-start pt-1">
              <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary" /> Receipts via Messenger</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Setup in 10 minutes</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-primary" /> Live analytics</span>
            </div>
          </div>

          {/* RIGHT: Real dashboard preview */}
          <div className="flex-1 w-full order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 rounded-[2.5rem] blur-2xl" />
              <div className="relative">
                <HeroDashboardPreview />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
