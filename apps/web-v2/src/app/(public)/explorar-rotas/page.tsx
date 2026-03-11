import { GraduationCap, Briefcase, FlaskConical, Rocket, Globe, ArrowRight, Clock, DollarSign, MapPin } from "lucide-react";

export const metadata = { title: "Explorar Rotas" };

const ROUTES = [
  { icon: GraduationCap, type: "Bolsa de Estudos", countries: "EUA, Reino Unido, Alemanha, Holanda", timeline: "6–18 meses", budget: "R$ 5k–30k", color: "moss" },
  { icon: Briefcase, type: "Relocação por Emprego", countries: "Canadá, Irlanda, Portugal, Austrália", timeline: "3–12 meses", budget: "R$ 15k–80k", color: "clay" },
  { icon: FlaskConical, type: "Pesquisa / PhD", countries: "Alemanha, Suíça, Japão, EUA", timeline: "12–24 meses", budget: "R$ 3k–20k", color: "sage" },
  { icon: Rocket, type: "Startup Visa", countries: "Canadá, Reino Unido, Estônia, Holanda", timeline: "6–18 meses", budget: "R$ 50k–200k", color: "clay" },
  { icon: Globe, type: "Intercâmbio", countries: "Austrália, Irlanda, Canadá, Malta", timeline: "3–12 meses", budget: "R$ 10k–50k", color: "moss" },
];

export default function ExploreRoutesPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-caption font-heading font-semibold tracking-widest uppercase text-brand-400 mb-3">Rotas de Mobilidade</p>
        <h1 className="font-heading text-display text-text-primary mb-4">Explore caminhos reais</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Cada rota é um grafo de dependências com milestones, custos estimados e prazos calculados com base em dados reais.</p>
      </div>
      <div className="grid gap-6">
        {ROUTES.map((route) => (
          <div key={route.type} className="card-surface p-6 flex flex-col md:flex-row md:items-center gap-5 group hover:-translate-y-0.5 transition-transform cursor-pointer">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${route.color === "moss" ? "bg-brand-50" : route.color === "clay" ? "bg-clay-50" : "bg-sage-50"}`}>
              <route.icon className={`w-6 h-6 ${route.color === "moss" ? "text-brand-500" : route.color === "clay" ? "text-clay-500" : "text-sage-500"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-h3 text-text-primary mb-1">{route.type}</h3>
              <div className="flex flex-wrap gap-4 text-body-sm text-text-secondary">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{route.countries}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{route.timeline}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{route.budget}</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <a href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors shadow-md">
          Criar conta para personalizar rotas <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
