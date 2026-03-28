import { Smartphone, Store, Instagram, Mail } from "lucide-react"
import { MockReceiptPreview } from "./mock-receipt"

const audiences = [
  {
    icon: Instagram,
    title: "Social Commerce",
    description: "Perfect for Instagram, Facebook, and TikTok sellers. Share order links directly in DMs for instant checkout."
  },
  {
    icon: Smartphone,
    title: "Online Boutiques",
    description: "Run your entire clothing, beauty, or craft business from your phone without needing a physical terminal."
  },
  {
    icon: Store,
    title: "Multi-Brand Sellers",
    description: "Manage multiple online stores from a single account. Separate inventory, branding, and staff permissions."
  },
  {
    icon: Mail,
    title: "Wholesale & Dropship",
    description: "Generate professional PDF and image receipts, or send automated order summaries via email instantly."
  }
]

export function LandingTargetAudience() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-tight">
              Built specifically for the Modern Online Merchant
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Whether you sell through DMs, run a Shopify alternative, or manage multiple digital brands, this platform adapts to your workflow. No hardware required.
            </p>
          </div>
          <div className="lg:w-1/2 relative flex justify-center pb-12 pr-12 pt-6">
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] rotate-3 blur-sm" />
            <div className="relative z-10 w-full max-w-sm">
               <MockReceiptPreview />
            </div>
            {/* Pulsing visual to show it's active */}
            <div className="absolute top-1/2 right-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
            <div className="absolute bottom-1/4 left-10 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <div key={index} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-black/5 hover:border-primary/20 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <audience.icon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg sm:text-xl mb-3">{audience.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
