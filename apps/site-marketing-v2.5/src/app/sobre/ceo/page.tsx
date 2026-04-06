import { Metadata } from 'next';
import { Merriweather_Sans, Source_Sans_3 } from 'next/font/google';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { CeoHero } from '@/components/ceo/CeoHero';
import { TrustBar } from '@/components/ceo/TrustBar';
import { OriginStory, ImpactStats } from '@/components/ceo/OriginStory';
import { CeoTimeline } from '@/components/ceo/CeoTimeline';
import { MethodologySection, MissionBanner } from '@/components/ceo/MethodologySection';
import { SocialProof, MentorshipCTA } from '@/components/ceo/MentorshipCTA';
import { MediaGrid, ProductCrossSell, MinimalFooter } from '@/components/ceo/MediaGrid';
import { cn } from '@/lib/utils';

// Font definitions for the CEO page to match design tokens
const merriweatherSans = Merriweather_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-merriweather-sans',
  display: 'swap',
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '900'],
  variable: '--font-source-sans-3',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ciro Moraes dos Reis — CEO da Olcan | Quem está por trás do Compass',
  description: 'Advogado, Mestre pela London School of Economics, ex-TikTok. Ciro Moraes dos Reis construiu uma trajetória entre São Paulo, Londres e Washington para criar a Olcan.',
  openGraph: {
    title: 'Ciro Moraes dos Reis — CEO da Olcan',
    description: 'A trajetória do mestre pela LSE e ex-TikTok que agora guia a sua internacionalização.',
    images: ['/images/ceo-hero.png'],
    locale: 'pt_BR',
    type: 'profile',
  },
};

export default function CeoPage() {
  return (
    <main className={cn(
      "min-h-screen bg-[#FAFAF8] overflow-hidden antialiased selection:bg-olcan-navy selection:text-white font-sans",
      merriweatherSans.variable,
      sourceSans3.variable
    )}>
      <EnhancedNavbar />

      {/* Hero Section */}
      <CeoHero />

      {/* Credibility Bar */}
      <TrustBar />

      {/* Narrative Origin Story */}
      <OriginStory />

      {/* Impact Numbers */}
      <ImpactStats />

      {/* Detailed Trajectory */}
      <CeoTimeline />

      {/* Methodology Bridge */}
      <MethodologySection />

      {/* Social Proof / Testimonials */}
      <SocialProof />

      {/* Media Mentions */}
      <MediaGrid />

      {/* Deep Mission Banner */}
      <MissionBanner />

      {/* Mentorship Conversion Section */}
      <MentorshipCTA id="mentoria" />

      {/* Ecosystem Cross-sell */}
      <ProductCrossSell />

      {/* Specific Footer for the CEO page */}
      <MinimalFooter />
      
      {/* 
        Injecting CSS classes that use our variables. 
        Note: We avoid styled-jsx to prevent Server Component conflicts.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-display { font-family: var(--font-merriweather-sans), serif !important; }
        .font-body { font-family: var(--font-source-sans-3), sans-serif !important; }
      `}} />
    </main>
  );
}
