import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { ChatRequest, ChatResponse, QuickQuestion } from '@/types';

export function useChat() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: (data: ChatRequest) =>
      apiClient.post<ChatResponse>('/ai/chat', data),
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
