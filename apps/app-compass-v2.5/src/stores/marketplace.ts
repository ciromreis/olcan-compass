import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type PayoutRequestStatus } from "@/lib/payout-transitions";
import { marketplaceApi } from "@/lib/api";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
  provider_id: string;
  title: string;
  description?: string | null;
  service_type?: string;
  price_amount?: number;
  price_currency?: string;
  duration_minutes?: number | null;
  is_active?: boolean;
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
  cv_review: "cv_review",
  visa_guidance: "immigration_consulting",
  application_strategy: "immigration_consulting",
  sop_review: "academic_mentoring",
  research_proposal: "academic_mentoring",
  essay_review: "academic_mentoring",
  mentoring: "academic_mentoring",
  interview_prep: "interview_coaching",
  training: "career_coaching",
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
    date: booking.scheduled_date || new Date().toISOString().slice(0, 10),
    time: booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : null,
    status:
      booking.status === "completed" || booking.status === "cancelled" || booking.status === "confirmed"
        ? (booking.status as BookingStatus)
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
    createdAt: booking.created_at || booking.scheduled_date || new Date().toISOString(),
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

// --- Store ---

interface MarketplaceState {
  providers: Provider[];
  bookings: Booking[];
  conversations: Conversation[];
  payoutRequests: PayoutRequest[];
  activeProviderId: string | null;
  myProviderProfile: Provider | null;
  myServices: ServiceListing[];
  isSyncing: boolean;
  syncError: string | null;

  // Actions
  syncFromApi: () => Promise<void>;
  loadProviderDetail: (providerId: string) => Promise<Provider | undefined>;
  setActiveProvider: (id: string) => void;
  getActiveProvider: () => Provider | undefined;
  getProviderById: (id: string) => Provider | undefined;
  getProvidersByCategory: (cat: ServiceCategory) => Provider[];
  searchProviders: (query: string) => Provider[];
  setProviderVerified: (id: string, verified: boolean) => void;
  removeProvider: (id: string) => void;

