import { mockApi } from '../mocks/mockApi';
import type { ChatbotAnswer, ChatbotRequest, Faq } from '../types/chatbot';
import type { ApiResponse } from '../types/common';
import { apiClient, toApiResponse, USE_MOCK } from './client';

const fallbackAnswer: ChatbotAnswer = {
  answer: '지금은 답변을 불러오지 못했습니다. 등록된 FAQ를 선택하거나 잠시 후 다시 시도해 주세요.',
  source: 'FALLBACK',
  cached: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isChatbotAnswer = (value: unknown): value is ChatbotAnswer =>
  isRecord(value) && typeof value.answer === 'string';

export const chatbotApi = {
  getFaqs: async (): Promise<ApiResponse<Faq[]>> => {
    if (USE_MOCK) return mockApi.chatbot.faqs();
    const { data } = await apiClient.get<ApiResponse<Faq[]>>('/chatbot/faqs');
    return data;
  },
  sendMessage: async (request: ChatbotRequest): Promise<ApiResponse<ChatbotAnswer>> => {
    if (USE_MOCK) return mockApi.chatbot.send(request);
    try {
      const { data } = await apiClient.post<ApiResponse<ChatbotAnswer> | unknown>('/chatbot/messages', request);
      if (isRecord(data) && isChatbotAnswer(data.data)) {
        return data as ApiResponse<ChatbotAnswer>;
      }
      return toApiResponse(fallbackAnswer, '챗봇 응답을 불러오지 못했습니다.');
    } catch {
      return toApiResponse(fallbackAnswer, '챗봇 응답을 불러오지 못했습니다.');
    }
  },
};
