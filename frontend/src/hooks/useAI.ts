import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { ChatRequest, ChatResponse, QuickQuestion } from '@/types';

export function useChat() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: async (data: ChatRequest) => {
      const response = await apiClient.post<
        ChatResponse | { data: ChatResponse; success: boolean; timestamp: string }
      >('/ai/chat', data);

      // The Nest global TransformInterceptor wraps successful responses in { data, success, timestamp }.
      return 'data' in response ? response.data : response;
    },
  });
}

export function useQuickQuestions(locale: string = 'ru') {
  return useQuery<QuickQuestion[]>({
    queryKey: ['ai', 'quick-questions', locale],
    queryFn: () =>
      apiClient.get<QuickQuestion[]>('/ai/quick-questions', {
        params: { locale },
      }),
  });
}

export function useChatHistory(sessionId: string) {
  return useQuery({
    queryKey: ['ai', 'chat-history', sessionId],
    queryFn: () =>
      apiClient.get(`/ai/chat-history/${sessionId}`),
    enabled: !!sessionId,
  });
}
