import { PsychProfile } from '@/store/psych';
import { calculateAnxietyScore, calculateAgencyScore } from './psych-adapter';

/**
 * Microcopy Engine - Generates contextual Portuguese text with Alchemical voice
 * 
 * Adapts text complexity and tone based on psychological state, balancing
 * prophetic insight with ironic self-awareness per MMXD philosophy.
 */

export type TextComplexity = 'simple' | 'moderate' | 'rich';
export type MessageType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'empty'
  | 'guidance';

/**
 * Determine appropriate text complexity based on psychological profile
 */
export function getTextComplexity(profile: PsychProfile | null): TextComplexity {
  if (!profile) return 'moderate';

  const anxietyScore = calculateAnxietyScore(profile);
  const agencyScore = calculateAgencyScore(profile);

  // High anxiety → simpler text to reduce cognitive load
  if (anxietyScore > 70) return 'simple';

  // High agency + low anxiety → richer, more nuanced text
  if (agencyScore > 70 && anxietyScore < 40) return 'rich';

  return 'moderate';
}

/**
 * Generate success message with Alchemical voice
 */
export function generateSuccessMessage(
  context: string,
  complexity: TextComplexity = 'moderate'
): string {
  const messages: Record<string, Record<TextComplexity, string>> = {
    'profile-updated': {
      simple: 'Perfil atualizado com sucesso.',
      moderate: 'Seu perfil foi atualizado. Cada passo conta.',
      rich: 'Perfil atualizado — a jornada se revela através de pequenas transformações.',
    },
    'route-created': {
      simple: 'Rota criada com sucesso.',
      moderate: 'Sua rota foi criada. O caminho começa aqui.',
      rich: 'Rota estabelecida — o mapa não é o território, mas é um começo necessário.',
    },
    'milestone-completed': {
      simple: 'Marco concluído!',
      moderate: 'Marco concluído. Continue avançando.',
      rich: 'Marco alcançado — celebre, mas não se apegue. O próximo já te chama.',
    },
    'narrative-saved': {
      simple: 'Narrativa salva.',
      moderate: 'Sua narrativa foi salva. As palavras ganham forma.',
      rich: 'Narrativa preservada — cada versão é um espelho de quem você está se tornando.',
    },
    'application-submitted': {
      simple: 'Candidatura enviada.',
      moderate: 'Candidatura enviada. Agora, a espera ativa.',
      rich: 'Candidatura lançada ao mundo — o resultado não define você, mas revela possibilidades.',
    },
  };

  return messages[context]?.[complexity] || 'Ação concluída com sucesso.';
}

/**
 * Generate error message with clear guidance (no blame)
 */
export function generateErrorMessage(
  context: string,
  complexity: TextComplexity = 'moderate'
): string {
  const messages: Record<string, Record<TextComplexity, string>> = {
    'network-error': {
      simple: 'Erro de conexão. Tente novamente.',
      moderate: 'Não foi possível conectar. Verifique sua internet e tente novamente.',
      rich: 'A conexão falhou — a tecnologia tem seus limites. Respire e tente de novo.',
    },
    'validation-error': {
      simple: 'Alguns campos precisam de correção.',
      moderate: 'Alguns campos precisam de atenção. Revise e tente novamente.',
      rich: 'Os detalhes importam — revise os campos marcados e ajuste conforme necessário.',
    },
    'auth-error': {
      simple: 'Erro de autenticação. Faça login novamente.',
      moderate: 'Sua sessão expirou. Por favor, faça login novamente.',
      rich: 'A sessão se dissolveu — faça login novamente para continuar sua jornada.',
    },
    'not-found': {
      simple: 'Conteúdo não encontrado.',
      moderate: 'O conteúdo que você procura não foi encontrado.',
      rich: 'O que você busca não está aqui — talvez nunca esteve, ou já seguiu adiante.',
    },
  };

  return messages[context]?.[complexity] || 'Algo deu errado. Tente novamente.';
}

/**
 * Generate empty state message with contextual next actions
 */
