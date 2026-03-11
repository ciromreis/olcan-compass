import { Compass, Heart, Globe, Code } from "lucide-react";

export const metadata = { title: "Sobre" };

export default function AboutPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="font-heading text-display text-text-primary mb-4">Sobre o Olcan Compass</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Nascemos da frustração de ver brasileiros talentosos perderem oportunidades por falta de informação estruturada e apoio profissional acessível.</p>
      </div>
      <div className="space-y-8 mb-16">
        <div className="card-surface p-8">
          <h2 className="font-heading text-h3 text-text-primary mb-3">Nossa Missão</h2>
          <p className="text-body text-text-secondary">Democratizar a mobilidade internacional transformando um processo caótico e emocional em uma jornada calculada, mensurável e financeiramente otimizada. Acreditamos que qualquer pessoa com talento e disciplina merece acesso às mesmas ferramentas que antes só existiam para quem podia pagar consultores caros.</p>
        </div>
        <div className="card-surface p-8">
          <h2 className="font-heading text-h3 text-text-primary mb-3">Como pensamos</h2>
          <p className="text-body text-text-secondary mb-4">O Compass é construído sobre o conceito de <em className="text-emphasis text-brand-500">Metamodern Experience Design (MMXD)</em> — a interseção entre precisão clínica e empatia humana. Cada tela, cada métrica, cada interação é desenhada para reduzir ansiedade e aumentar agência.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-clay-500 mt-0.5 flex-shrink-0" />
              <div><p className="font-heading font-semibold text-body-sm text-text-primary">Empatia primeiro</p><p className="text-caption text-text-muted">Decisões grandes merecem apoio emocional real</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div><p className="font-heading font-semibold text-body-sm text-text-primary">Dados, não achismo</p><p className="text-caption text-text-muted">Fórmulas matemáticas validadas por resultados</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-sage-500 mt-0.5 flex-shrink-0" />
              <div><p className="font-heading font-semibold text-body-sm text-text-primary">Brasil para o mundo</p><p className="text-caption text-text-muted">Feito por brasileiros, para brasileiros</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
