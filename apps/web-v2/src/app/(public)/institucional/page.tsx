import { Building2, Users, BarChart3, Shield, ArrowRight } from "lucide-react";

export const metadata = { title: "Para Instituições" };

const BENEFITS = [
  { icon: Users, title: "Gestão de Coortes", description: "Acompanhe turmas inteiras em dashboards unificados com métricas de progresso por aluno." },
  { icon: BarChart3, title: "Analytics Institucional", description: "Relatórios de prontidão, taxa de sucesso e ROI do programa de internacionalização." },
  { icon: Shield, title: "Compliance e LGPD", description: "Dados criptografados, RLS por organização e auditoria completa de acessos." },
];

export default function InstitutionalPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="w-14 h-14 rounded-2xl bg-sage-50 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-7 h-7 text-sage-500" />
        </div>
        <h1 className="font-heading text-display text-text-primary mb-4">Mobilidade para sua instituição</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Universidades, escolas de idiomas e empresas usam o Compass para escalar seus programas de internacionalização com inteligência.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {BENEFITS.map((b) => (
          <div key={b.title} className="card-surface p-6">
            <div className="w-11 h-11 rounded-lg bg-sage-50 flex items-center justify-center mb-4">
              <b.icon className="w-5 h-5 text-sage-500" />
            </div>
            <h3 className="font-heading text-h4 text-text-primary mb-2">{b.title}</h3>
            <p className="text-body-sm text-text-secondary">{b.description}</p>
          </div>
        ))}
      </div>
      <div className="card-surface p-10 bg-gradient-to-br from-sage-500 to-sage-700 text-center noise-overlay relative overflow-hidden">
        <h2 className="font-heading text-h2 text-white mb-3 relative z-10">Agende uma demonstração</h2>
        <p className="text-body-lg text-sage-100 max-w-xl mx-auto mb-8 relative z-10">Nosso time mostra como o Compass pode transformar o programa de internacionalização da sua instituição.</p>
        <a href="/register/org" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-sage-600 font-heading font-bold hover:bg-cream-100 transition-colors shadow-lg">
          Solicitar Demo <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