  // Self-management
  fetchMyProviderProfile: () => Promise<void>;
  updateMyProviderProfile: (updates: Record<string, unknown>) => Promise<void>;
  fetchMyServices: () => Promise<void>;
  createService: (service: Omit<ServiceListing, "id" | "providerId">) => Promise<void>;
  updateService: (id: string, updates: Partial<ServiceListing>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Bookings
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => Promise<Booking>;
  updateBookingStatus: (id: string, status: string, reason?: string, summary?: string) => Promise<void>;
  rateBooking: (id: string, rating: number) => void;
  getBookingById: (id: string) => Booking | undefined;

  // Conversations
  getConversation: (providerId: string) => Conversation | undefined;
  ensureConversation: (providerId: string) => Conversation | undefined;
  sendMessage: (conversationId: string, content: string, attachments?: MessageAttachment[]) => void;
  shareDeliverable: (
    bookingId: string,
    payload: { name: string; size: number; type: string; note?: string }
  ) => boolean;
  markConversationRead: (id: string) => void;

  // Payouts
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

// Only the Olcan official provider is seeded in demo mode.
// Third-party providers will be populated from the backend API once the marketplace is live.
const DEMO_PROVIDERS: Provider[] = [
  {
    id: "provider_olcan_official",
    name: "Equipe Olcan",
    bio: "Time oficial da Olcan com especialistas em mobilidade internacional, focado em orientação estratégica, narrativa e preparação para entrevistas.",
    avatar: null,
    specialties: ["cv_review", "interview_coaching", "career_coaching", "academic_mentoring"],
    rating: 0,
    reviewCount: 0,
    verified: true,
    country: "Brasil / Global",
    languages: ["pt", "en", "es"],
    yearsExperience: 5,
    services: [
      { id: "svc_mentoria_olcan", providerId: "provider_olcan_official", title: "Mentoria Olcan — Sessão avulsa", description: "Sessão 1:1 de 60 minutos com foco em narrativa, candidaturas e posicionamento internacional.", category: "career_coaching", price: 225, currency: "BRL", duration: 60, isActive: true },
    ],
    reviews: [],
    joinedAt: "2021-01-01T00:00:00Z",
  },
];

const DEMO_BOOKINGS: Booking[] = [];

const initialState = {
  providers: [],
  bookings: [],
  conversations: [],
  payoutRequests: [],
  activeProviderId: null,
  myProviderProfile: null,
  myServices: [],
  isSyncing: false,
  syncError: null,
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      syncFromApi: async () => {
        if (DEMO_MODE) {
          set({
            providers: DEMO_PROVIDERS,
            bookings: DEMO_BOOKINGS,
            activeProviderId: DEMO_PROVIDERS[0].id,
            isSyncing: false,
            syncError: null,
          });
          return;
        }

        set({ isSyncing: true, syncError: null });
        try {
          const [providersResult, bookingsResult, conversationsResult] = await Promise.allSettled([
            marketplaceApi.getProviders(),
            marketplaceApi.getBookings(),
            marketplaceApi.getConversations(),
          ]);

          const nextState: Partial<MarketplaceState> = { isSyncing: false, syncError: null };

          if (providersResult.status === "fulfilled") {
            const items = (providersResult.value.data as { items: RemoteMarketplaceProvider[] })?.items || [];
            const providers = items.map(mapRemoteProvider);
            nextState.providers = providers;
            if (!get().activeProviderId && providers.length > 0) {
              nextState.activeProviderId = providers[0].id;
            }
          }

          if (bookingsResult.status === "fulfilled") {
            const items = (bookingsResult.value.data as { items: RemoteBooking[] })?.items || [];
            nextState.bookings = items.map(mapRemoteBooking);
          }

          if (conversationsResult.status === "fulfilled") {
            const items = (conversationsResult.value.data as RemoteConversation[]) || [];
            nextState.conversations = items.map(mapRemoteConversation);
          }

          if (providersResult.status === "rejected" && bookingsResult.status === "rejected") {
            nextState.syncError = "Erro ao sincronizar dados com o servidor.";
          }

          set(nextState);
        } catch {
          set({ isSyncing: false, syncError: "Erro inesperado na sincronização." });
        }
      },

      loadProviderDetail: async (providerId) => {
        try {
          const { data } = await marketplaceApi.getProvider(providerId);
          const remoteProvider = mapRemoteProvider(data as unknown as RemoteMarketplaceProvider);
          set((state) => ({
            providers: state.providers.some((p) => p.id === providerId)
              ? state.providers.map((p) => (p.id === providerId ? remoteProvider : p))
              : [remoteProvider, ...state.providers],
          }));
          return remoteProvider;
        } catch {
          return get().providers.find((p) => p.id === providerId);
        }
      },

      setActiveProvider: (id) => set({ activeProviderId: id }),

      getActiveProvider: () => {
        const { activeProviderId, providers } = get();
        return providers.find((p) => p.id === activeProviderId) || providers[0];
      },

      getProviderById: (id) => get().providers.find((p) => p.id === id),

      getProvidersByCategory: (cat) => get().providers.filter((p) => p.specialties.includes(cat)),

      searchProviders: (query) => {
        const lc = query.toLowerCase();
        return get().providers.filter(
          (p) =>
            p.name.toLowerCase().includes(lc) ||
            p.bio.toLowerCase().includes(lc) ||
            p.specialties.some((s) => CATEGORY_LABELS[s].toLowerCase().includes(lc))
        );
      },

      setProviderVerified: (id, verified) => {
        set((state) => ({
          providers: state.providers.map((p) => (p.id === id ? { ...p, verified } : p)),
        }));
      },

      removeProvider: (id) => {
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
        }));
      },

      fetchMyProviderProfile: async () => {
        try {
          const { data } = await marketplaceApi.getProfileMe();
          set({ myProviderProfile: mapRemoteProvider(data as unknown as RemoteMarketplaceProvider) });
        } catch (err) {
          console.error("fetchMyProviderProfile error:", err);
        }
      },

      updateMyProviderProfile: async (updates) => {
        try {
          const { data } = await marketplaceApi.updateProfileMe(updates);
          set({ myProviderProfile: mapRemoteProvider(data as unknown as RemoteMarketplaceProvider) });
        } catch (err) {
          console.error("updateMyProviderProfile error:", err);
          throw err;
        }
      },

      fetchMyServices: async () => {
        try {
          const { data } = await marketplaceApi.getServicesMe();
          const mappedServices: ServiceListing[] = (data as unknown as RemoteMarketplaceService[]).map((s) => ({
            id: s.id,
            providerId: s.provider_id,
            title: s.title,
            description: s.description || "Serviço marketplace",
            category: mapServiceTypeToCategory(s.service_type),
            price: s.price_amount || 0,
            currency: s.price_currency || "BRL",
            duration: s.duration_minutes || 0,
            isActive: s.is_active ?? true,
          }));
          set({ myServices: mappedServices });
        } catch (err) {
          console.error("fetchMyServices error:", err);
        }
      },

      createService: async (service) => {
        try {
          await marketplaceApi.createService({
            title: service.title,
            description: service.description,
            service_type: service.category,
            price_amount: service.price,
            price_currency: service.currency || "BRL",
            duration_minutes: service.duration,
            is_active: service.isActive,
          });
          await get().fetchMyServices();
        } catch (err) {
          console.error("createService error:", err);
          throw err;
        }
      },

      updateService: async (id, updates) => {
        try {
          const payload: Partial<RemoteMarketplaceService> = {};
          if (updates.title) payload.title = updates.title;
          if (updates.description) payload.description = updates.description;
          if (updates.category) payload.service_type = updates.category;
          if (updates.price !== undefined) payload.price_amount = updates.price;
          if (updates.duration !== undefined) payload.duration_minutes = updates.duration;
          if (updates.isActive !== undefined) payload.is_active = updates.isActive;

          await marketplaceApi.updateService(id, payload);
          await get().fetchMyServices();
        } catch (err) {
          console.error("updateService error:", err);
          throw err;
        }
      },

      deleteService: async (id) => {
        try {
          await marketplaceApi.deleteService(id);
          set((state) => ({ myServices: state.myServices.filter((s) => s.id !== id) }));
        } catch (err) {
          console.error("deleteService error:", err);
          throw err;
        }
      },

      createBooking: async (data) => {
        if (DEMO_MODE) {
          const booking: Booking = {
            ...data,
            id: `demo_booking_${Date.now()}`,
            status: "pending",
            createdAt: new Date().toISOString(),
          };
          set((s) => ({ bookings: [booking, ...s.bookings] }));
          return booking;
        }

        try {
          const { data: response } = await marketplaceApi.createBooking({
            service_id: data.serviceId,
            proposed_date: data.date,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notes: data.notes,
          });

          const booking: Booking = {
            ...data,
            id: (response as unknown as { booking_id: string }).booking_id,
            status: (response as unknown as { status: string }).status as BookingStatus,
            createdAt: new Date().toISOString(),
          };

          set((s) => ({ bookings: [booking, ...s.bookings] }));
          return booking;
        } catch (err) {
          console.error("createBooking error:", err);
          throw err;
        }
      },

      updateBookingStatus: async (id, status, reason, summary) => {
        try {
          await marketplaceApi.updateBooking(id, { status, reason, summary });
          set((state) => ({
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: status as BookingStatus } : b
            ),
          }));
        } catch (err) {
          console.error("updateBookingStatus error:", err);
          throw err;
        }
      },

      setBookingEscrow: (id: string, escrow: EscrowStatus) => {
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, escrow } : b)),
        }));
      },

      rateBooking: (id, rating) => {
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, rating } : b)),
        }));
      },

      getBookingById: (id) => get().bookings.find((b) => b.id === id),

      getConversation: (providerId) => get().conversations.find((c) => c.providerId === providerId),

      ensureConversation: (providerId) => {
        const existing = get().conversations.find((c) => c.providerId === providerId);
        if (existing) return existing;

        const provider = get().providers.find((p) => p.id === providerId);
        if (!provider) return undefined;

        const conversation: Conversation = {
          id: `conv_${Date.now()}`,
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

      sendMessage: (conversationId, content, attachments) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? {
              ...c,
              lastMessage: content,
              lastMessageAt: new Date().toISOString(),
              messages: [...c.messages, {
                id: `msg_${Date.now()}`,
                conversationId,
                senderId: "me",
                senderName: "Eu",
                content,
                timestamp: new Date().toISOString(),
                attachments
              }]
            } : c
          )
        }));
      },

      shareDeliverable: (bookingId) => {
        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) return false;
        // Logic for deliverable sharing via messages
        return true;
      },

      markConversationRead: (id) => {
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
        }));
      },

      createPayoutRequest: (providerId, amount, note) => {
        console.log("Mock payout request:", providerId, amount, note);
        const payoutId = `payout_${Date.now()}`;
        // Local only for now as requested
        return payoutId;
      },

      updatePayoutRequestStatus: (id, status, note) => {
        console.log("Mock payout update:", id, status, note);
        return true;
      },

      getPayoutRequestsByProvider: (providerId) => {
        console.log("Mock get payouts:", providerId);
        return [];
      },

      getStats: () => {
        const { bookings, conversations } = get();
        const completed = bookings.filter((b) => b.status === "completed");
        return {
          totalBookings: bookings.length,
          completedBookings: completed.length,
          pendingBookings: bookings.filter((b) => b.status === "pending").length,
          totalSpent: completed.reduce((sum, b) => sum + b.price, 0),
          unreadMessages: conversations.reduce((sum, c) => sum + c.unread, 0),
          avgRating: 0,
        };
      },

      reset: () => set(initialState),
    }),
    { name: "olcan-marketplace" }
  )
);
