import { Smartphone, Store, Instagram, Mail } from "lucide-react"

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
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Built specifically for the Modern Online Merchant</h2>
          <p className="text-muted-foreground text-lg">
            Whether you sell through DMs, run a Shopify alternative, or manage multiple digital brands, this platform adapts to your workflow. No hardware required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 hover:border-primary/20 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <audience.icon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl mb-3">{audience.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
