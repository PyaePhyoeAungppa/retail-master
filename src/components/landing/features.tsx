"use client"

import { 
  Package, 
  BarChart3, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Users2 
} from "lucide-react"

const features = [
  {
    title: "Inventory Management",
    description: "Real-time stock tracking with automated low-stock alerts and category organization.",
    icon: Package,
    color: "bg-blue-500"
  },
  {
    title: "Advanced Analytics",
    description: "Visualize sales trends, profit margins, and peak hours with built-in BI tools.",
    icon: BarChart3,
    color: "bg-emerald-500"
  },
  {
    title: "Multi-Store Sync",
    description: "Manage multiple locations from a single dashboard with global stock visibility.",
    icon: Layers,
    color: "bg-purple-500"
  },
  {
    title: "Lightning Fast POS",
    description: "Optimized checkout experience that works even with thousands of products.",
    icon: Zap,
    color: "bg-amber-500"
  },
  {
    title: "Secure & Reliable",
    description: "Enterprise-grade security with Supabase integration and role-based access.",
    icon: ShieldCheck,
    color: "bg-rose-500"
  },
  {
    title: "Customer CRM",
    description: "Track purchase history and manage loyalty programs directly from the terminal.",
    icon: Users2,
    color: "bg-indigo-500"
  }
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-6 mx-auto">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">
            Everything you need to <span className="text-primary">scale faster.</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            Retail Master combines the power of an enterprise ERP with the simplicity 
            of a modern web application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-card border border-border rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ${feature.color} group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
