import Link from "next/link";
import { Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Navegação: [
    { href: "/", label: "Home" },
    { href: "/sobre", label: "Sobre" },
    { href: "/jornadas", label: "Jornadas" },
    { href: "/produtos", label: "Produtos" },
    { href: "/blog", label: "Blog" },
    { href: "/contato", label: "Contato" },
  ],
  Produtos: [
    { href: "/produtos/rota", label: "Rota da Internacionalização" },
    { href: "/produtos/kit", label: "Kit Application" },
    { href: "/produtos/curso", label: "Curso Além das Fronteiras" },
    { href: "/produtos/compass", label: "Compass (SaaS)" },
    { href: "/produtos/mentoria", label: "Mentoria 1:1" },
  ],
  Jornadas: [
    { href: "/jornadas/academica", label: "Acadêmica" },
    { href: "/jornadas/corporativa", label: "Corporativa" },
    { href: "/jornadas/nomade", label: "Nômade Digital" },
    { href: "/jornadas/bolsas", label: "Bolsas & Governo" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-void text-white">
      <div className="section-wrapper py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl">🔥</span>
              <span className="font-heading font-extrabold text-xl text-white">Olcan</span>
            </Link>
            <p className="text-white/60 font-body text-sm leading-relaxed max-w-xs mb-6">
              Democratizando o acesso a oportunidades internacionais para brasileiros — sem precisar de rede de contatos privilegiada.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/olcanglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-flame transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://linkedin.com/company/olcan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-flame transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm font-body transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-white/50 text-xs font-body">
            <Mail size={13} />
            <a href="mailto:valentino@olcan.com.br" className="hover:text-white transition-colors">
              valentino@olcan.com.br
            </a>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs font-body">
            <Phone size={13} />
            <a href="https://wa.me/551199999999" className="hover:text-white transition-colors">
              WhatsApp disponível
            </a>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs font-body">
            <MapPin size={13} />
            <span>Av. Paulista 1636, São Paulo — SP</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-body">
            © {new Date().getFullYear()} Olcan Desenvolvimento Profissional e Inovador LTDA — CNPJ 59.006.653/0001-20
          </p>
          <div className="flex gap-4">
            <Link href="/termos" className="text-white/40 hover:text-white/70 text-xs font-body transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-white/40 hover:text-white/70 text-xs font-body transition-colors">
              Privacidade (LGPD)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
