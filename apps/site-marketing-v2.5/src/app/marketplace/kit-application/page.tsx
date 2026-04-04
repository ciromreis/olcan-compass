import { Metadata } from 'next';
import { ProductPageTemplate } from '@/components/templates/ProductPageTemplate';
// Icons now passed as strings to ProductPageTemplate
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';

export const metadata: Metadata = {
  title: 'Kit Application',
  description: 'Preparação completa de currículo, carta de motivação e documentos para processos seletivos internacionais com revisão profissional.',
};

export default function KitApplicationPage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />
      
      <ProductPageTemplate
        name="Kit Application"
        tagline="Documentos profissionais que abrem portas"
        description="Preparação completa de currículo internacional, carta de motivação e documentos essenciais para processos seletivos no exterior. Revisão profissional incluída."
        price={397}
        category="Preparação de Documentos"
        duration="Entrega em 7 dias"
        format="Revisão profissional"
        level="Todos os níveis"
        enrollmentLink="https://pay.hotmart.com/X85073158P"
        coverImage="/images/hero/corporate.png"
        
        benefits={[
          {
            icon: "FileText",
            title: "Currículo Internacional",
            description: "CV formatado nos padrões internacionais, otimizado para ATS e destacando suas conquistas de forma estratégica."
          },
          {
            icon: "Edit",
            title: "Carta de Motivação",
            description: "Cover letter personalizada que conta sua história de forma convincente e alinhada com a vaga desejada."
          },
          {
            icon: "CheckCircle",
            title: "Revisão Profissional",
            description: "Todos os documentos revisados por especialistas em recrutamento internacional e correção de inglês."
          },
          {
            icon: "Globe",
            title: "Adaptação Cultural",
            description: "Documentos adaptados para o país de destino, respeitando convenções locais e expectativas do mercado."
          },
          {
            icon: "Award",
            title: "Templates Premium",
            description: "Acesso a biblioteca de templates profissionais para diferentes áreas e níveis de experiência."
          },
          {
            icon: "Zap",
            title: "Entrega Rápida",
            description: "Receba seus documentos prontos em até 7 dias úteis, com suporte para ajustes e dúvidas."
          }
        ]}
        
        features={[
          {
            title: "Currículo Formato Internacional",
            description: "CV profissional formatado segundo padrões do país de destino (EUA, Europa, Canadá, etc.), otimizado para sistemas ATS."
          },
          {
            title: "Carta de Motivação Personalizada",
            description: "Cover letter única e convincente, adaptada para a vaga ou área de interesse, destacando suas motivações e qualificações."
          },
          {
            title: "LinkedIn Profile Optimization",
            description: "Otimização completa do seu perfil LinkedIn para atrair recrutadores internacionais e aumentar sua visibilidade."
          },
          {
            title: "2 Rodadas de Revisão",
            description: "Até 2 rodadas de ajustes incluídas para garantir que os documentos estejam perfeitos e alinhados com suas expectativas."
          },
          {
            title: "Consultoria de 1 Hora",
            description: "Sessão individual para entender seu perfil, objetivos e orientar sobre como usar os documentos de forma estratégica."
          },
          {
            title: "Templates Editáveis",
            description: "Receba os arquivos em formatos editáveis (Word, Google Docs) para futuras atualizações por conta própria."
          },
          {
            title: "Guia de Uso",
            description: "Manual completo sobre como adaptar os documentos para diferentes vagas e como se destacar em processos seletivos."
          },
          {
            title: "Suporte por 30 Dias",
            description: "Tire dúvidas e solicite pequenos ajustes durante 30 dias após a entrega dos documentos."
          }
        ]}
        
        testimonials={[
          {
            name: "Marina T.",
            role: "Marketing Manager, UK",
            content: "Meu CV anterior era ignorado. Com o novo currículo, consegui 3 entrevistas em 2 semanas. A diferença é gritante!",
            rating: 5
          },
          {
            name: "Bruno S.",
            role: "Software Engineer, Holanda",
            content: "A carta de motivação foi o diferencial. O recrutador mencionou especificamente como ela chamou atenção. Valeu muito!",
            rating: 5
          }
        ]}
        
        faqs={[
          {
            question: "Quanto tempo leva para receber os documentos?",
            answer: "Em até 7 dias úteis após o envio das suas informações e realização da consultoria inicial. Casos urgentes podem ser priorizados mediante taxa adicional."
          },
          {
            question: "Preciso ter os documentos em inglês?",
            answer: "Não! Você pode enviar em português. Nossos especialistas traduzem e adaptam todo o conteúdo para o inglês ou idioma desejado."
          },
          {
            question: "Posso solicitar ajustes depois da entrega?",
            answer: "Sim! Estão incluídas 2 rodadas de revisão e você tem 30 dias de suporte para pequenos ajustes e dúvidas."
          },
          {
            question: "Vocês fazem para qualquer área profissional?",
            answer: "Sim! Temos especialistas em diversas áreas: TI, Engenharia, Saúde, Educação, Marketing, Finanças, Design e outras."
          },
          {
            question: "E se eu não tiver experiência internacional?",
            answer: "Sem problema! Sabemos como destacar suas experiências locais de forma que sejam valorizadas internacionalmente."
          },
          {
            question: "Posso usar os documentos para várias vagas?",
            answer: "Sim! Criamos documentos base que você pode adaptar para diferentes vagas. Ensinamos como fazer essas adaptações."
          }
        ]}
      />
      
      <EnhancedFooter />
    </main>
  );
}
