import { Metadata } from 'next';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';

export const metadata: Metadata = {
  title: 'Termos de Uso | Olcan',
  description: 'Termos de uso da plataforma Olcan.',
  robots: { index: true, follow: true },
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />

      <section className="pt-32 pb-20">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-4xl">
          <h1 className="font-display text-5xl md:text-6xl text-olcan-navy mb-4 leading-tight">
            Termos de Uso
          </h1>
          <p className="text-olcan-navy/50 mb-16 text-sm uppercase tracking-widest font-bold">
            Última atualização: Janeiro de 2026
          </p>

          <div className="prose prose-lg max-w-none space-y-12 text-olcan-navy/80">
            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">1. Aceitação dos Termos</h2>
              <p className="leading-relaxed">
                Ao acessar e utilizar os serviços da Olcan (&ldquo;Plataforma&rdquo;), você concorda com estes
                Termos de Uso. Se não concordar com qualquer disposição, não utilize nossa plataforma.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">2. Descrição dos Serviços</h2>
              <p className="leading-relaxed">
                A Olcan oferece cursos, mentorias e ferramentas digitais voltadas para a
                internacionalização profissional de brasileiros. Os serviços incluem conteúdo
                educacional, orientação de carreira e acesso à plataforma Olcan Compass.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">3. Cadastro e Responsabilidades</h2>
              <p className="leading-relaxed">
                O usuário é responsável pela veracidade das informações fornecidas no cadastro e
                pela segurança de suas credenciais de acesso. É vedado o compartilhamento de contas
                entre múltiplos usuários.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">4. Propriedade Intelectual</h2>
              <p className="leading-relaxed">
                Todo o conteúdo disponível na plataforma — incluindo textos, vídeos, metodologias,
                marcas e sistemas proprietários — é propriedade exclusiva da Olcan e está protegido pela
                legislação de direitos autorais. É proibida a reprodução sem autorização prévia por escrito.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">5. Política de Reembolso</h2>
              <p className="leading-relaxed">
                Produtos digitais têm direito a reembolso integral em até 7 (sete) dias corridos após
                a compra, conforme o Código de Defesa do Consumidor (Art. 49, Lei 8.078/90).
                Serviços de mentoria já realizados não são reembolsáveis.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">6. Limitação de Responsabilidade</h2>
              <p className="leading-relaxed">
                A Olcan não garante resultados específicos em processos de imigração ou seleção
                profissional. Os serviços têm caráter orientativo e educacional. Decisões finais sobre
                vistos e candidaturas são de responsabilidade exclusiva do usuário e das autoridades competentes.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">7. Foro</h2>
              <p className="leading-relaxed">
                Fica eleito o foro da Comarca de São Paulo, SP, Brasil, para dirimir quaisquer
                controvérsias decorrentes destes Termos, com renúncia a qualquer outro, por mais
                privilegiado que seja.
              </p>
            </div>

            <div className="pt-8 border-t border-olcan-navy/10">
              <p className="text-sm text-olcan-navy/50">
                Dúvidas? Entre em contato: {' '}
                <a href="mailto:contato@olcan.com.br" className="text-brand-600 hover:text-brand-700">
                  contato@olcan.com.br
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </main>
  );
}
