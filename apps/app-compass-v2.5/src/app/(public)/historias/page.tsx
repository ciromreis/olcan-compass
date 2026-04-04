import { Quote, MapPin, GraduationCap, Briefcase, Star } from "lucide-react";

export const metadata = { title: "Histórias de Sucesso" };

const STORIES = [
  { name: "Marina S.", from: "São Paulo", to: "Berlim", route: "Bolsa de Mestrado", quote: "O Compass me mostrou que eu estava perdendo R$47/dia em custo de inação. Em 8 meses, estava matriculada na TU Berlin.", score: 87, icon: GraduationCap },
  { name: "Rafael T.", from: "Belo Horizonte", to: "Dublin", route: "Relocação por Emprego", quote: "O simulador de entrevista me preparou tão bem que o recrutador comentou que eu era o candidato mais articulado do processo.", score: 92, icon: Briefcase },
  { name: "Camila L.", from: "Curitiba", to: "Toronto", route: "Startup Visa", quote: "Sem o marketplace, eu teria gasto o dobro em advogado. O escrow me deu segurança para confiar no processo.", score: 78, icon: Briefcase },
  { name: "Pedro M.", from: "Recife", to: "Amsterdã", route: "PhD em IA", quote: "A análise semântica da minha carta de motivação identificou 3 clichês que eu nunca teria notado. Fui aceito na UvA.", score: 95, icon: GraduationCap },
];

export default function SuccessStoriesPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-caption font-heading font-semibold tracking-widest uppercase text-brand-400 mb-3">Histórias Reais</p>
        <h1 className="font-heading text-display text-text-primary mb-4">Quem já chegou lá</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Brasileiros que usaram o Compass para transformar o sonho de morar fora em realidade calculada.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {STORIES.map((story) => (
          <div key={story.name} className="card-surface p-8 flex flex-col">
            <Quote className="w-8 h-8 text-cream-500 mb-4" />
            <p className="text-body text-text-primary italic flex-1 mb-6">&ldquo;{story.quote}&rdquo;</p>
            <div className="flex items-center justify-between pt-4 border-t border-cream-300">
              <div>
                <p className="font-heading font-semibold text-text-primary">{story.name}</p>
                <p className="text-caption text-text-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {story.from} → {story.to}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-brand-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-heading font-bold">{story.score}</span>
                </div>
                <p className="text-caption text-text-muted">Score de Certeza</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
