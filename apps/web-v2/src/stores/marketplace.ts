import { create } from "zustand";
import { persist } from "zustand/middleware";
import { canTransitionPayoutStatus, type PayoutRequestStatus } from "@/lib/payout-transitions";
import { marketplaceApi } from "@/lib/api";

// --- Types ---

export type ServiceCategory =
  | "cv_review"
  | "interview_coaching"
  | "translation"
  | "immigration_consulting"
  | "academic_mentoring"
  | "career_coaching"
  | "language_tutoring"
  | "financial_planning";

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  cv_review: "Revisão de CV",
  interview_coaching: "Coaching de Entrevista",
  translation: "Tradução",
  immigration_consulting: "Consultoria Imigratória",
  academic_mentoring: "Mentoria Acadêmica",
  career_coaching: "Coaching de Carreira",
  language_tutoring: "Aulas de Idioma",
  financial_planning: "Planejamento Financeiro",
};

export interface ServiceListing {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  currency: string;
  duration: number; // minutes
  isActive: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  bio: string;
  avatar: string | null;
  specialties: ServiceCategory[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  country: string;
  languages: string[];
  yearsExperience: number;
  services: ServiceListing[];
  reviews: Review[];
  joinedAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type EscrowStatus = "pending" | "held" | "released" | "refunded";

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  time: string | null;
  status: BookingStatus;
  price: number;
  currency: string;
  escrow: EscrowStatus;
  notes: string;
  rating: number | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface Conversation {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: Message[];
}

export interface PayoutRequest {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  currency: string;
  status: PayoutRequestStatus;
  requestedAt: string;
  processedAt?: string;
  note?: string;
}

interface RemoteMarketplaceService {
  id: string;
  title: string;
  description?: string | null;
  service_type?: string;
  price_amount?: number;
  price_currency?: string;
  duration_minutes?: number | null;
}

interface RemoteMarketplaceProvider {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  languages_spoken?: string[] | null;
  target_regions?: string[] | null;
  rating_average?: number | null;
  review_count?: number | null;
  services?: RemoteMarketplaceService[];
  recent_reviews?: Array<{
    id: string;
    overall_rating: number;
    content?: string | null;
    created_at?: string | null;
  }>;
}

interface RemoteBooking {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_start?: string | null;
  price_agreed: number;
  payment_status?: string | null;
  created_at?: string | null;
  service: {
    id: string;
    title: string;
  };
  provider: {
    id: string;
    full_name?: string | null;
    headline?: string | null;
  };
}

interface RemoteConversation {
  id: string;
  other_party: {
    id: string;
    name?: string | null;
  };
  last_message?: {
    content?: string | null;
    created_at?: string | null;
    is_read?: boolean;
  } | null;
}

const SERVICE_TYPE_TO_CATEGORY: Record<string, ServiceCategory> = {
  visa_guidance: "immigration_consulting",
  application_strategy: "immigration_consulting",
  sop_review: "academic_mentoring",
  research_proposal: "academic_mentoring",
  essay_review: "academic_mentoring",
  mentoring: "academic_mentoring",
  interview_prep: "interview_coaching",
  cv_review: "cv_review",
  language_coaching: "language_tutoring",
  financial_planning: "financial_planning",
};

function mapServiceTypeToCategory(serviceType?: string): ServiceCategory {
  return SERVICE_TYPE_TO_CATEGORY[serviceType || ""] || "career_coaching";
}

function mapRemoteProvider(provider: RemoteMarketplaceProvider): Provider {
  const services = (provider.services || []).map((service) => ({
    id: service.id,
    providerId: provider.id,
    title: service.title,
    description: service.description || provider.headline || "Serviço especializado do marketplace.",
    category: mapServiceTypeToCategory(service.service_type),
    price: service.price_amount || 0,
    currency: service.price_currency || "BRL",
    duration: service.duration_minutes || 0,
    isActive: true,
  }));

  const reviews = (provider.recent_reviews || []).map((review) => ({
    id: review.id,
    bookingId: review.id,
    providerId: provider.id,
    userId: "remote-user",
    userName: "Cliente verificado",
    rating: review.overall_rating,
    comment: review.content || "Avaliação registrada no marketplace.",
    createdAt: review.created_at || new Date().toISOString(),
  }));

  const specialties = Array.from(
    new Set(services.map((service) => service.category))
  );

  return {
    id: provider.id,
    name: provider.full_name || provider.headline || "Especialista Compass",
    bio: provider.bio || provider.headline || "Profissional verificado do marketplace.",
    avatar: provider.avatar_url || null,
    specialties: specialties.length > 0 ? specialties : ["career_coaching"],
    rating: provider.rating_average || 0,
    reviewCount: provider.review_count || 0,
    verified: true,
    country: provider.target_regions?.[0] || "Global",
    languages: provider.languages_spoken?.length ? provider.languages_spoken : ["pt"],
    yearsExperience: provider.years_experience || 0,
    services,
    reviews,
    joinedAt: new Date().toISOString(),
  };
}

function mapRemoteBooking(booking: RemoteBooking): Booking {
  return {
    id: booking.id,
    providerId: booking.provider.id,
    providerName: booking.provider.full_name || booking.provider.headline || "Especialista Compass",
    serviceId: booking.service.id,
    serviceTitle: booking.service.title,
    date: booking.scheduled_date,
    time: booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : null,
    status:
      booking.status === "completed" || booking.status === "cancelled" || booking.status === "confirmed"
        ? booking.status
        : "pending",
    price: booking.price_agreed,
    currency: "BRL",
    escrow:
      booking.payment_status === "released"
        ? "released"
        : booking.payment_status === "refunded"
        ? "refunded"
        : booking.payment_status === "held"
        ? "held"
        : "pending",
    notes: "",
    rating: null,
    createdAt: booking.created_at || booking.scheduled_date,
  };
}

function mapRemoteConversation(conversation: RemoteConversation): Conversation {
  return {
    id: conversation.id,
    providerId: conversation.other_party.id,
    providerName: conversation.other_party.name || "Especialista Compass",
    providerAvatar: null,
    lastMessage: conversation.last_message?.content || "Conversa iniciada",
    lastMessageAt: conversation.last_message?.created_at || new Date().toISOString(),
    unread: conversation.last_message?.is_read ? 0 : 1,
    messages: [],
  };
}

// --- Seed Data ---

const SEED_PROVIDERS: Provider[] = [
  {
    id: "prov1",
    name: "Ana Luísa Ferreira",
    bio: "Advogada de imigração com 12 anos de experiência em vistos europeus. Especialista em Blue Card alemão e vistos de pesquisador. Já ajudei mais de 300 brasileiros a conseguir seus vistos.",
    avatar: null,
    specialties: ["immigration_consulting", "academic_mentoring"],
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    country: "Portugal",
    languages: ["Português", "Inglês", "Espanhol"],
    yearsExperience: 12,
    services: [
      { id: "s1", providerId: "prov1", title: "Consulta inicial — Análise de caso", description: "Avaliação completa do seu perfil migratório com plano de ação personalizado.", category: "immigration_consulting", price: 350, currency: "BRL", duration: 60, isActive: true },
      { id: "s2", providerId: "prov1", title: "Acompanhamento de processo de visto", description: "Suporte completo desde a documentação até a aprovação.", category: "immigration_consulting", price: 1200, currency: "BRL", duration: 0, isActive: true },
    ],
    reviews: [
      { id: "r1", bookingId: "b2", providerId: "prov1", userId: "u1", userName: "Ricardo M.", rating: 5, comment: "Excelente! Profissional competente e atenciosa. Consegui meu visto em tempo recorde.", createdAt: "2025-02-15" },
      { id: "r2", bookingId: "b5", providerId: "prov1", userId: "u2", userName: "Juliana S.", rating: 5, comment: "Muito detalhista e conhece profundamente o processo. Recomendo.", createdAt: "2025-01-20" },
    ],
    joinedAt: "2023-06-01",
  },
  {
    id: "prov2",
    name: "Mariana Costa",
    bio: "Tradutora juramentada (inglês/alemão/francês) com certificação ATA. Especialista em documentos acadêmicos e certificados oficiais para processos migratórios.",
    avatar: null,
    specialties: ["translation"],
    rating: 4.8,
    reviewCount: 89,
    verified: true,
    country: "Brasil",
    languages: ["Português", "Inglês", "Alemão", "Francês"],
    yearsExperience: 8,
    services: [
      { id: "s3", providerId: "prov2", title: "Tradução juramentada — Diploma", description: "Tradução oficial de diploma universitário com selo de tradutora pública.", category: "translation", price: 240, currency: "BRL", duration: 0, isActive: true },
      { id: "s4", providerId: "prov2", title: "Tradução juramentada — Histórico escolar", description: "Tradução certificada de histórico acadêmico completo.", category: "translation", price: 180, currency: "BRL", duration: 0, isActive: true },
      { id: "s5", providerId: "prov2", title: "Tradução livre — Carta de motivação", description: "Tradução e adaptação cultural da sua carta de motivação.", category: "translation", price: 150, currency: "BRL", duration: 0, isActive: true },
    ],
    reviews: [
      { id: "r3", bookingId: "b3", providerId: "prov2", userId: "u3", userName: "Pedro H.", rating: 5, comment: "Entrega rápida e qualidade impecável. Já é minha tradutora fixa.", createdAt: "2025-02-01" },
    ],
    joinedAt: "2023-09-15",
  },
  {
    id: "prov3",
    name: "Carlos Eduardo Silva",
    bio: "Coach de carreira e preparação para entrevistas internacionais. Ex-recrutador da McKinsey e Google. Especialista no método STAR e entrevistas comportamentais.",
    avatar: null,
    specialties: ["interview_coaching", "career_coaching", "cv_review"],
    rating: 4.7,
    reviewCount: 64,
    verified: true,
    country: "Reino Unido",
    languages: ["Português", "Inglês"],
    yearsExperience: 10,
    services: [
      { id: "s6", providerId: "prov3", title: "Sessão de coaching — Entrevista", description: "Mock interview completa com feedback detalhado. Simulação de cenário real.", category: "interview_coaching", price: 200, currency: "BRL", duration: 45, isActive: true },
      { id: "s7", providerId: "prov3", title: "Revisão de CV internacional", description: "Reestruturação completa do CV para padrões internacionais (ATS-friendly).", category: "cv_review", price: 280, currency: "BRL", duration: 0, isActive: true },
      { id: "s8", providerId: "prov3", title: "Pacote preparação completa", description: "3 sessões de coaching + revisão de CV + carta de apresentação.", category: "career_coaching", price: 750, currency: "BRL", duration: 0, isActive: true },
    ],
    reviews: [
      { id: "r4", bookingId: "b4", providerId: "prov3", userId: "u4", userName: "Fernanda L.", rating: 4, comment: "Ótimo feedback sobre postura e comunicação. Me ajudou muito na entrevista da McKinsey.", createdAt: "2025-01-25" },
      { id: "r5", bookingId: "b6", providerId: "prov3", userId: "u5", userName: "Lucas T.", rating: 5, comment: "Transformou meu CV completamente. Recebi 3x mais retornos depois.", createdAt: "2025-02-10" },
    ],
    joinedAt: "2024-01-10",
  },
  {
    id: "prov4",
    name: "Dr. Rafael Mendes",
    bio: "Professor universitário e mentor acadêmico. Doutor pela TU Munich, pesquisador em IA. Ajudo com cartas de motivação, propostas de pesquisa e seleção de programas.",
    avatar: null,
    specialties: ["academic_mentoring", "cv_review"],
    rating: 4.9,
    reviewCount: 43,
    verified: true,
    country: "Alemanha",
    languages: ["Português", "Inglês", "Alemão"],
    yearsExperience: 15,
    services: [
      { id: "s9", providerId: "prov4", title: "Mentoria acadêmica — Seleção de programa", description: "Análise do seu perfil + recomendação de programas ideais na Europa.", category: "academic_mentoring", price: 300, currency: "BRL", duration: 60, isActive: true },
      { id: "s10", providerId: "prov4", title: "Revisão de proposta de pesquisa", description: "Feedback detalhado e reestruturação da sua research proposal.", category: "academic_mentoring", price: 400, currency: "BRL", duration: 0, isActive: true },
    ],
    reviews: [
      { id: "r6", bookingId: "b7", providerId: "prov4", userId: "u6", userName: "Camila R.", rating: 5, comment: "Feedback excepcional. Me ajudou a entrar no programa dos meus sonhos na TU Munich.", createdAt: "2025-02-20" },
    ],
    joinedAt: "2024-03-01",
  },
  {
    id: "prov5",
    name: "Sophie Dubois",
    bio: "Professora nativa de francês com certificação DALF C2. Especialista em preparação para TCF/DELF e francês acadêmico para universidades francófonas.",
    avatar: null,
    specialties: ["language_tutoring"],
    rating: 4.6,
    reviewCount: 31,
    verified: false,
    country: "França",
    languages: ["Francês", "Inglês", "Português"],
    yearsExperience: 6,
    services: [
      { id: "s11", providerId: "prov5", title: "Aula particular — Francês geral", description: "Aula personalizada de 50 min focada nas suas necessidades.", category: "language_tutoring", price: 90, currency: "BRL", duration: 50, isActive: true },
      { id: "s12", providerId: "prov5", title: "Preparação TCF/DELF", description: "Simulado + estratégias para maximizar sua nota.", category: "language_tutoring", price: 120, currency: "BRL", duration: 60, isActive: true },
    ],
    reviews: [],
    joinedAt: "2024-08-01",
  },
];

const SEED_BOOKINGS: Booking[] = [
  { id: "b1", providerId: "prov1", providerName: "Ana Luísa Ferreira", serviceId: "s1", serviceTitle: "Consulta inicial — Análise de caso", date: "2025-03-10", time: "14:00", status: "confirmed", price: 350, currency: "BRL", escrow: "held", notes: "", rating: null, createdAt: "2025-03-01" },
  { id: "b2", providerId: "prov2", providerName: "Mariana Costa", serviceId: "s3", serviceTitle: "Tradução juramentada — Diploma", date: "2025-03-05", time: null, status: "completed", price: 240, currency: "BRL", escrow: "released", notes: "Entrega em 3 dias úteis", rating: 5, createdAt: "2025-02-28" },
  { id: "b3", providerId: "prov3", providerName: "Carlos Eduardo Silva", serviceId: "s6", serviceTitle: "Sessão de coaching — Entrevista", date: "2025-03-15", time: "10:00", status: "pending", price: 200, currency: "BRL", escrow: "pending", notes: "Preparação para entrevista TU Berlin", rating: null, createdAt: "2025-03-02" },
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    providerId: "prov1",
    providerName: "Ana Luísa Ferreira",
    providerAvatar: null,
    lastMessage: "Perfeito! Vou preparar o roteiro da consulta. Até segunda!",
    lastMessageAt: "2025-03-03T14:30:00Z",
    unread: 1,
    messages: [
      { id: "m1", conversationId: "conv1", senderId: "me", senderName: "Eu", content: "Olá Ana! Gostaria de confirmar a consulta de segunda-feira.", timestamp: "2025-03-03T14:00:00Z" },
      { id: "m2", conversationId: "conv1", senderId: "prov1", senderName: "Ana Luísa Ferreira", content: "Oi! Confirmado sim. Pode me enviar seus documentos antes da consulta?", timestamp: "2025-03-03T14:15:00Z" },
      { id: "m3", conversationId: "conv1", senderId: "me", senderName: "Eu", content: "Claro! Vou enviar meu passaporte e diploma ainda hoje.", timestamp: "2025-03-03T14:20:00Z" },
      { id: "m4", conversationId: "conv1", senderId: "prov1", senderName: "Ana Luísa Ferreira", content: "Perfeito! Vou preparar o roteiro da consulta. Até segunda!", timestamp: "2025-03-03T14:30:00Z" },
    ],
  },
  {
    id: "conv2",
    providerId: "prov3",
    providerName: "Carlos Eduardo Silva",
    providerAvatar: null,
    lastMessage: "Combinado. Vamos focar no método STAR na sessão.",
    lastMessageAt: "2025-03-02T09:15:00Z",
    unread: 0,
    messages: [
      { id: "m5", conversationId: "conv2", senderId: "me", senderName: "Eu", content: "Carlos, tenho uma entrevista na TU Berlin semana que vem. Podemos focar nisso?", timestamp: "2025-03-02T09:00:00Z" },
      { id: "m6", conversationId: "conv2", senderId: "prov3", senderName: "Carlos Eduardo Silva", content: "Combinado. Vamos focar no método STAR na sessão.", timestamp: "2025-03-02T09:15:00Z" },
    ],
  },
];

const SEED_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: "pr1",
    providerId: "prov1",
    providerName: "Ana Luísa Ferreira",
    amount: 350,
    currency: "BRL",
    status: "approved",
    requestedAt: "2025-03-04",
    processedAt: "2025-03-05",
    note: "Saída parcial de saldo disponível",
  },
];

