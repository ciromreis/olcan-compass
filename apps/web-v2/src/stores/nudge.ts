import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserArchetype {
  id: string;
  name: string;
  description: string;
  traits: string[];
  fearTriggers: string[];
  motivationalStyle: string;
  color: string;
}

interface Momentum {
  currentStreak: number;
  longestStreak: number;
  inactiveDays: number;
  lastActivity: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface Nudge {
  id: string;
  type: string;
  title: string;
  message: string;
  actionCta: string;
  actionHref: string;
  shareable: boolean;
  timestamp: string;
  dismissed: boolean;
  shared: boolean;
}

interface NudgeStore {
  // State
  archetype: UserArchetype | null;
  momentum: Momentum;
  nudgeHistory: Nudge[];
  pendingNudges: Nudge[];
  
  // Actions
  setArchetype: (archetype: UserArchetype) => void;
  updateActivity: () => void;
  generateNudge: () => Nudge | null;
  dismissNudge: (nudgeId: string) => void;
  shareNudge: (nudgeId: string) => string | null;
  reset: () => void;
  
  // Getters
  getMomentumStatus: () => "active" | "warning" | "critical";
}

const ARCHETYPES: UserArchetype[] = [
  {
    id: "institutional_escapee",
    name: "O Fugitivo Institucional",
    description: "Sai de uma carreira estabelecida em busca de mais propósito e autonomia.",
    traits: ["visionário", "corajoso", "impaciente"],
    fearTriggers: ["perder status", "incerteza financeira", "arrependimento"],
    motivationalStyle: "autonomy",
    color: "text-purple-600"
  },
  {
    id: "scholarship_cartographer",
    name: "O Cartógrafo de Bolsas",
    description: "Mapeia sistematicamente todas as oportunidades acadêmicas disponíveis.",
    traits: ["analítico", "meticuloso", "estratégico"],
    fearTriggers: ["perder deadline", "escolha errada", "concorrência"],
    motivationalStyle: "achievement",
    color: "text-blue-600"
  },
  {
    id: "career_pivot",
    name: "O Mudador de Carreira",
    description: "Busca transição internacional para crescimento profissional e novas experiências.",
    traits: ["adaptável", "ambicioso", "pragmático"],
    fearTriggers: ["não ser reconhecido", "barreiras culturais", "estagnação"],
    motivationalStyle: "achievement",
    color: "text-green-600"
  },
  {
    id: "global_nomad",
    name: "O Nômade Global",
    description: "Busca liberdade de local e experiências culturais diversas.",
    traits: ["aventureiro", "flexível", "independente"],
    fearTriggers: ["solidão", "instabilidade", "burocracia"],
    motivationalStyle: "autonomy",
    color: "text-orange-600"
  }
];

const NUDGE_TEMPLATES = {
  momentum: {
    institutional_escapee: {
      title: "Sua liberdade está esperando",
      message: "Cada dia que você não age, sua vida institucional te puxa de volta. Dê um passo hoje em direção à sua autonomia.",
      actionCta: "Explorar Oportunidades",
      actionHref: "/opportunities",
      shareable: true
    },
    scholarship_cartographer: {
      title: "Nova bolsa encontrada",
      message: "Acabamos de identificar 3 novas bolsas que correspondem ao seu perfil. O prazo se aproxima!",
      actionCta: "Ver Bolsas",
      actionHref: "/opportunities",
      shareable: true
    },
    career_pivot: {
      title: "Sua próxima oportunidade",
      message: "Uma empresa internacional está procurando profissionais com seu perfil. Esta pode ser a chance que você esperava.",
      actionCta: "Ver Vaga",
      actionHref: "/opportunities",
      shareable: true
    },
    global_nomad: {
      title: "Aventura te chama",
      message: "O mundo está esperando por você. Que novo destino você explorará esta semana?",
      actionCta: "Explorar Destinos",
      actionHref: "/routes",
      shareable: true
    }
  },
  fear_reframe: {
    institutional_escapee: {
      title: "O status é uma gaiola dourada?",
      message: "Lembre-se: você deixou o status corporativo por uma razão. Sua liberdade vale mais do que qualquer título.",
      actionCta: "Reafirmar Objetivos",
      actionHref: "/profile/goals",
      shareable: false
    },
    scholarship_cartographer: {
      title: "Perfeccionismo paralisa",
      message: "Não deixe a busca pela bolsa 'perfeita' te impedir de aplicar para as 'boas'. Ação cria oportunidade.",
      actionCta: "Aplicar Agora",
      actionHref: "/applications/new",
      shareable: false
    },
    career_pivot: {
      title: "O desconhecido é onde cresce",
      message: "Cada profissional de sucesso já enfrentou a incerteza. Este é o caminho do crescimento, não do erro.",
      actionCta: "Continuar Jornada",
      actionHref: "/routes",
      shareable: false
    },
    global_nomad: {
      title: "Solidão escolhida é liberdade",
      message: "A solidão do nômade é diferente da solidão do isolado. Você está escolhendo seu caminho, não sendo esquecido.",
      actionCta: "Conectar Comunidade",
      actionHref: "/community",
      shareable: false
    }
  },
  achievement: {
    institutional_escapee: {
      title: "Você está 30% mais livre",
      message: "Comparado com há 6 meses, você reduziu sua dependência corporativa em 30%. Continue assim!",
      actionCta: "Ver Progresso",
      actionHref: "/dashboard",
      shareable: true
    },
    scholarship_cartographer: {
      title: "Mapeamento mestre",
      message: "Você já pesquisou 47 bolsas diferentes. Sua dedicação sistemática está construindo seu sucesso.",
      actionCta: "Ver Mapa",
      actionHref: "/applications",
      shareable: true
    },
    career_pivot: {
      title: "Pivot em progresso",
      message: "Suas habilidades internacionais estão 40% mais desenvolvidas. O mercado está notando.",
      actionCta: "Ver Skills",
      actionHref: "/profile/skills",
      shareable: true
    },
    global_nomad: {
      title: "Cidadão do mundo",
      message: "Você já explorou 12 destinos diferentes. Sua curiosidade está expandindo seus horizontes.",
      actionCta: "Ver Diário",
      actionHref: "/routes",
      shareable: true
    }
  }
};

const DEFAULT_MOMENTUM: Momentum = {
  currentStreak: 0,
  longestStreak: 0,
  inactiveDays: 0,
  lastActivity: new Date().toISOString(),
  weeklyGoal: 5,
  weeklyProgress: 0
};

export const useNudgeStore = create<NudgeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      archetype: null,
      momentum: DEFAULT_MOMENTUM,
      nudgeHistory: [],
      pendingNudges: [],

