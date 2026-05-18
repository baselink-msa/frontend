export type Faq = {
  faqId: number;
  category: string;
  question: string;
  answer: string;
  enabled: boolean;
};

export type ChatbotRequest = {
  message: string;
};

export type ChatbotAnswer = {
  answer: string;
  source: 'FAQ' | 'LLM' | 'FALLBACK';
  cached: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  cached?: boolean;
};
