import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type RawService = {
  id: string;
  title: string;
  description?: string;
  price_amount?: number;
  price_currency?: string;
  duration_minutes?: number;
  has_performance_guarantee?: boolean;
  performance_success_rate?: number;
};

type RawReview = {
  id: string;
  overall_rating: number;
  content: string;
};

type RawProvider = {
  id: string;
  headline?: string;
  bio?: string;
  timezone?: string;
  current_organization?: string;
  specializations?: string[];
  rating_average?: number;
  review_count?: number;
  services?: RawService[];
  recent_reviews?: RawReview[];
};

type RawBooking = {
  id: string;
  provider?: { id: string; headline?: string };
  service?: { title?: string };
  status?: string;
  scheduled_date?: string;
  price_agreed?: number;
};

type RawConversation = {
  id: string;
  other_party?: { name?: string };
  last_message?: { content?: string; is_read?: boolean };
};

type RawMessage = {
  id: string;
  content: string;
  created_at?: string;
  is_me?: boolean;
};

const normalizeService = (service: RawService) => ({
  id: String(service.id),
  name: service.title,
  description: service.description,
  price: service.price_amount,
  currency: service.price_currency,
  duration: service.duration_minutes,
  performance_bound: service.has_performance_guarantee,
  performance_success_rate: service.performance_success_rate,
});

const normalizeProviderCard = (provider: RawProvider) => ({
  id: String(provider.id),
  name: provider.headline || 'Provider',
  bio: provider.bio,
  location: provider.timezone || provider.current_organization,
  specialties: provider.specializations || [],
  rating: provider.rating_average,
  review_count: provider.review_count,
  services: (provider.services || []).map(normalizeService),
  verified: true,
});

const normalizeProviderDetail = (provider: RawProvider) => ({
  id: String(provider.id),
  name: provider.headline || 'Provider',
  avatar: undefined,
  bio: provider.bio,
  rating: provider.rating_average,
  review_count: provider.review_count,
  location: provider.timezone || provider.current_organization,
  services: (provider.services || []).map(normalizeService),
  reviews: (provider.recent_reviews || []).map((review: RawReview) => ({
    id: String(review.id),
    user_name: 'Cliente',
    rating: review.overall_rating,
    comment: review.content,
  })),
});

const normalizeBooking = (booking: RawBooking) => ({
  id: String(booking.id),
  provider_id: booking.provider?.id ? String(booking.provider.id) : '',
  provider_name: booking.provider?.headline || 'Provider',
  service_name: booking.service?.title || 'Serviço',
  status: booking.status,
  scheduled_date: booking.scheduled_date,
  price: booking.price_agreed,
  reviewed: false,
});

const normalizeConversation = (conversation: RawConversation) => ({
  id: String(conversation.id),
  provider_name: conversation.other_party?.name || 'Contato',
  provider_avatar: undefined,
  last_message: conversation.last_message?.content || '',
  unread_count: conversation.last_message?.is_read ? 0 : 1,
});

export const useProviders = (filters?: {
  service_type?: string;
  min_rating?: number;
  max_price?: number;
}) => {
  return useQuery({
    queryKey: ['marketplace', 'providers', filters],
    queryFn: async () => {
      const response = await api.get('/marketplace/providers', { params: filters });
      return (response.data?.items ?? []).map(normalizeProviderCard);
    },
  });
};

export const useProvider = (providerId: string) => {
  return useQuery({
    queryKey: ['marketplace', 'providers', providerId],
    queryFn: async () => {
      const response = await api.get(`/marketplace/providers/${providerId}`);
      return normalizeProviderDetail(response.data);
    },
    enabled: !!providerId,
  });
};

export const useProviderServices = (providerId: string) => {
  return useQuery({
    queryKey: ['marketplace', 'providers', providerId, 'services'],
    queryFn: async () => {
      const response = await api.get(`/marketplace/providers/${providerId}`);
      return (response.data?.services ?? []).map(normalizeService);
    },
    enabled: !!providerId,
  });
};

export const useBookings = () => {
  return useQuery({
    queryKey: ['marketplace', 'bookings'],
    queryFn: async () => {
      const response = await api.get('/marketplace/bookings');
      return (response.data?.items ?? []).map(normalizeBooking);
    },
  });
};

export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ['marketplace', 'bookings', bookingId],
    queryFn: async () => {
      const response = await api.get('/marketplace/bookings');
      const items = (response.data?.items ?? []).map(normalizeBooking);
      return items.find((booking: { id: string }) => booking.id === bookingId) ?? null;
    },
    enabled: !!bookingId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      service_id: string;
      scheduled_date: string;
      notes?: string;
    }) => {
      const response = await api.post('/marketplace/bookings', {
        service_id: data.service_id,
        proposed_date: data.scheduled_date,
        notes: data.notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'bookings'] });
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      providerId: string;
      bookingId: string;
      rating: number;
      comment: string;
    }) => {
      const response = await api.post('/marketplace/reviews', {
        booking_id: data.bookingId,
        overall_rating: data.rating,
        content: data.comment,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['marketplace', 'providers', variables.providerId],
      });
    },
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['marketplace', 'conversations'],
    queryFn: async () => {
      const response = await api.get('/marketplace/conversations');
      return (response.data ?? []).map(normalizeConversation);
    },
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ['marketplace', 'conversations', conversationId],
    queryFn: async () => {
      const response = await api.get(`/marketplace/conversations/${conversationId}/messages`);
      return (response.data ?? []).map((message: RawMessage) => ({
        id: String(message.id),
        content: message.content,
        created_at: message.created_at,
        is_from_user: !!message.is_me,
      }));
    },
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; content: string }) => {
      const response = await api.post(
        `/marketplace/conversations/${data.conversationId}/messages`,
        { content: data.content }
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['marketplace', 'conversations', variables.conversationId],
      });
    },
  });
};

// Aggregate hook for convenience
export const useMarketplace = (filters?: {
  service_type?: string;
  min_rating?: number;
  max_price?: number;
}) => {
  const providersQuery = useProviders(filters);
  const bookingsQuery = useBookings();
  const conversationsQuery = useConversations();
  const createBooking = useCreateBooking();
  const submitReview = useSubmitReview();
  const sendMessage = useSendMessage();

  return {
    providers: providersQuery.data,
    bookings: bookingsQuery.data,
    conversations: conversationsQuery.data,
    isLoading:
      providersQuery.isLoading ||
      bookingsQuery.isLoading ||
      conversationsQuery.isLoading,
    error: providersQuery.error || bookingsQuery.error || conversationsQuery.error,
    createBooking: createBooking.mutate,
    submitReview: submitReview.mutate,
    sendMessage: sendMessage.mutate,
    getProvider: useProvider,
    getConversation: useConversation,
    bookService: (_providerId: string, serviceId?: string) => {
      if (!serviceId) return;
      createBooking.mutate({
        service_id: serviceId,
        scheduled_date: new Date().toISOString().slice(0, 10),
      });
    },
  };
};