// --- Store ---

interface MarketplaceState {
  providers: Provider[];
  bookings: Booking[];
  conversations: Conversation[];
  payoutRequests: PayoutRequest[];
  activeProviderId: string | null;
  isSyncing: boolean;
  syncError: string | null;

  // Provider actions
  syncFromApi: () => Promise<void>;
  loadProviderDetail: (providerId: string) => Promise<Provider | undefined>;
  setActiveProvider: (id: string) => void;
  getActiveProvider: () => Provider | undefined;
  getProviderById: (id: string) => Provider | undefined;
  getProvidersByCategory: (cat: ServiceCategory) => Provider[];
  searchProviders: (query: string) => Provider[];
  setProviderVerified: (id: string, verified: boolean) => void;
  removeProvider: (id: string) => void;
  updateProviderProfile: (
    providerId: string,
    updates: Partial<Pick<Provider, "name" | "bio" | "country" | "languages" | "yearsExperience" | "specialties">>
  ) => void;
  createProviderService: (
    providerId: string,
    service: Omit<ServiceListing, "id" | "providerId">
  ) => string | null;
  updateProviderService: (
    providerId: string,
    serviceId: string,
    updates: Partial<Pick<ServiceListing, "title" | "description" | "category" | "price" | "duration" | "isActive">>
  ) => void;
  removeProviderService: (providerId: string, serviceId: string) => void;

