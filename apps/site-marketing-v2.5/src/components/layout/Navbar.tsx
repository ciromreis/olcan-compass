"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { name: 'OIOS Framework', href: '/framework' },
  { name: 'Produtos', href: '/produtos' },
  { name: 'Manifesto', href: '/sobre' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[100] pt-6 px-4 md:px-8 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`
            flex items-center justify-between px-6 py-4 rounded-full
            bg-white/50 backdrop-blur-xl border border-white/60 
            transition-all duration-500
            ${isScrolled ? 'shadow-sm shadow-ink/5 translate-y-0' : 'translate-y-2'}
          `}
        >
          {/* Logo Group */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-ink rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-12 shadow-sm">
              <span className="text-cream font-display text-xl leading-none">O</span>
            </div>
            <span className="font-display text-2xl tracking-tight text-ink">
              Olcan.
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 bg-white/40 px-6 py-2 rounded-full border border-white/50">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-ink/70 hover:text-flame transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link 
              href="/diagnostico"
              className="hidden sm:flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-flame transition-all hover:shadow-lg hover:shadow-flame/20 group"
            >
              <span>Começar Jornada</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button 
              className="md:hidden p-2 text-ink hover:text-flame transition-colors bg-white/50 rounded-full"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[110] bg-cream/90 flex flex-col p-8 pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-ink rounded-full flex items-center justify-center">
                  <span className="text-cream font-display text-xl leading-none">O</span>
                </div>
                <span className="font-display text-2xl tracking-tight text-ink">Olcan.</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-ink bg-white/50 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    className="font-display text-4xl text-ink hover:text-flame transition-colors block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  href="/diagnostico"
                  className="mt-8 bg-flame text-white py-5 px-6 rounded-full text-center font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-flame/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Começar Jornada Agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
