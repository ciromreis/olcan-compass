"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, Search, User, LogIn, ArrowRight, Star, Shield, Briefcase, Home, Info, Layers, BookOpen, MessageCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function EnhancedNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/sobre", label: "Sobre", icon: Info },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/diagnostico", label: "Diagnóstico", icon: Compass },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/contato", label: "Contato", icon: MessageCircle },
  ];

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'liquid-glass shadow-lg border-b border-white/20' 
          : 'bg-white/40 backdrop-blur-md border-b border-white/10'
      }`}>
        <div className="container-site">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 transition-all duration-300">
            <Link 
              href="/" 
              className="flex items-center gap-3 group mr-4"
            >
              <div className="w-24 h-8 md:w-32 md:h-10 relative flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500">
                <Image src="/images/olcan-logo.png" alt="Olcan" fill className="object-contain brightness-[1.05] contrast-[1.05]" priority />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 label-xs transition-all duration-500 relative group/link ${
                    pathname === item.href
                      ? 'text-brand-600'
                      : 'text-olcan-navy/60 hover:text-olcan-navy'
                  }`}
                >
                  {item.icon && <item.icon className="w-3.5 h-3.5 group-hover/link:rotate-12 transition-transform duration-300" />}
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-brand-500 transition-all duration-500 ${pathname === item.href ? 'w-full' : 'w-0 group-hover/link:w-full'}`} />
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-3 rounded-2xl text-olcan-navy/60 hover:text-brand-600 hover:bg-white/60 hover:shadow-xl hover:shadow-olcan-navy/5 transition-all duration-500"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <Link 
                href="https://compass.olcan.com.br" 
                className="flex items-center gap-2 px-4 py-2 label-xs text-olcan-navy/60 hover:text-olcan-navy transition-all duration-500"
              >
                <User className="w-4 h-4" />
                Acessar
              </Link>
              
              <Link 
                href="/diagnostico" 
                className="btn-primary py-4 px-8 text-sm group"
              >
                Começar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-olcan-navy/70 hover:text-olcan-navy hover:bg-white/40 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/20 liquid-glass-strong shadow-2xl"
            >
              <div className="container-site py-8">
                <div className="relative max-w-2xl mx-auto group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olcan-navy/40 group-focus-within:text-olcan-navy transition-colors" />
                  <input
                    type="text"
                    placeholder="O que você está buscando?"
                    className="w-full pl-14 pr-14 py-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl text-olcan-navy placeholder:text-olcan-navy/30 focus:outline-none focus:ring-4 focus:ring-olcan-navy/5 focus:bg-white/60 transition-all text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-olcan-navy/30 hover:text-olcan-navy hover:bg-white/40 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-olcan-navy/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              variants={mobileMenuVariants}
              className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] liquid-glass-strong shadow-2xl flex flex-col border-r border-white/30"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="w-24 h-8 relative flex items-center justify-center">
                  <Image src="/images/olcan-logo.png" alt="Olcan" fill className="object-contain" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-olcan-navy/60 hover:text-olcan-navy hover:bg-white/40"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-2">
                  {navItems.map((item) => (
                    <motion.div key={item.href} variants={menuItemVariants}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                          pathname === item.href
                            ? 'bg-olcan-navy text-white shadow-lg'
                            : 'text-olcan-navy/70 hover:bg-white/40 hover:text-olcan-navy'
                        }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="p-6 border-t border-white/20">
                  <h3 className="text-[10px] font-bold text-olcan-navy/40 uppercase tracking-[0.2em] mb-4">Acesso Rápido</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowSearch(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-4 bg-white/30 rounded-2xl text-olcan-navy/80 hover:bg-white/50 transition-all border border-white/40"
                    >
                      <Search className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Buscar</span>
                    </button>
                    
                    <Link
                      href="/marketplace"
                      className="w-full flex items-center gap-3 px-5 py-4 bg-white/80 rounded-2xl text-olcan-navy shadow-sm hover:shadow-md transition-all border border-white/60"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Marketplace</span>
                    </Link>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="p-6 border-t border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center border border-white/50">
                        <Shield className="w-5 h-5 text-olcan-navy/60" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-olcan-navy">Segurança Olcan</p>
                        <p className="text-[9px] text-olcan-navy/50 font-medium">Protocolos Verificados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Footer */}
              <div className="p-6 border-t border-white/20 bg-white/20">
                <div className="space-y-3">
                  <Link
                    href="https://compass.olcan.com.br"
                    className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white/40 border border-white/60 text-olcan-navy text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-white/60 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Entrar
                  </Link>
                  <Link
                    href="/diagnostico"
                    className="btn-primary w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Começar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Spacer */}
      {(isMobileMenuOpen || showSearch) && (
        <div className="h-16 sm:h-20 lg:hidden" />
      )}
    </>
  );
}
