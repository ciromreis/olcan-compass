import { SocialProofSection } from "@/components/home/SocialProofSection";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import { HeroSection } from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import { MethodologyRoadmap } from "@/components/home/MethodologyRoadmap";
import { CompassSpotlight } from "@/components/home/CompassSpotlight";
import { BlogFeedSection } from "@/components/home/BlogFeedSection";
import { FinalConversionCTA } from "@/components/home/FinalConversionCTA";
import EnhancedFooter from "@/components/layout/EnhancedFooter";
import { getMercurProducts } from "@/lib/mercur-client";
import { getPublishedPageBySlug } from "@/lib/cms";

export default async function Home() {
  const products = await getMercurProducts({ limit: 8 });

  return (
    <main className="min-h-screen bg-cream selection:bg-[#d8dee8] selection:text-[#001338]">
      <EnhancedNavbar />
      
      {/* Hero Section with Video Card */}
      <HeroSection />
      
      {/* Streamlined Homepage Sections */}
      <ProductsSection products={products} />
      <MethodologyRoadmap />
      <CompassSpotlight />
      <SocialProofSection />
      <BlogFeedSection />
      <FinalConversionCTA />
      
      <EnhancedFooter />

      {/* Global Grain Overlay (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.06] bg-hero-grain mix-blend-overlay" />
    </main>
  );
}
