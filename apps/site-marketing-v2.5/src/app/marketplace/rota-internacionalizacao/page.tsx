import { Metadata } from 'next';
import { ProductPageTemplate } from '@/components/templates/ProductPageTemplate';
// Icons now passed as strings to ProductPageTemplate
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';

export const metadata: Metadata = {
  title: 'Rota da Internacionalização',
  description: 'Planejamento estratégico completo para sua mobilidade internacional com roadmap detalhado e acompanhamento personalizado.',
  openGraph: {
    title: 'Rota da Internacionalização | Olcan',
    description: 'Seu caminho personalizado para a mobilidade internacional. Planejamento estratégico com acompanhamento mensal.',
  }
};

export default function RotaInternacionalizacaoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />
      
      <ProductPageTemplate
        name="Rota da Internacionalização"
        tagline="Seu caminho personalizado para o mundo"
        description="Planejamento estratégico completo e personalizado para sua mobilidade internacional. Receba um roadmap detalhado com todas as etapas, prazos e ações necessárias para alcançar seu objetivo de carreira global."
        price={997}
        category="Consultoria Estratégica"
        duration="6 meses de acompanhamento"
        format="1:1 Personalizado"
        level="Profissionais sérios"
        enrollmentLink="/checkout/rota-internacionalizacao"
        
        benefits={[
          {
            icon: "Map",
            title: "Roadmap Personalizado",
            description: "Receba um plano de ação completo e personalizado baseado no seu perfil, experiência e objetivos de carreira internacional."
          },
          {
            icon: "Target",
            title: "Objetivos Claros",
            description: "Defina metas realistas e alcançáveis com prazos específicos para cada etapa da sua jornada internacional."
          },
          {
            icon: "Calendar",
            title: "Acompanhamento Mensal",
            description: "Sessões mensais de revisão e ajuste do plano, garantindo que você está no caminho certo e progredindo."
          },
          {
            icon: "TrendingUp",
            title: "Otimização de Perfil",
            description: "Análise completa do seu perfil profissional com recomendações específicas para aumentar suas chances de sucesso."
          },
          {
            icon: "FileCheck",
            title: "Documentação Completa",
            description: "Lista detalhada de todos os documentos necessários para cada etapa, com templates e exemplos práticos."
          },
          {
            icon: "MessageCircle",
            title: "Suporte Prioritário",
            description: "Acesso direto via WhatsApp para tirar dúvidas urgentes e receber orientações rápidas quando precisar."
          }
        ]}
        
        features={[
          {
            title: "Diagnóstico Profundo",
            description: "Análise completa do seu perfil profissional, acadêmico e pessoal para identificar seus pontos fortes e áreas de melhoria."
          },
          {
            title: "Roadmap Estratégico de 12 Meses",
            description: "Plano de ação detalhado mês a mês com todas as etapas, documentos, prazos e ações necessárias para sua internacionalização."
          },
          {
            title: "6 Sessões de Acompanhamento",
            description: "Reuniões mensais de 1 hora via Zoom para revisar progresso, ajustar estratégias e resolver dúvidas."
          },
          {
            title: "Análise de Oportunidades",
            description: "Identificação das melhores oportunidades de trabalho, estudo ou empreendedorismo no exterior baseadas no seu perfil."
          },
          {
            title: "Estratégia de Networking",
            description: "Plano de ação para construir e ativar sua rede de contatos internacional, incluindo LinkedIn e eventos."
          },
          {
            title: "Preparação Financeira",
            description: "Orientações sobre planejamento financeiro, custos estimados e estratégias para viabilizar sua mudança."
          },
          {
            title: "Checklist de Documentação",
            description: "Lista completa e personalizada de todos os documentos que você precisará preparar, com prazos e prioridades."
          },
          {
            title: "Suporte via WhatsApp",
            description: "Acesso direto ao consultor via WhatsApp durante todo o período de acompanhamento para dúvidas urgentes."
          },
          {
            title: "Revisões Ilimitadas do Plano",
            description: "Ajustamos o roadmap quantas vezes forem necessárias conforme sua situação evolui ou surgem novas oportunidades."
          }
        ]}
        
        testimonials={[
          {
            name: "Carlos E.",
            role: "Gerente de TI, Irlanda",
            content: "O roadmap foi essencial. Segui cada etapa e em 8 meses estava com oferta de emprego na Irlanda. Valeu muito a pena!",
            rating: 5
          },
          {
            name: "Fernanda L.",
            role: "Arquiteta, Espanha",
            content: "O acompanhamento mensal me manteve focada e motivada. Sem esse suporte, teria desistido no meio do caminho.",
            rating: 5
          },
          {
            name: "Paulo R.",
            role: "Engenheiro, Austrália",
            content: "Investimento que se pagou sozinho. O plano personalizado economizou meses de pesquisa e tentativa e erro.",
            rating: 5
          }
        ]}
        
        faqs={[
          {
            question: "Qual a diferença entre este produto e o Curso Cidadão do Mundo?",
            answer: "O Curso é educacional e em grupo, focado em ensinar os conceitos. A Rota é consultoria individual e personalizada, com um plano de ação específico para o seu caso e acompanhamento direto."
          },
          {
            question: "Quanto tempo leva para ver resultados?",
            answer: "Depende do seu ponto de partida e objetivo. Em média, nossos clientes conseguem resultados concretos (ofertas de emprego, aprovação em vistos) entre 6 e 12 meses seguindo o roadmap."
          },
          {
            question: "Vocês garantem que vou conseguir um emprego no exterior?",
            answer: "Não podemos garantir resultados que dependem de terceiros, mas fornecemos todas as ferramentas, estratégias e suporte para maximizar suas chances. Nossa taxa de sucesso é superior a 80%."
          },
          {
            question: "Posso escolher o país de destino?",
            answer: "Sim! O roadmap é personalizado para o(s) país(es) que você deseja. Analisamos as melhores opções baseadas no seu perfil e objetivos."
          },
          {
            question: "E se eu mudar de ideia sobre o país durante o processo?",
            answer: "Sem problema! Ajustamos o roadmap conforme necessário. As sessões mensais servem exatamente para isso - revisar e adaptar o plano."
          },
          {
            question: "Preciso ter experiência internacional prévia?",
            answer: "Não! Atendemos desde profissionais sem experiência internacional até quem já teve experiências no exterior e quer otimizar o processo."
          },
          {
            question: "Quanto tempo de experiência profissional preciso ter?",
            answer: "Recomendamos pelo menos 2 anos de experiência profissional, mas analisamos cada caso individualmente. O importante é ter um objetivo claro."
          },
          {
            question: "Posso contratar apenas para um país específico?",
            answer: "Sim! Personalizamos o roadmap para o país ou países de seu interesse, focando nas especificidades de cada destino."
          }
        ]}
      />
      
      <EnhancedFooter />
    </main>
  );
}
