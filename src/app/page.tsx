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
  description: "Boost your business with Retail Master, the all-in-one Point of Sale (POS) platform designed to simplify inventory, sales, and CRM for social commerce and online retailers.",
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
