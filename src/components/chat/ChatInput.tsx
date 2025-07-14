
import React, { useState, KeyboardEvent } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

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

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about the medical image or request analysis..."
          className="min-h-[60px] pr-12 resize-none border-2 border-gray-200 focus:border-blue-400 transition-colors"
          disabled={disabled}
        />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleVoiceInput}
          className={`absolute bottom-2 right-2 h-8 w-8 p-0 ${
            isListening ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="h-[60px] px-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all"
      >
        <Send className="h-4 w-4 mr-2" />
        Send
      </Button>
    </div>
  );
};