export function generateEmptyStateMessage(
  context: string,
  complexity: TextComplexity = 'moderate'
): { title: string; description: string; action: string } {
  const messages: Record<
    string,
    Record<TextComplexity, { title: string; description: string; action: string }>
  > = {
    'no-routes': {
      simple: {
        title: 'Nenhuma rota ainda',
        description: 'Crie sua primeira rota para começar.',
        action: 'Criar rota',
      },
      moderate: {
        title: 'Sua jornada aguarda',
        description: 'Escolha um template de rota para estruturar seu caminho.',
        action: 'Explorar templates',
      },
      rich: {
        title: 'O mapa está em branco',
        description:
          'Todo território inexplorado começa assim. Escolha um template e trace seu primeiro caminho.',
        action: 'Começar jornada',
      },
    },
    'no-narratives': {
      simple: {
        title: 'Nenhuma narrativa',
        description: 'Comece a escrever sua história.',
        action: 'Nova narrativa',
      },
      moderate: {
        title: 'Suas histórias esperam',
        description: 'Crie uma narrativa para dar forma às suas experiências.',
        action: 'Criar narrativa',
      },
      rich: {
        title: 'O papel em branco',
        description:
          'Toda grande história começa com a coragem de escrever a primeira palavra.',
        action: 'Começar a escrever',
      },
    },
    'no-applications': {
      simple: {
        title: 'Nenhuma candidatura',
        description: 'Explore oportunidades e candidate-se.',
        action: 'Ver oportunidades',
      },
      moderate: {
        title: 'Oportunidades te aguardam',
        description: 'Explore o catálogo e encontre oportunidades alinhadas com seu perfil.',
        action: 'Explorar oportunidades',
      },
      rich: {
        title: 'O futuro não se candidata sozinho',
        description:
          'Cada oportunidade é uma porta. Algumas se abrirão, outras não — mas você precisa bater.',
        action: 'Buscar oportunidades',
      },
    },
  };

  return (
    messages[context]?.[complexity] || {
      title: 'Nada aqui ainda',
      description: 'Comece adicionando conteúdo.',
      action: 'Adicionar',
    }
  );
}

/**
 * Generate guidance message for complex features
 */
export function generateGuidanceMessage(
  context: string,
  complexity: TextComplexity = 'moderate'
): string {
  const messages: Record<string, Record<TextComplexity, string>> = {
    'psych-assessment': {
      simple: 'Responda com honestidade. Não há respostas certas ou erradas.',
      moderate:
        'Este questionário ajuda a personalizar sua experiência. Responda com sinceridade.',
      rich: 'A autoavaliação é um espelho imperfeito, mas necessário. Seja honesto — o sistema se adapta a você.',
    },
    'mode-switch': {
      simple: 'Alterne entre Mapa (visão geral) e Forja (foco).',
      moderate:
        'Modo Mapa mostra tudo; Modo Forja foca no essencial. Escolha conforme sua necessidade.',
      rich: 'Mapa para ver o território; Forja para habitar o momento. Ambos são verdadeiros, ambos são limitados.',
    },
    'deadline-approaching': {
      simple: 'Prazo se aproximando. Organize suas tarefas.',
      moderate: 'O prazo está próximo. Priorize o que é essencial agora.',
      rich: 'O tempo não espera, mas também não julga. Foque no que importa, aceite o que não cabe.',
    },
  };

  return messages[context]?.[complexity] || 'Siga as instruções na tela.';
}

/**
 * Adapt button/CTA text based on complexity
 */
export function adaptCTAText(
  baseText: string,
  complexity: TextComplexity
): string {
  if (complexity === 'simple') {
    // Keep CTAs short and direct
    const simplifications: Record<string, string> = {
      'Começar jornada': 'Começar',
      'Explorar templates': 'Ver templates',
      'Criar narrativa': 'Criar',
      'Solicitar análise': 'Analisar',
    };
    return simplifications[baseText] || baseText;
  }

  return baseText;
}

/**
 * Generate contextual help text
 */
export function generateHelpText(
  feature: string,
  complexity: TextComplexity = 'moderate'
): string {
  const helpTexts: Record<string, Record<TextComplexity, string>> = {
    'route-milestones': {
      simple: 'Marcos são etapas da sua rota. Marque como concluído ao finalizar.',
      moderate:
        'Marcos estruturam sua jornada. Complete-os em ordem para desbloquear os próximos.',
      rich: 'Marcos são âncoras temporais — não prisões, mas referências. Adapte conforme necessário.',
    },
    'narrative-versions': {
      simple: 'Cada salvamento cria uma versão. Você pode comparar versões antigas.',
      moderate:
        'O sistema salva versões automaticamente. Acesse o histórico para comparar mudanças.',
      rich: 'Cada versão é um registro de quem você era ao escrever. O histórico não mente, mas também não conta toda a verdade.',
    },
  };

  return helpTexts[feature]?.[complexity] || '';
}
