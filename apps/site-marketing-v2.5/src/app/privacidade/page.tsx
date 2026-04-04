import { Metadata } from 'next';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Olcan',
  description: 'Política de privacidade e proteção de dados da Olcan.',
  robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />

      <section className="pt-32 pb-20">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-4xl">
          <h1 className="font-display text-5xl md:text-6xl text-olcan-navy mb-4 leading-tight">
            Política de Privacidade
          </h1>
          <p className="text-olcan-navy/50 mb-16 text-sm uppercase tracking-widest font-bold">
            Última atualização: Janeiro de 2026
          </p>

          <div className="prose prose-lg max-w-none space-y-12 text-olcan-navy/80">
            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">1. Dados que Coletamos</h2>
              <p className="leading-relaxed">
                Coletamos dados que você fornece diretamente (nome, e-mail, informações de perfil)
                e dados gerados automaticamente pelo uso da plataforma (páginas visitadas, interações,
                tempo de sessão). Não coletamos dados sensíveis sem consentimento explícito.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">2. Como Utilizamos seus Dados</h2>
              <ul className="space-y-3 leading-relaxed list-none pl-0">
                {[
                  'Personalizar sua experiência na plataforma Olcan Compass',
                  'Enviar comunicações relevantes sobre seus objetivos de internacionalização',
                  'Melhorar nossos produtos e serviços com base em dados agregados',
                  'Cumprir obrigações legais e regulatórias aplicáveis',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-brand-600 mt-1">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">3. Compartilhamento de Dados</h2>
              <p className="leading-relaxed">
                Não vendemos seus dados pessoais a terceiros. Podemos compartilhar dados com
                prestadores de serviço que nos auxiliam na operação da plataforma (hospedagem,
                pagamentos, análise), sempre sob acordos de confidencialidade e em conformidade
                com a LGPD.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">4. Cookies e Rastreamento</h2>
              <p className="leading-relaxed">
                Utilizamos cookies para melhorar a experiência de navegação e medir o desempenho
                do site (Google Analytics). Você pode recusar cookies não essenciais através do
                banner de consentimento exibido na sua primeira visita.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">5. Seus Direitos (LGPD)</h2>
              <p className="leading-relaxed mb-4">
                Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:
              </p>
              <ul className="space-y-2 leading-relaxed list-none pl-0">
                {[
                  'Confirmar a existência de tratamento de seus dados',
                  'Acessar seus dados',
                  'Corrigir dados incompletos, inexatos ou desatualizados',
                  'Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários',
                  'Revogar o consentimento a qualquer momento',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-brand-600 mt-1">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">6. Retenção de Dados</h2>
              <p className="leading-relaxed">
                Mantemos seus dados pelo período necessário para a prestação dos serviços e
                cumprimento de obrigações legais. Dados de contas encerradas são removidos em
                até 90 dias, salvo exigência legal em contrário.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-olcan-navy mb-4">7. Segurança</h2>
              <p className="leading-relaxed">
                Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
                contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos
                criptografia TLS para todas as transmissões de dados.
              </p>
            </div>

            <div className="pt-8 border-t border-olcan-navy/10">
              <p className="text-sm text-olcan-navy/50">
                Para exercer seus direitos ou esclarecer dúvidas:{' '}
                <a href="mailto:privacidade@olcan.com.br" className="text-brand-600 hover:text-brand-700">
                  privacidade@olcan.com.br
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
