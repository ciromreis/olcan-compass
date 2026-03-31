import { Metadata } from 'next';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { ContactForm } from '@/components/forms/ContactForm';
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contato | Olcan',
  description: 'Entre em contato com a Olcan. Agende uma consulta gratuita e descubra como podemos ajudar na sua jornada internacional.',
};

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />
      
      <section className="pt-32 pb-20">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl md:text-7xl text-olcan-navy mb-6">
              Vamos Conversar
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Agende uma consulta gratuita e descubra como a Olcan pode acelerar sua jornada internacional
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8">
                <h3 className="font-bold text-2xl text-olcan-navy mb-6">
                  Outras formas de contato
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-olcan-navy mb-1">Email</div>
                      <a href="mailto:contato@olcan.com.br" className="text-brand-600 hover:text-brand-700">
                        contato@olcan.com.br
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-olcan-navy mb-1">WhatsApp</div>
                      <a href="https://wa.me/5511999999999" className="text-brand-600 hover:text-brand-700">
                        +55 11 99999-9999
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-olcan-navy mb-1">Horário de Atendimento</div>
                      <div className="text-text-secondary">
                        Segunda a Sexta: 9h às 18h<br />
                        Sábado: 9h às 13h
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-olcan-navy mb-1">Localização</div>
                      <div className="text-text-secondary">
                        São Paulo, Brasil<br />
                        Atendimento 100% online
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-8 text-white">
                <h3 className="font-bold text-2xl mb-4">
                  Consulta Gratuita de 30 Minutos
                </h3>
                <p className="text-white/90 mb-6">
                  Agende uma conversa sem compromisso para entender como podemos ajudar na sua jornada internacional.
                </p>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Análise do seu perfil e objetivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Recomendações personalizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Próximos passos claros</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <EnhancedFooter />
    </main>
  );
}
