
import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Mic, MicOff, Lightbulb, Stethoscope, Eye, Heart, Brain, Bone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  const [isListening, setIsListening] = useState(false);

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

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
  };

  const suggestions = hasImage ? imageSuggestions : generalSuggestions;

  return (
    <div className="space-y-2">
      {/* Google-style autocomplete suggestions */}
      {showSuggestions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
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

      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the medical image or request analysis..."
            className="min-h-[60px] pr-12 resize-none border-2 border-input focus:border-primary transition-colors"
            disabled={disabled}
          />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleVoiceInput}
            className={`absolute bottom-2 right-2 h-8 w-8 p-0 ${
              isListening ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-[60px] px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
};
