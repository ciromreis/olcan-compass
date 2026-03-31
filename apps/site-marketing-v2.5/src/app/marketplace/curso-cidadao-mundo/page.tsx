import { Metadata } from 'next';
import { ProductPageTemplate } from '@/components/templates/ProductPageTemplate';
// Icons now passed as strings to ProductPageTemplate
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';

export const metadata: Metadata = {
  title: 'Curso Cidadão do Mundo',
  description: 'Encontros ao vivo 3x por semana com orientação prática para processos seletivos internacionais. Acesso às gravações e materiais exclusivos.',
  openGraph: {
    title: 'Curso Cidadão do Mundo | Olcan',
    description: 'Sua jornada internacional começa aqui. Aprenda com especialistas e transforme seu sonho global em realidade.',
  }
};

export default function CursoCidadaoMundoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />
      
      <ProductPageTemplate
        name="Curso Cidadão do Mundo"
        tagline="Sua jornada internacional começa aqui"
        description="Encontros ao vivo 3x por semana com orientação prática para processos seletivos internacionais. Acesso completo às gravações, materiais exclusivos e comunidade de apoio."
        price={497}
        category="Educação Internacional"
        duration="12 semanas"
        format="Aulas ao vivo + Gravações"
        level="Todos os níveis"
        enrollmentLink="/checkout/curso-cidadao-mundo"
        
        benefits={[
          {
            icon: "Globe",
            title: "Visão Global Completa",
            description: "Entenda os processos de mobilidade internacional de forma clara e estruturada, desde vistos até oportunidades de trabalho."
          },
          {
            icon: "Users",
            title: "Networking Qualificado",
            description: "Conecte-se com profissionais que compartilham o mesmo objetivo e construa uma rede de apoio internacional."
          },
          {
            icon: "Video",
            title: "Aulas Ao Vivo",
            description: "Participe de encontros ao vivo 3x por semana com especialistas e tire suas dúvidas em tempo real."
          },
          {
            icon: "BookOpen",
            title: "Material Exclusivo",
            description: "Acesso a templates, checklists e guias práticos para cada etapa da sua jornada internacional."
          },
          {
            icon: "Map",
            title: "Roadmap Personalizado",
            description: "Desenvolva seu plano de ação personalizado com base no seu perfil e objetivos de carreira."
          },
          {
            icon: "Award",
            title: "Certificado de Conclusão",
            description: "Receba certificado ao completar o curso, validando seu conhecimento em mobilidade internacional."
          }
        ]}
        
        features={[
          {
            title: "36 Aulas Ao Vivo",
            description: "Encontros semanais (terça, quinta e sábado) com especialistas em mobilidade internacional, imigração e carreira global."
          },
          {
            title: "Acesso Vitalício às Gravações",
            description: "Todas as aulas ficam gravadas e disponíveis para você assistir quando e onde quiser, quantas vezes precisar."
          },
          {
            title: "Grupo Exclusivo no WhatsApp",
            description: "Comunidade ativa de alunos e ex-alunos para networking, troca de experiências e oportunidades."
          },
          {
            title: "Templates e Ferramentas",
            description: "Biblioteca completa com modelos de currículo internacional, cartas de motivação, checklists de documentação e planilhas de planejamento."
          },
          {
            title: "Sessões de Q&A",
            description: "Tire suas dúvidas diretamente com os instrutores em sessões dedicadas de perguntas e respostas."
          },
          {
            title: "Casos Reais e Práticos",
            description: "Aprenda com exemplos reais de processos bem-sucedidos e evite os erros mais comuns."
          },
          {
            title: "Atualizações Contínuas",
            description: "Conteúdo sempre atualizado com as últimas mudanças em legislação, vistos e oportunidades internacionais."
          },
          {
            title: "Suporte Dedicado",
            description: "Equipe de suporte disponível para ajudar com dúvidas técnicas e sobre o conteúdo do curso."
          }
        ]}
        
        testimonials={[
          {
            name: "Ana Paula S.",
            role: "Engenheira, agora em Portugal",
            content: "O curso me deu a clareza que eu precisava. Em 6 meses consegui meu visto de trabalho para Portugal. O networking foi essencial!",
            rating: 5
          },
          {
            name: "Ricardo M.",
            role: "Desenvolvedor, Canadá",
            content: "Investimento que valeu cada centavo. As aulas ao vivo e o material exclusivo me prepararam completamente para o processo.",
            rating: 5
          },
          {
            name: "Juliana F.",
            role: "Designer, Alemanha",
            content: "A comunidade é incrível! Conheci pessoas que me ajudaram muito no processo e hoje somos amigos na Alemanha.",
            rating: 5
          }
        ]}
        
        faqs={[
          {
            question: "Quanto tempo tenho acesso ao curso?",
            answer: "Você tem acesso vitalício a todas as gravações e materiais. As aulas ao vivo acontecem durante 12 semanas, mas você pode rever o conteúdo sempre que precisar."
          },
          {
            question: "Preciso ter nível avançado de inglês?",
            answer: "Não é necessário. O curso é ministrado em português e abordamos desde o básico até estratégias avançadas. Oferecemos também orientações sobre como melhorar seu inglês para processos internacionais."
          },
          {
            question: "O curso garante que vou conseguir um visto?",
            answer: "O curso fornece todo o conhecimento e ferramentas necessárias, mas o sucesso depende da sua aplicação e do seu perfil. Temos alta taxa de sucesso entre alunos que seguem as orientações."
          },
          {
            question: "Posso parcelar o pagamento?",
            answer: "Sim! Oferecemos parcelamento em até 12x no cartão de crédito sem juros, ou desconto de 10% para pagamento à vista."
          },
          {
            question: "E se eu não gostar do curso?",
            answer: "Oferecemos garantia incondicional de 7 dias. Se não ficar satisfeito, devolvemos 100% do seu investimento, sem perguntas."
          },
          {
            question: "O curso serve para qualquer país?",
            answer: "Sim! Abordamos processos para os principais destinos (Portugal, Canadá, Alemanha, EUA, Austrália) e os princípios se aplicam a qualquer país."
          },
          {
            question: "Vou ter certificado?",
            answer: "Sim! Ao completar o curso e as atividades propostas, você recebe um certificado de conclusão que pode adicionar ao seu LinkedIn e currículo."
          },
          {
            question: "Posso assistir as aulas depois se perder alguma ao vivo?",
            answer: "Com certeza! Todas as aulas são gravadas e ficam disponíveis na plataforma em até 24 horas após o encontro ao vivo."
          }
        ]}
      />
      
      <EnhancedFooter />
    </main>
  );
}
