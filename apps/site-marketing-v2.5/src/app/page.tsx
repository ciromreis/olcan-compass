import { SocialProofSection } from "@/components/home/SocialProofSection";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import { HeroSection } from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import AboutSection from "@/components/home/AboutSection";
import InsightsSection from "@/components/home/InsightsSection";
import { BlogFeedSection } from "@/components/home/BlogFeedSection";
import MarketplaceSection from "@/components/home/MarketplaceSection";
import ManifestoSection from "@/components/home/ManifestoSection";
import EnhancedFooter from "@/components/layout/EnhancedFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-cream selection:bg-[#d8dee8] selection:text-[#001338]">
      <EnhancedNavbar />
      
      {/* Homepage Sections */}
      <HeroSection />
      <ProductsSection />
      <AboutSection />
      <ManifestoSection />
      <InsightsSection />
      <BlogFeedSection />
      <MarketplaceSection />
      <SocialProofSection />
      
      {/* Optional: Add spacing or spacer components if needed between sections */}
      
      <EnhancedFooter />

      {/* Global Grain Overlay (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.06] bg-hero-grain mix-blend-overlay" />
    </main>
  );
}
