"use client";

import { FileText, Briefcase, GraduationCap, Globe } from "lucide-react";
import { CVSection } from "./SectionEditor";

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  sections: Omit<CVSection, "id">[];
}

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "academic",
    name: "Acadêmico Internacional",
    description: "Para candidaturas a mestrado, doutorado e bolsas de pesquisa",
    icon: GraduationCap,
    sections: [
      {
        type: "header",
        title: "Informações Pessoais",
        content: "Nome Completo\nE-mail | Telefone | LinkedIn\nCidade, País",
        visible: true,
        order: 0,
      },
      {
        type: "summary",
        title: "Perfil Acadêmico",
        content: "Breve resumo da sua trajetória acadêmica e objetivos de pesquisa (2-3 linhas)",
        visible: true,
        order: 1,
      },
      {
        type: "education",
        title: "Formação Acadêmica",
        content: "Grau | Instituição | Período\nÁrea de concentração\nProjeto de conclusão ou dissertação\n\nGrau | Instituição | Período",
        visible: true,
        order: 2,
      },
      {
        type: "experience",
        title: "Experiência em Pesquisa",
        content: "Posição | Instituição | Período\n• Descrição das atividades e resultados\n• Metodologias utilizadas\n• Publicações ou apresentações",
        visible: true,
        order: 3,
      },
      {
        type: "skills",
        title: "Competências Técnicas",
        content: "• Metodologias de pesquisa\n• Ferramentas e softwares\n• Análise de dados",
        visible: true,
        order: 4,
      },
      {
        type: "languages",
        title: "Idiomas",
        content: "Português: Nativo\nInglês: Avançado (TOEFL 100+)\nAlemão: Intermediário (B2)",
        visible: true,
        order: 5,
      },
    ],
  },
  {
    id: "professional",
    name: "Profissional Internacional",
    description: "Para vagas de trabalho no exterior e vistos de emprego",
    icon: Briefcase,
    sections: [
      {
        type: "header",
        title: "Informações de Contato",
        content: "Nome Completo\nE-mail Profissional | Telefone | LinkedIn | GitHub/Portfolio\nCidade, País",
        visible: true,
        order: 0,
      },
      {
        type: "summary",
        title: "Resumo Profissional",
        content: "Profissional com X anos de experiência em [área]. Especializado em [competências-chave]. Buscando oportunidades em [objetivo].",
        visible: true,
        order: 1,
      },
      {
        type: "experience",
        title: "Experiência Profissional",
        content: "Cargo | Empresa | Período\n• Responsabilidade principal com resultado mensurável\n• Projeto relevante e impacto\n• Tecnologias e metodologias utilizadas\n\nCargo | Empresa | Período\n• Conquistas e contribuições",
        visible: true,
        order: 2,
      },
      {
        type: "education",
        title: "Formação",
        content: "Grau | Instituição | Ano de conclusão\nÁrea de estudo",
        visible: true,
        order: 3,
      },
      {
        type: "skills",
        title: "Competências Técnicas",
        content: "• Linguagens de programação\n• Frameworks e ferramentas\n• Soft skills relevantes",
        visible: true,
        order: 4,
      },
      {
        type: "languages",
        title: "Idiomas",
        content: "Português: Nativo\nInglês: Fluente (C1)\nEspanhol: Intermediário",
        visible: true,
        order: 5,
      },
    ],
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "CV limpo e direto, ideal para áreas criativas e tech",
    icon: FileText,
    sections: [
      {
        type: "header",
        title: "Cabeçalho",
        content: "Nome\nE-mail | Portfolio | LinkedIn",
        visible: true,
        order: 0,
      },
      {
        type: "experience",
        title: "Experiência",
        content: "Cargo @ Empresa | Período\nDescrição concisa do impacto e resultados",
        visible: true,
        order: 1,
      },
      {
        type: "education",
        title: "Formação",
        content: "Grau | Instituição | Ano",
        visible: true,
        order: 2,
      },
      {
        type: "skills",
        title: "Habilidades",
        content: "Competência 1 • Competência 2 • Competência 3",
        visible: true,
        order: 3,
      },
    ],
  },
  {
    id: "multilingual",
    name: "Multilíngue Global",
    description: "Para candidatos com forte perfil internacional e múltiplos idiomas",
    icon: Globe,
    sections: [
      {
        type: "header",
        title: "Contact Information",
        content: "Full Name\nEmail | Phone | LinkedIn\nCity, Country | Willing to relocate",
        visible: true,
        order: 0,
      },
      {
        type: "summary",
        title: "Professional Summary",
        content: "International professional with experience across [countries/regions]. Proven track record in [key achievements].",
        visible: true,
        order: 1,
      },
      {
        type: "languages",
        title: "Languages",
        content: "Portuguese: Native\nEnglish: Fluent (C2 - IELTS 8.0)\nGerman: Advanced (C1 - TestDaF 5)\nSpanish: Intermediate (B2)",
        visible: true,
        order: 2,
      },
      {
        type: "experience",
        title: "International Experience",
        content: "Position | Company | Location | Period\n• Cross-cultural project management\n• Global team collaboration\n• Market expansion initiatives",
        visible: true,
        order: 3,
      },
      {
        type: "education",
        title: "Education",
        content: "Degree | Institution | Country | Year",
        visible: true,
        order: 4,
      },
      {
        type: "skills",
        title: "Core Competencies",
        content: "• International business development\n• Cross-cultural communication\n• Project management",
        visible: true,
        order: 5,
      },
    ],
  },
];

interface CVTemplatesSelectorProps {
  onSelectTemplate: (template: CVTemplate) => void;
  className?: string;
}

export function CVTemplatesSelector({ onSelectTemplate, className = "" }: CVTemplatesSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="font-heading text-h4 text-text-primary mb-2">
          Escolha um template de currículo
        </h3>
        <p className="text-body-sm text-text-secondary">
          Comece com uma estrutura profissional e personalize conforme necessário
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CV_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="card-surface p-5 text-left hover:-translate-y-0.5 transition-all border border-cream-300 hover:border-brand-400 hover:bg-brand-50/30 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                  <Icon className="w-6 h-6 text-brand-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-body font-semibold text-text-primary mb-1">
                    {template.name}
                  </h4>
                  <p className="text-caption text-text-secondary">
                    {template.description}
                  </p>
                  <p className="text-caption text-text-muted mt-2">
                    {template.sections.length} seções
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
