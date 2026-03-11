import { Scale, Languages, MessageSquare, GraduationCap, Heart, Truck, Star, Shield, ArrowRight } from "lucide-react";

export const metadata = { title: "Marketplace" };

const CATEGORIES = [
  { icon: Scale, title: "Assessoria Jurídica", count: 24, description: "Advogados de imigração especializados em vistos de trabalho, estudo e investidor" },
  { icon: Languages, title: "Tradução e Revisão", count: 31, description: "Tradutores juramentados e revisores nativos para documentos oficiais" },
  { icon: MessageSquare, title: "Coaching de Carreira", count: 18, description: "Coaches com experiência em processos seletivos internacionais" },
  { icon: GraduationCap, title: "Revisão Acadêmica", count: 12, description: "Especialistas em cartas de motivação, proposals e CVs acadêmicos" },
  { icon: Heart, title: "Apoio Psicológico", count: 9, description: "Psicólogos especializados em processos de expatriação e adaptação cultural" },
  { icon: Truck, title: "Relocation", count: 15, description: "Agentes de relocation para moradia, conta bancária e documentação local" },
];

export default function MarketplacePreviewPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-caption font-heading font-semibold tracking-widest uppercase text-clay-400 mb-3">Marketplace Verificado</p>
        <h1 className="font-heading text-display text-text-primary mb-4">Profissionais que você pode confiar</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Todos os profissionais são vetados, avaliados por outros usuários, e pagamentos são protegidos por escrow.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="card-surface p-6 group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="w-11 h-11 rounded-lg bg-clay-50 flex items-center justify-center mb-4 group-hover:bg-clay-100 transition-colors">
              <cat.icon className="w-5 h-5 text-clay-500" />
            </div>
            <h3 className="font-heading text-h4 text-text-primary mb-1">{cat.title}</h3>
            <p className="text-body-sm text-text-secondary mb-3">{cat.description}</p>
            <p className="text-caption text-brand-500 font-medium">{cat.count} profissionais disponíveis</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-8 card-surface">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-brand-500" />
          <div>
            <p className="font-heading font-semibold text-text-primary">Pagamento com Escrow</p>
            <p className="text-body-sm text-text-secondary">Dinheiro só é liberado quando o serviço é entregue</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-clay-500" />
          <div>
            <p className="font-heading font-semibold text-text-primary">Avaliações Reais</p>
            <p className="text-body-sm text-text-secondary">PEI — Índice de Efetividade calculado por IA</p>
          </div>
        </div>
      </div>
      <div className="text-center mt-10">
        <a href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-clay-500 text-white font-heading font-semibold hover:bg-clay-600 transition-colors shadow-md">
          Acessar Marketplace <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
