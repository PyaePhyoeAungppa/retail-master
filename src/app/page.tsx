import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingHowItWorks } from "@/components/landing/how-it-works"
import { LandingContact } from "@/components/landing/contact"
import { LandingFooter } from "@/components/landing/footer"
import { LandingNav } from "@/components/landing/nav"
import { LandingTargetAudience } from "@/components/landing/target-audience"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingFinalCTA } from "@/components/landing/final-cta"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Retail Master | Point of Sale (POS) System for Online Sellers",
  description: "Retail Master is a simple POS for online sellers to manage orders, track inventory, and send digital receipts. Stay organized, see your sales clearly, and run your store more efficiently—all in one place.",
  alternates: {
    canonical: "https://retailmaster.store",
  }
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTargetAudience />
        <LandingPricing />
        <LandingFinalCTA />
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  )
}
