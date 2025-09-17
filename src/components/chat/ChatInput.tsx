import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Lightbulb, Stethoscope, Eye, Heart, Brain, Bone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSidebar } from '@/components/ui/sidebar';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  hasImage?: boolean;
  showSuggestions?: boolean;
}

const generalSuggestions = [
  { icon: Stethoscope, text: "What type of medical scan should I upload?" },
  { icon: Eye, text: "How does this AI system analyze medical images?" },
  { icon: Heart, text: "What are the limitations of AI in medical diagnosis?" }
];

const imageSuggestions = [
  { icon: Eye, text: "What abnormalities can you identify in this image?" },
  { icon: Brain, text: "Is this scan within normal parameters?" },
  { icon: Bone, text: "What anatomical structures are visible here?" },
  { icon: Heart, text: "Are there any areas of concern in this image?" },
  { icon: Stethoscope, text: "What follow-up tests might be recommended?" },
  { icon: Lightbulb, text: "Can you explain the technical aspects of this scan?" }
];

export const ChatInput = ({
  onSendMessage,
  disabled,
  onTypingChange,
  onSuggestionSelect,
  hasImage,
  showSuggestions
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { state, isMobile } = useSidebar();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      onTypingChange?.(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    onTypingChange?.(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion);
    onTypingChange?.(false);
  };

  useEffect(() => {
    return () => {
      onTypingChange?.(false);
    };
  }, [onTypingChange]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = hasImage ? imageSuggestions : generalSuggestions;

  return (
    // Floating wrapper positioned at the bottom of the chat area. It is centered and responsive.
    <div
      className={`chat-input-wrapper pointer-events-none z-40 absolute left-0 right-0 bottom-4 md:bottom-6 flex justify-center px-4`}
      aria-hidden={false}
    >
      <div
        className={`chat-input-container relative z-30 pointer-events-auto w-full md:w-[min(60rem,calc(100%_-_4rem))] bg-white/40 dark:bg-slate-800/40 border border-slate-900/20 dark:border-white/20 backdrop-blur-md rounded-[16px] px-4 py-3 shadow-lg flex items-center gap-3`}
        data-sidebar-state={state}
      >
        <div className="flex-1 relative">
          {showSuggestions && (
            <div className="absolute -top-2 left-0 right-0 transform translate-y-[-100%] mb-2 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
              <div className="p-2 border-b border-border text-xs text-muted-foreground flex items-center">
                <Lightbulb className="h-3 w-3 mr-1" />
                Suggested questions
              </div>
              {suggestions.map((suggestion, index) => {
                const IconComponent = suggestion.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center text-sm border-b border-border/50 last:border-b-0"
                  >
                    <IconComponent className="h-3 w-3 mr-2 text-primary/60 flex-shrink-0" />
                    <span className="truncate">{suggestion.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          <Textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the medical image or request analysis..."
            className="min-h-[44px] md:min-h-[54px] pr-12 resize-none bg-transparent ring-0 border-0 text-sm md:text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none"
            disabled={disabled}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-10 md:h-12 px-3 md:px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all text-sm md:text-base rounded-full"
        >
          <Send className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>

    </div>
  );
};
