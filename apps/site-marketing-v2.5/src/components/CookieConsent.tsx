"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent !== null) {
      setConsent(savedConsent === 'true');
    }
  }, []);

  const acceptCookies = () => {
    setConsent(true);
    localStorage.setItem('cookie-consent', 'true');
    
    // Enable Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  };

  const declineCookies = () => {
    setConsent(false);
    localStorage.setItem('cookie-consent', 'false');
    
    // Disable Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  };

  if (!mounted || consent !== null) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(1,19,56,0.15)] p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-olcan-navy mb-2">
                  Cookies e Privacidade
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. 
                  Ao continuar navegando, você concorda com nossa{' '}
                  <Link 
                    href="/politica-cookies" 
                    className="text-brand-blue hover:text-brand-blue-dark underline"
                  >
                    Política de Cookies
                  </Link>
                  {' '}e{' '}
                  <Link 
                    href="/politica-privacidade" 
                    className="text-brand-blue hover:text-brand-blue-dark underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={declineCookies}
                  className="px-6 py-2.5 bg-white border border-cream-300 text-text-primary font-medium rounded-lg hover:bg-cream-50 transition-colors"
                >
                  Recusar
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-6 py-2.5 bg-olcan-navy text-white font-semibold rounded-lg hover:bg-olcan-navy-light transition-colors shadow-md"
                >
                  Aceitar Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
