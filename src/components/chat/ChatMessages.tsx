import type { ChatMessage as UiMessage } from "../MedicalChatInterface";
import { MessageBubble } from "./MessageBubble";
import { LoadingMessage } from "./LoadingMessage";
import { MessageSquare } from "lucide-react";

interface ChatMessagesProps {
  messages: UiMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({
  messages,
  isLoading,
  messagesEndRef,
}: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-28 md:pb-36 space-y-3 md:space-y-3 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-slate-500/30 dark:to-slate-800/30">
      {messages.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <MessageSquare className="h-16 w-16 mb-4 opacity-60" />
          <h3 className="text-lg font-semibold">No conversations yet</h3>
          <p className="text-sm mt-2">Please start the conversations</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && <LoadingMessage />}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
