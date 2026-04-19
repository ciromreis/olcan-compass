/**
 * Root Layout
 * Main layout with navigation
 */
import type { Metadata } from 'next';
import Script from 'next/script';
import { QueryProvider } from '@/providers/QueryProvider';
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Olcan Compass v2.5',
  description: 'Your personalized professional journey platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {process.env.NEXT_PUBLIC_MAUTIC_URL && (
          <Script
            id="mautic-tracking"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
                  w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
                  m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
                })(window,document,'script','${process.env.NEXT_PUBLIC_MAUTIC_URL}/mtc.js','mt');
                mt('send', 'pageview');
              `,
            }}
          />
        )}
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
