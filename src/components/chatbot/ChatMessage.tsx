import type { ChatMessage as ChatMessageType } from '../../types/chatbot';

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const mine = message.role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-lg px-4 py-3 text-sm ${
          mine ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-800'
        }`}
      >
        <p>{message.text}</p>
        {!mine && (message.source || message.cached !== undefined) ? (
          <p className="mt-2 text-xs text-slate-500">
            source {message.source} · cached {String(message.cached)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
