import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsBar } from "@/components/stats-bar"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { PricingSection } from "@/components/pricing-section"
import { ArticlesSection } from "@/components/articles-section"
import { ProjectProgress } from "@/components/project-progress"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <HeroSection />
      <ProjectProgress />
      <TestimonialsSection />
      <PortfolioSection />
      <ServicesSection />
      <PricingSection />
      <ArticlesSection />
      {/* <ContactSection /> */}
      <Footer />
    </main>
  )
}
