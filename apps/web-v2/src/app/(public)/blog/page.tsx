import { Calendar, Clock } from "lucide-react";

export const metadata = { title: "Blog" };

const POSTS = [
  { title: "Como calcular o verdadeiro custo de emigrar", excerpt: "Além da passagem: visto, moradia inicial, reserva de emergência e o custo invisível da inação.", date: "2025-12-15", readTime: "8 min", tag: "Finanças" },
  { title: "5 erros fatais em cartas de motivação para mestrado", excerpt: "Analisamos 500+ cartas com IA e identificamos os padrões que mais eliminam candidatos.", date: "2025-12-10", readTime: "6 min", tag: "Documentos" },
  { title: "Simulador de entrevista: como a IA pode te preparar melhor", excerpt: "Treinar com perguntas reais e receber feedback instantâneo muda completamente o jogo.", date: "2025-12-05", readTime: "5 min", tag: "Entrevistas" },
  { title: "O que é o Score de Certeza e por que ele importa", excerpt: "Uma métrica composta que combina 4 dimensões da sua jornada em um número acionável.", date: "2025-11-28", readTime: "7 min", tag: "Plataforma" },
  { title: "Marketplace de imigração: como escolher o profissional certo", excerpt: "PEI, avaliações reais e escrow — os 3 filtros que garantem que você não jogue dinheiro fora.", date: "2025-11-20", readTime: "6 min", tag: "Marketplace" },
  { title: "Bolsas de estudo em 2026: calendário completo", excerpt: "Datas de abertura, requisitos e estratégias para as principais bolsas da Europa e América do Norte.", date: "2025-11-15", readTime: "10 min", tag: "Bolsas" },
];

export default function BlogPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="font-heading text-display text-text-primary mb-4">Blog</h1>
        <p className="text-body-lg text-text-secondary">Insights, guias e análises sobre mobilidade internacional</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POSTS.map((post) => (
          <article key={post.title} className="card-surface p-6 flex flex-col group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-caption font-medium px-2 py-0.5 rounded-full bg-moss-50 text-moss-500">{post.tag}</span>
            </div>
            <h3 className="font-heading text-h4 text-text-primary mb-2 group-hover:text-moss-500 transition-colors">{post.title}</h3>
            <p className="text-body-sm text-text-secondary flex-1 mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-caption text-text-muted">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