  // Booking actions
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  rateBooking: (id: string, rating: number) => void;
  getBookingById: (id: string) => Booking | undefined;

  // Conversation actions
  getConversation: (providerId: string) => Conversation | undefined;
  ensureConversation: (providerId: string) => Conversation | undefined;
  sendMessage: (conversationId: string, content: string, attachments?: MessageAttachment[]) => void;
  shareDeliverable: (
    bookingId: string,
    payload: { name: string; size: number; type: string; note?: string }
  ) => boolean;
  markConversationRead: (id: string) => void;

  // Payout actions
  createPayoutRequest: (providerId: string, amount: number, note?: string) => string | null;
  updatePayoutRequestStatus: (id: string, status: PayoutRequestStatus, note?: string) => boolean;
  getPayoutRequestsByProvider: (providerId: string) => PayoutRequest[];

  // Stats
  getStats: () => {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    totalSpent: number;
    unreadMessages: number;
    avgRating: number;
  };

  reset: () => void;
}

const initialState = {
  providers: [],
  bookings: [],
  conversations: [],
  payoutRequests: [],
  activeProviderId: null,
  isSyncing: false,
  syncError: null,
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      syncFromApi: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const [providersResult, bookingsResult, conversationsResult] = await Promise.allSettled([
            marketplaceApi.getProviders(),
            marketplaceApi.getBookings(),
            marketplaceApi.getConversations(),
          ]);

          const nextState: Partial<MarketplaceState> = { isSyncing: false, syncError: null };

          if (providersResult.status === "fulfilled") {
            const items = providersResult.value.data?.items || [];
            const providers = items.map(mapRemoteProvider);
            nextState.providers = providers.length > 0 ? providers : get().providers;
            nextState.activeProviderId = providers[0]?.id || get().activeProviderId;
          }

          if (bookingsResult.status === "fulfilled") {
            const items = bookingsResult.value.data?.items || [];
            nextState.bookings = items.map(mapRemoteBooking);
          }

          if (conversationsResult.status === "fulfilled") {
            const items = conversationsResult.value.data || [];
            nextState.conversations = items.map(mapRemoteConversation);
          }

          if (providersResult.status !== "fulfilled" && bookingsResult.status !== "fulfilled") {
            nextState.syncError = "Não foi possível sincronizar o marketplace com a API.";
          }

          set(nextState as Partial<MarketplaceState>);
        } catch {
          set({ isSyncing: false, syncError: "Não foi possível sincronizar o marketplace com a API." });
        }
      },

      loadProviderDetail: async (providerId) => {
        try {
          const { data } = await marketplaceApi.getProvider(providerId);
          const remoteProvider = mapRemoteProvider(data);
          set((state) => ({
            providers: state.providers.some((provider) => provider.id === providerId)
              ? state.providers.map((provider) => (provider.id === providerId ? remoteProvider : provider))
              : [remoteProvider, ...state.providers],
          }));
          return remoteProvider;
        } catch {
          return get().providers.find((provider) => provider.id === providerId);
        }
      },

      setActiveProvider: (id) =>
        set((state) => ({
          activeProviderId: state.providers.some((provider) => provider.id === id) ? id : state.activeProviderId,
        })),

      getActiveProvider: () => {
        const { activeProviderId, providers } = get();
        if (!activeProviderId) return providers[0];
        return providers.find((provider) => provider.id === activeProviderId) || providers[0];
      },

      getProviderById: (id) => get().providers.find((p) => p.id === id),

      getProvidersByCategory: (cat) =>
        get().providers.filter((p) => p.specialties.includes(cat)),

      searchProviders: (query) => {
        const lc = query.toLowerCase();
        return get().providers.filter(
          (p) =>
            p.name.toLowerCase().includes(lc) ||
            p.bio.toLowerCase().includes(lc) ||
            p.specialties.some((s) => CATEGORY_LABELS[s].toLowerCase().includes(lc))
        );
      },

      setProviderVerified: (id, verified) =>
        set((s) => ({
          providers: s.providers.map((provider) =>
            provider.id === id ? { ...provider, verified } : provider
          ),
        })),

      removeProvider: (id) =>
        set((s) => ({
          providers: s.providers.filter((provider) => provider.id !== id),
          bookings: s.bookings.filter((booking) => booking.providerId !== id),
          conversations: s.conversations.filter((conversation) => conversation.providerId !== id),
          activeProviderId: s.activeProviderId === id ? (s.providers.find((provider) => provider.id !== id)?.id || null) : s.activeProviderId,
        })),

      updateProviderProfile: (providerId, updates) =>
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === providerId
              ? { ...provider, ...updates }
              : provider
          ),
        })),

      createProviderService: (providerId, service) => {
        const providerExists = get().providers.some((provider) => provider.id === providerId);
        if (!providerExists) return null;
        const serviceId = `s_${Date.now()}`;
        const newService: ServiceListing = {
          ...service,
          id: serviceId,
          providerId,
        };
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === providerId
              ? { ...provider, services: [newService, ...provider.services] }
              : provider
          ),
        }));
        return serviceId;
      },

      updateProviderService: (providerId, serviceId, updates) =>
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id !== providerId
              ? provider
              : {
                  ...provider,
                  services: provider.services.map((service) =>
                    service.id === serviceId ? { ...service, ...updates } : service
                  ),
                }
          ),
        })),

      removeProviderService: (providerId, serviceId) =>
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id !== providerId
              ? provider
              : { ...provider, services: provider.services.filter((service) => service.id !== serviceId) }
          ),
          bookings: state.bookings.filter((booking) => booking.serviceId !== serviceId),
        })),

      createBooking: async (data) => {
        let bookingId = `b${Date.now()}`;
        let bookingStatus: BookingStatus = data.status;

        try {
          const { data: response } = await marketplaceApi.createBooking({
            service_id: data.serviceId,
            proposed_date: data.date,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notes: data.time ? `${data.notes}\nHorário preferido: ${data.time}`.trim() : data.notes,
          });
          bookingId = response.booking_id || bookingId;
          bookingStatus =
            response.status === "confirmed" || response.status === "completed" || response.status === "cancelled"
              ? response.status
              : "pending";
        } catch {
          // Keep a local pending booking so the UI flow remains usable offline/fallback.
        }

        const booking: Booking = {
          ...data,
          id: bookingId,
          status: bookingStatus,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },

      updateBookingStatus: (id, status) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status,
                  escrow:
                    status === "completed"
                      ? "released"
                      : status === "cancelled"
                      ? "refunded"
                      : b.escrow,
                }
              : b
          ),
        })),

      rateBooking: (id, rating) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, rating } : b)),
        })),

      getBookingById: (id) => get().bookings.find((b) => b.id === id),

      getConversation: (providerId) =>
        get().conversations.find((c) => c.providerId === providerId),

      ensureConversation: (providerId) => {
        const existing = get().conversations.find((c) => c.providerId === providerId);
        if (existing) return existing;

        const provider = get().providers.find((p) => p.id === providerId);
        if (!provider) return undefined;

        const conversation: Conversation = {
          id: `conv${Date.now()}`,
          providerId: provider.id,
          providerName: provider.name,
          providerAvatar: provider.avatar,
          lastMessage: "Conversa iniciada",
          lastMessageAt: new Date().toISOString(),
          unread: 0,
          messages: [],
        };

        set((s) => ({ conversations: [conversation, ...s.conversations] }));
        return conversation;
      },

      sendMessage: (conversationId, content, attachments) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: attachments && attachments.length > 0
                    ? `${content || "Anexo enviado"} · ${attachments.map((item) => item.name).join(", ")}`
                    : content,
                  lastMessageAt: new Date().toISOString(),
                  messages: [
                    ...c.messages,
                    {
                      id: `m${Date.now()}`,
                      conversationId,
                      senderId: "me",
                      senderName: "Eu",
                      content,
                      timestamp: new Date().toISOString(),
                      attachments,
                    },
                  ],
                }
              : c
          ),
        })),

      shareDeliverable: (bookingId, payload) => {
        const booking = get().bookings.find((item) => item.id === bookingId);
        if (!booking) return false;

        const ensuredConversation =
          get().conversations.find((conversation) => conversation.providerId === booking.providerId) ||
          get().ensureConversation(booking.providerId);

        if (!ensuredConversation) return false;

        const attachment: MessageAttachment = {
          id: `att_${Date.now()}`,
          name: payload.name.trim(),
          size: Math.max(1, payload.size),
          type: payload.type.trim() || "application/octet-stream",
        };

        const content = payload.note?.trim()
          ? `Entrega compartilhada para ${booking.serviceTitle}: ${payload.note.trim()}`
          : `Entrega compartilhada para ${booking.serviceTitle}`;

        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id !== ensuredConversation.id
              ? conversation
              : {
                  ...conversation,
                  lastMessage: `${content} · ${attachment.name}`,
                  lastMessageAt: new Date().toISOString(),
                  messages: [
                    ...conversation.messages,
                    {
                      id: `m${Date.now()}`,
                      conversationId: conversation.id,
                      senderId: booking.providerId,
                      senderName: booking.providerName,
                      content,
                      timestamp: new Date().toISOString(),
                      attachments: [attachment],
                    },
                  ],
                }
          ),
        }));

        return true;
      },

      markConversationRead: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, unread: 0 } : c
          ),
        })),

      createPayoutRequest: (providerId, amount, note) => {
        const provider = get().providers.find((item) => item.id === providerId);
        if (!provider || amount <= 0) return null;

        const payoutId = `pr_${Date.now()}`;
        const request: PayoutRequest = {
          id: payoutId,
          providerId,
          providerName: provider.name,
          amount: Math.round(amount * 100) / 100,
          currency: "BRL",
          status: "pending",
          requestedAt: new Date().toISOString(),
          note: note?.trim() || undefined,
        };

        set((state) => ({
          payoutRequests: [request, ...state.payoutRequests],
        }));
        return payoutId;
      },

      updatePayoutRequestStatus: (id, status, note) => {
        const { payoutRequests } = get();
        const request = payoutRequests.find((item) => item.id === id);
        if (!request) return false;

        if (!canTransitionPayoutStatus(request.status, status)) return false;

        set((state) => ({
          payoutRequests: state.payoutRequests.map((item) =>
            item.id !== id
              ? item
              : {
                  ...item,
                  status,
                  note: note?.trim() || item.note,
                  processedAt: new Date().toISOString(),
                }
          ),
        }));

        return true;
      },

      getPayoutRequestsByProvider: (providerId) =>
        get()
          .payoutRequests
          .filter((request) => request.providerId === providerId),

      getStats: () => {
        const { bookings, conversations } = get();
        const completed = bookings.filter((b) => b.status === "completed");
        const rated = completed.filter((b) => b.rating !== null);
        return {
          totalBookings: bookings.length,
          completedBookings: completed.length,
          pendingBookings: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
          totalSpent: completed.reduce((s, b) => s + b.price, 0),
          unreadMessages: conversations.reduce((s, c) => s + c.unread, 0),
          avgRating: rated.length > 0 ? Math.round((rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length) * 10) / 10 : 0,
        };
      },

      reset: () => set(initialState),
    }),
    { name: "olcan-marketplace" }
  )
);
