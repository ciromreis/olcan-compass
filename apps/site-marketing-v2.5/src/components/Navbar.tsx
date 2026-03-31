"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/jornadas", label: "Jornadas" },
  { href: "/produtos", label: "Produtos" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/para-ongs", label: "Para ONGs" },
  { href: "/sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="section-wrapper flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flame-icon text-2xl">🔥</span>
          <span
            className={`font-heading font-extrabold text-xl tracking-tight transition-colors ${
              isScrolled ? "text-void" : "text-white"
            }`}
          >
            Olcan
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link px-3 py-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-ink/70 hover:text-void hover:bg-void/5"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="https://compass.olcan.com.br"
            className={`text-sm font-body font-semibold transition-colors ${
              isScrolled ? "text-void hover:text-flame" : "text-white/80 hover:text-white"
            }`}
          >
            Entrar no Compass
          </Link>
          <Link href="/diagnostico" className="btn-primary text-sm px-5 py-2.5">
            Descobrir meu Arquétipo
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled ? "text-void hover:bg-void/5" : "text-white hover:bg-white/10"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-clay-light/30 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink font-body font-medium py-2 px-3 rounded-lg hover:bg-void/5 hover:text-void transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-clay-light/30 flex flex-col gap-2">
            <Link href="https://compass.olcan.com.br" className="btn-secondary text-sm text-center">
              Entrar no Compass
            </Link>
            <Link href="/diagnostico" className="btn-primary text-sm text-center">
              Descobrir meu Arquétipo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