      // Actions
      setArchetype: (archetype) => {
        set({ archetype });
      },

      updateActivity: () => {
        const state = get();
        const now = new Date();
        const lastActivity = new Date(state.momentum.lastActivity);
        const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        const newMomentum: Momentum = {
          ...state.momentum,
          lastActivity: now.toISOString(),
          inactiveDays: daysSinceLastActivity,
          currentStreak: daysSinceLastActivity === 0 ? state.momentum.currentStreak + 1 : 0,
          longestStreak: Math.max(state.momentum.longestStreak, daysSinceLastActivity === 0 ? state.momentum.currentStreak + 1 : 0)
        };

        set({ momentum: newMomentum });
      },

      generateNudge: () => {
        const state = get();
        if (!state.archetype) return null;

        const templates = NUDGE_TEMPLATES;
        const archetypeId = state.archetype.id;
        
        // Select nudge type based on momentum
        let nudgeType: keyof typeof templates;
        if (state.momentum.inactiveDays >= 7) {
          nudgeType = "fear_reframe";
        } else if (state.momentum.currentStreak >= 3) {
          nudgeType = "achievement";
        } else {
          nudgeType = "momentum";
        }

        const template = templates[nudgeType][archetypeId as keyof typeof templates[typeof nudgeType]];
        
        if (!template) return null;

        const nudge: Nudge = {
          id: `nudge_${Date.now()}`,
          type: nudgeType,
          ...template,
          timestamp: new Date().toISOString(),
          dismissed: false,
          shared: false
        };

        set(prev => ({
          pendingNudges: [...prev.pendingNudges, nudge]
        }));

        return nudge;
      },

      dismissNudge: (nudgeId) => {
        set(prev => ({
          nudgeHistory: [...prev.nudgeHistory, ...prev.pendingNudges.filter(n => n.id === nudgeId).map(n => ({ ...n, dismissed: true }))],
          pendingNudges: prev.pendingNudges.filter(n => n.id !== nudgeId)
        }));
      },

      shareNudge: (nudgeId) => {
        const nudge = get().pendingNudges.find(n => n.id === nudgeId);
        if (!nudge || !nudge.shareable) return null;

        // Generate shareable URL (in real app, this would create a unique URL)
        const shareUrl = `https://compass.olcan.com.br/nudge/${nudgeId}`;
        
        set(prev => ({
          nudgeHistory: [...prev.nudgeHistory, ...prev.pendingNudges.filter(n => n.id === nudgeId).map(n => ({ ...n, shared: true }))]
        }));

        return shareUrl;
      },

      reset: () => {
        set({
          archetype: null,
          momentum: DEFAULT_MOMENTUM,
          nudgeHistory: [],
          pendingNudges: []
        });
      },

      // Getters
      getMomentumStatus: () => {
        const momentum = get().momentum;
        if (momentum.inactiveDays >= 7) return "critical";
        if (momentum.inactiveDays >= 3) return "warning";
        return "active";
      }
    }),
    {
      name: 'nudge-store',
      partialize: (state) => ({
        archetype: state.archetype,
        momentum: state.momentum,
        nudgeHistory: state.nudgeHistory,
        pendingNudges: state.pendingNudges
      })
    }
  )
);

export { ARCHETYPES, NUDGE_TEMPLATES };
