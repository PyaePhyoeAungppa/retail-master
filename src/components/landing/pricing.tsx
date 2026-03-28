import { Check } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    description: "Perfect for new online sellers just starting out.",
    price: "$0",
    period: "forever",
    features: [
      "1 Storefront",
      "Up to 50 Products",
      "Basic Order Sharing",
      "Standard Analytics",
      "Community Support"
    ],
    cta: "Start for Free",
    popular: false,
    highlight: false,
  },
  {
    name: "Pro Seller",
    description: "Everything you need to run a growing digital boutique.",
    price: "$15",
    period: "per month",
    features: [
      "Up to 3 Storefronts",
      "Unlimited Products",
      "Smart Stock Tracking",
      "Custom Payment Accounts",
      "Advanced Sales Reports",
      "PDF & Email Receipts",
      "Priority Email Support"
    ],
    cta: "Start 14-Day Trial",
    popular: true,
    highlight: true,
  },
  {
    name: "Scale",
    description: "For high-volume merchants with dedicated teams.",
    price: "$49",
    period: "per month",
    features: [
      "Unlimited Storefronts",
      "Unlimited Products",
      "Multi-User Roles & Permissions",
      "API Access",
      "Custom Domain Receipts",
      "Dedicated Account Manager",
      "24/7 Phone Support"
    ],
    cta: "Contact Sales",
    popular: false,
    highlight: false,
  }
]

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 bg-background border-t border-black/5 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-5">
            Simple Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 leading-tight">
            Plans that grow with you.
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Start free, upgrade when your sales volume demands it. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative bg-card rounded-3xl p-8 border ${
                tier.highlight 
                ? "border-primary shadow-2xl shadow-primary/20 scale-105 z-10" 
                : "border-border shadow-sm"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-black mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground h-10">{tier.description}</p>
              </div>

              <div className="mb-8 flex items-end gap-1.5">
                <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                <span className="text-sm font-medium text-muted-foreground mb-2">/{tier.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-black text-sm transition-all active:scale-95 ${
                tier.highlight
                ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                : "bg-muted text-foreground hover:bg-muted/80"
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
