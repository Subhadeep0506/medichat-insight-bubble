import type { ChatMessage as UiMessage } from '../MedicalChatInterface';
import { MessageBubble } from './MessageBubble';
import { LoadingMessage } from './LoadingMessage';

interface ChatMessagesProps {
  messages: UiMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({ messages, isLoading, messagesEndRef }: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-28 md:pb-36 space-y-3 md:space-y-6 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-slate-500/30 dark:to-slate-800/30">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && <LoadingMessage />}

      <div ref={messagesEndRef} />
    </div>
  );
};
