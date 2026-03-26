import { LandingHero } from "@/components/landing/hero"
import { LandingStats } from "@/components/landing/stats"
import { LandingFeatures } from "@/components/landing/features"
import { LandingHowItWorks } from "@/components/landing/how-it-works"
import { LandingContact } from "@/components/landing/contact"
import { LandingFooter } from "@/components/landing/footer"
import { LandingNav } from "@/components/landing/nav"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingStats />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  )
}
