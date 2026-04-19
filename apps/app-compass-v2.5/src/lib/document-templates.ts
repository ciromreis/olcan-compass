/**
 * Document Structure Templates
 * 
 * Provides structured guidance for different document types used in
 * international applications (scholarships, universities, jobs abroad).
 * Based on industry best practices for each document type.
 */

import type { DocType } from "@/stores/forge";

export interface DocumentSection {
  id: string;
  title: string;
  description: string;
  guidance: string;
  example?: string;
  wordCount?: {
    min: number;
    recommended: number;
    max: number;
  };
  required: boolean;
}

export interface DocumentTemplate {
  id: string;
  type: DocType;
  name: string;
  description: string;
  region?: string;
  forScholarship?: boolean;
  sections: DocumentSection[];
  tips: string[];
  commonMistakes: string[];
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "cv-standard",
    type: "cv",
    name: "Curriculo (Padrao Internacional)",
    description: "Curriculo estruturado para aplicacoes internacionais. Maximo 2 paginas.",
    region: "global",
    sections: [
      {
        id: "header",
        title: "Informacao de Contato",
        description: "Nome, localizacao, telefone, email, LinkedIn",
        guidance: "Use formato profissional. Inclua o LinkedIn e perfil no GitHub se aplicavel.",
        example: "Nome Sobrenome\nSao Paulo, Brasil\n+55 11 99999-9999 | email@email.com",
        required: true
      },
      {
        id: "summary",
        title: "Perfil Profissional",
        description: "Resumo de 3-4 linhas",
        guidance: "Destaque sua proposta de valor unica. Mencione anos de experiencia e area de especializacao.",
        example: "Profissional de tecnologia com 5 anos de experiencia em desenvolvimento full-stack...",
        wordCount: { min: 50, recommended: 80, max: 120 },
        required: false
      },
      {
        id: "experience",
        title: "Experiencia Profissional",
        description: "Experiencias em ordem cronologica reversa",
        guidance: "Use metodo STAR: Cargo, Empresa, Local, Datas. Acompanhe de bullets de conquistas com numeros.",
        example: "Tech Lead | Empresa XYZ | Sao Paulo\n2020 - Presente\n• Lider equipe de 8 desenvolvedores...",
        required: true
      },
      {
        id: "education",
        title: "Formacao Academica",
        description: "Grau mais alto primeiro",
        guidance: "Inclua curso, instituicao, ano de conclusao. Mencione relevantes se em andamento.",
        example: "Bacharel em Ciencia da Computacao | USP | 2018",
        required: true
      },
      {
        id: "skills",
        title: "Competencias",
        description: "Skills tecnicas e soft skills",
        guidance: "Agrupe por categoria. Seja especifico (nao 'programacao' mas 'Python, TypeScript').",
        required: true
      }
    ],
    tips: [
      "Use verbos de acao no inicio de cada bullet (Desenvolvi, Lider, Executei)",
      "Quantifique conquistas: % de melhoria, $ economizado, tempo reduzi",
      "Mantenha verbos no passado para experiencias passadas",
      "Evite lacunas temporais nao explicadas",
      "Customize para cada vaga — inclua keywords da descricao"
    ],
    commonMistakes: [
      "Colocar informacoes pessoais como estado civil ou CPF",
      "Usar fotos (padrao em muitos paises)",
      "Exceder 2 paginas",
      "Usar formatacao complexa que ATS nao le",
      "Escrever em primeira pessoa"
    ]
  },
  {
    id: "motivation-letter",
    type: "motivation_letter",
    name: "Carta de Motivacao",
    description: "Carta explicando porque voce e o candidato ideal. 250-400 palavras.",
    region: "EU",
    forScholarship: true,
    sections: [
      {
        id: "opener",
        title: "Introducao",
        description: "paragrafo de abertura",
        guidance: "Mencione a vaga/programa especifico e seu interesse. Capture atencao com uma conquista ou nome relevante.",
        example: "Com grande entusiasmo, apresento minha candidatura para o programa de Mestrado em Data Science...",
        wordCount: { min: 40, recommended: 60, max: 80 },
        required: true
      },
      {
        id: "motivation",
        title: "Motivacao",
        description: "Por que este programa/cargo",
        guidance: "Conecte sua historia pessoal com a missao da instituicao. Mostre que voce pesquisou.",
        example: "Minha paixao por IA comecou quando desenvolvi um sistema de recomendacao...",
        wordCount: { min: 80, recommended: 120, max: 180 },
        required: true
      },
      {
        id: "qualifications",
        title: "Qualificacoes",
        description: "Por que voce",
        guidance: "Destaque experiencias relevantes que mostram capacidade de contribuir.",
        example: "Durante minha experiencia na Empresa X, liderei projetos que resultaram em...",
        wordCount: { min: 80, recommended: 120, max: 180 },
        required: true
      },
      {
        id: "closer",
        title: "Conclusao",
        description: "Reafirme interesse e faca call-to-action",
        guidance: "Agradeça pela consideracao e expresse disponibilidade para entrevistas.",
        example: "Agradeço pela oportunidade de considerar minha candidatura. Estou disponivel para...",
        wordCount: { min: 30, recommended: 50, max: 70 },
        required: true
      }
    ],
    tips: [
      "Seja especifico — mencione nomes de professores, cursos, programas",
      "Conte uma historia pessoal autentica",
      "Mostre que voce conhece a instituicao",
      "Evite parafrases do CV — acrescente valores",
      "Mantenha tom profissional mas pessoal"
    ],
    commonMistakes: [
      "Repetir exatamente o que esta no CV",
      "Usar modelos genericos sem personalizacao",
      "Escrever demais (maximo 400 palavras)",
      "Esquecer de adaptar para cada aplicacao",
      "Nao revisar erros de gramatica"
    ]
  },
  {
    id: "statement-of-purpose",
    type: "statement_of_purpose",
    name: "Statement of Purpose (SOP)",
    description: "Essay formal para aplicacoes academicas. 500-1000 palavras.",
    region: "US/UK",
    forScholarship: true,
    sections: [
      {
        id: "background",
        title: "Contexto e Origens",
        description: "De onde voce vem",
        guidance: "Introduza sua jornada. Eventos que despertaram seu interesse na area.",
        wordCount: { min: 100, recommended: 150, max: 200 },
        required: true
      },
      {
        id: "academic-journey",
        title: "Jornada Academica",
        description: "Formacao e experiencias relevantes",
        guidance: "Conecte suas experiencias passadas com objetivos futuros.",
        wordCount: { min: 150, recommended: 250, max: 350 },
        required: true
      },
      {
        id: "research-interest",
        title: "Interesses de Pesquisa",
        description: "Areas de interesse especifico",
        guidance: "Mencione possiveis orientadores. Mostre conhecimento da area.",
        wordCount: { min: 100, recommended: 180, max: 250 },
        required: true
      },
      {
        id: "career-goals",
        title: "Objetivos de Carreira",
        description: "Planos futuros",
        guidance: "Seja especifico sobre o que voce quer fazer depois.",
        wordCount: { min: 80, recommended: 120, max: 180 },
        required: true
      },
      {
        id: "why-this-program",
        title: "Por Este Programa",
        description: "Por que esta instituicao",
        guidance: "Mostre que voce pesquisou especificamente este programa.",
        wordCount: { min: 80, recommended: 120, max: 150 },
        required: true
      }
    ],
    tips: [
      "Escreva em primeira pessoa (diferente de CV)",
      "Tenha uma narrativa coerente",
      "Evite cliches como 'sempre quis mudar o mundo'",
      "Seja vulnerable — mostre desafios superados",
      "Termine com visao clara de futuro"
    ],
    commonMistakes: [
      "Copiar motivacao generica",
      "Falar demais do passado e poco do futuro",
      "Nao mencionar especifico da instituicao",
      "Ser vago sobre objetivos",
      "Exceder limite de palavras"
    ]
  },
  {
    id: "personal-statement",
    type: "personal_statement",
    name: "Personal Statement",
    description: "Essay mais pessoal e narrativo. Frequentemente para bolsas de estudo.",
    region: "UK",
    forScholarship: true,
    sections: [
      {
        id: "intro",
        title: "Abertura Memoravel",
        description: "Hook que conecta com seu tema",
        guidance: "Uma historia curta, uma citacao, ou exemplo concreto que te define.",
        wordCount: { min: 30, recommended: 60, max: 100 },
        required: true
      },
      {
        id: "values",
        title: "Valores e Motivacao",
        description: "O que te move",
        guidance: "O que voce acredita e porque isso importa.",
        wordCount: { min: 80, recommended: 120, max: 180 },
        required: true
      },
      {
        id: "challenges",
        title: "Desafios Superados",
        description: "Obstaculos e resiliencia",
        guidance: "Se apropriado, compartilhe desafios que te moldaram.",
        wordCount: { min: 60, recommended: 100, max: 150 },
        required: false
      },
      {
        id: "future-vision",
        title: "Visao de Futuro",
        description: "O que voce quer alcancar",
        guidance: "Como voce quer contribuir para a sociedade.",
        wordCount: { min: 50, recommended: 80, max: 120 },
        required: true
      }
    ],
    tips: [
      "Mostre sua voz unica",
      "Evite frases feitas",
      "Seja genuino, nao performatico",
      "Conecte valores pessoais com objetivos academicos",
      "Deixe o leitor te conhecer como pessoa"
    ],
    commonMistakes: [
      "Ser generico ou vulgar",
      "Tentar impressionar demais",
      "Esquecer do foco pessoal",
      "Nao revisar",
      "Ser negativo"
    ]
  },
  {
    id: "research-proposal",
    type: "research_proposal",
    name: "Proposta de Pesquisa",
    description: "Proposta para programas de doutorado. 1000-3000 palavras.",
    region: "global",
    sections: [
      {
        id: "research-topic",
        title: "Topico de Pesquisa",
        description: "Area e tema especifico",
        guidance: "Seja especifico. Defina uma pergunta de pesquisa clara.",
        wordCount: { min: 150, recommended: 250, max: 400 },
        required: true
      },
      {
        id: "literature-review",
        title: "Revisao de Literatura",
        description: "Contexto academico",
        guidance: "Mostre que voce conhece o campo. Mencione trabalhos-chave.",
        wordCount: { min: 200, recommended: 400, max: 600 },
        required: true
      },
      {
        id: "methodology",
        title: "Metodologia",
        description: "Como voce vai pesquisar",
        guidance: "Descreva metodos, dados, abordagem analitica.",
        wordCount: { min: 150, recommended: 300, max: 500 },
        required: true
      },
      {
        id: "timeline",
        title: "Cronograma",
        description: "Milestones",
        guidance: "Como voce planeja executar em 3-4 anos.",
        example: "Ano 1: Revisao de literatura e coleta de dados\nAno 2: Analise...",
        required: true
      },
      {
        id: "contribution",
        title: "Contribuicao",
        description: "Impacto esperado",
        guidance: "O que este trabalho vai adicionar ao campo.",
        wordCount: { min: 100, recommended: 200, max: 300 },
        required: true
      }
    ],
    tips: [
      "Seja realista no cronograma",
      "Mostre conhecimento de literatura recente",
      "Escolha supervisor alinhado com seus interesses",
      "Tenha metodologia clara",
      "Justifique a relevancia"
    ],
    commonMistakes: [
      "Topico muito amplo",
      "Nao conhecer literatura",
      "Cronograma irrealista",
      "Metodo mal definido",
      "Nao explicar relevancia"
    ]
  },
  {
    id: "scholarship-essay",
    type: "scholarship_essay",
    name: "Essay de Bolsa de Estudos",
    description: "Essay para competencia de bolsas. Var conforme requirements.",
    region: "US/UK/EU",
    forScholarship: true,
    sections: [
      {
        id: "leadership",
        title: "Lideranca",
        description: "Experiencias de lideranca",
        guidance: "Mostre como voce liderou e impacto que gerou.",
        wordCount: { min: 100, recommended: 200, max: 300 },
        required: true
      },
      {
        id: "community",
        title: "Servico a Comunidade",
        description: "Impacto social",
        guidance: "Como voce contribui para comunidade. Seja especifico.",
        wordCount: { min: 100, recommended: 200, max: 300 },
        required: true
      },
      {
        id: "goals",
        title: "Objetivos",
        description: "Planos futuros",
        guidance: "Como a bolsa vai ajudar voce a alcancar objetivos.",
        wordCount: { min: 80, recommended: 150, max: 250 },
        required: true
      }
    ],
    tips: [
      "Siga as instrucoes exatamente",
      "Mostre impacto mensuravel",
      "Conecte com valores do organizador",
      "Seja autentico",
      "Revise multiplas vezes"
    ],
    commonMistakes: [
      "Nao seguir limite de palavras",
      "Ser generico",
      "Nao mostrar impacto",
      "Esquecer de agradecer",
      "Nao adaptar para cada bolsa"
    ]
  }
];

export function getTemplateForType(type: DocType): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find(t => t.type === type);
}

export function getTemplatesForScholarship(): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.forScholarship);
}

export function getCvTemplate(): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find(t => t.type === "cv");
}