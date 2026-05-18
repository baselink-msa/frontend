import { mockApi } from '../mocks/mockApi';
import type { ChatbotAnswer, ChatbotRequest, Faq } from '../types/chatbot';
import type { ApiResponse } from '../types/common';
import { apiClient, USE_MOCK } from './client';

export const chatbotApi = {
  getFaqs: async (): Promise<ApiResponse<Faq[]>> => {
    if (USE_MOCK) return mockApi.chatbot.faqs();
    const { data } = await apiClient.get<ApiResponse<Faq[]>>('/chatbot/faqs');
    return data;
  },
  sendMessage: async (request: ChatbotRequest): Promise<ApiResponse<ChatbotAnswer>> => {
    if (USE_MOCK) return mockApi.chatbot.send(request);
    const { data } = await apiClient.post<ApiResponse<ChatbotAnswer>>('/chatbot/messages', request);
    return data;
  },
};
