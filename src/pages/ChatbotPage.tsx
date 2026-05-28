import { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatbotApi } from '../api/chatbotApi';
import { ChatMessage } from '../components/chatbot/ChatMessage';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { ChatMessage as ChatMessageType } from '../types/chatbot';

export function ChatbotPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: 'hello', role: 'assistant', text: '야구 용어와 예매 흐름을 물어보세요.', source: 'FAQ', cached: true },
  ]);
  const [error, setError] = useState('');
  const faqsQuery = useQuery({ queryKey: ['faqs'], queryFn: chatbotApi.getFaqs });

  const sendMutation = useMutation({
    mutationFn: chatbotApi.sendMessage,
    onSuccess: (response) => {
      const answer = response.data?.answer || '지금은 답변을 불러오지 못했습니다. 등록된 FAQ를 선택하거나 잠시 후 다시 시도해 주세요.';
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: answer,
          source: response.data?.source ?? 'FALLBACK',
          cached: response.data?.cached ?? false,
        },
      ]);
      setError('');
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: '지금은 답변을 불러오지 못했습니다. 잠시 후 다시 시도하거나 등록된 FAQ를 선택해 주세요.',
          source: 'FALLBACK',
        },
      ]);
      setError(err.message || '챗봇 응답에 실패했습니다.');
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sendMutation.isPending) return;
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', text: trimmedMessage }]);
    sendMutation.mutate({ message: trimmedMessage });
    setMessage('');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-5">
        <h1 className="text-3xl font-bold text-slate-950">FAQ 챗봇</h1>
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
        <div className="mt-5 flex h-[520px] flex-col gap-4 overflow-y-auto rounded-lg bg-slate-50 p-4">
          {messages.map((item) => (
            <ChatMessage key={item.id} message={item} />
          ))}
          {sendMutation.isPending ? (
            <ChatMessage
              message={{
                id: 'assistant-pending',
                role: 'assistant',
                text: '답변을 찾는 중입니다.',
              }}
            />
          ) : null}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="병살타가 뭐야?"
            disabled={sendMutation.isPending}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-3"
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMutation.isPending}
            className="rounded-md bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {sendMutation.isPending ? '전송 중' : '전송'}
          </button>
        </form>
      </div>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">등록 FAQ</h2>
        <div className="mt-4">
          <ErrorMessage message={faqsQuery.error?.message} />
        </div>
        <div className="mt-4 space-y-3">
          {faqsQuery.isLoading ? (
            <p className="text-sm text-slate-500">FAQ를 불러오는 중입니다.</p>
          ) : null}
          {!faqsQuery.isLoading && !faqsQuery.data?.data.length && !faqsQuery.error ? (
            <p className="text-sm text-slate-500">등록된 FAQ가 없습니다.</p>
          ) : null}
          {faqsQuery.data?.data.map((faq) => (
            <button
              type="button"
              key={faq.faqId}
              onClick={() => setMessage(faq.question)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {faq.question}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
