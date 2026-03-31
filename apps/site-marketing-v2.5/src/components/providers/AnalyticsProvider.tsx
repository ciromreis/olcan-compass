"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, initScrollTracking } from '@/lib/analytics';
import { mautic } from '@/lib/mautic';

function AnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view in Google Analytics
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const title = document.title;
    
    trackPageView(url, title);

    // Track page view in Mautic
    mautic.trackPageView(url, title);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Initialize scroll depth tracking
    const cleanup = initScrollTracking();
    return cleanup;
  }, []);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracking />
      </Suspense>
      {children}
    </>
  );
}
