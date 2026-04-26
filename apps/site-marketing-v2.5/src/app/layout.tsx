import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { CookieConsent } from '@/components/CookieConsent';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export const metadata: Metadata = {
  metadataBase: new URL(API_ENDPOINTS.site.base),
  title: {
    default: "Olcan | Capacitação Internacional",
    template: "%s | Olcan",
  },
  description:
    "Cursos, mentorias e ferramentas para sua mobilidade internacional. Transforme seu sonho de carreira global em realidade com a Olcan.",
  keywords: [
    "mobilidade internacional",
    "curso cidadão do mundo",
    "visto trabalho exterior",
    "carreira internacional",
    "emigração brasileiros",
    "internacionalização profissional",
    "mentoria internacional",
    "kit application",
  ],
  authors: [{ name: "Olcan" }],
  creator: "Olcan",
  publisher: "Olcan",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: API_ENDPOINTS.site.base,
    siteName: "Olcan",
    title: "Olcan | Capacitação Internacional",
    description:
      "Cursos, mentorias e ferramentas para sua mobilidade internacional. Transforme seu sonho de carreira global em realidade.",
    images: [
      {
        url: "/og?title=Olcan+%7C+Capacita%C3%A7%C3%A3o+Internacional&subtitle=Sua+Carreira+Sem+Fronteiras",
        width: 1200,
        height: 630,
        alt: "Olcan - Capacitação Internacional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@olcan",
    creator: "@olcan",
    title: "Olcan | Capacitação Internacional",
    description: "Cursos, mentorias e ferramentas para sua mobilidade internacional.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';
  const mauticUrl = process.env.NEXT_PUBLIC_MAUTIC_URL || '';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';

  return (
    <html lang="pt-BR">
      <head>
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Meta Pixel */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* Google Ads Conversion Tracking */}
        {googleAdsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              `}
            </Script>
          </>
        )}

        {/* Mautic Tracking Script */}
        {mauticUrl && (
          <Script
            id="mautic-tracking"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
                  w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
                  m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
                })(window,document,'script','${mauticUrl}/mtc.js','mt');
                mt('send', 'pageview');
              `,
            }}
          />
        )}
      </head>
      <body className="font-body antialiased bg-cream">
        {/* Meta Pixel noscript fallback */}
        {metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
      </body>
    </html>
  );
}
