
import React, { useState, useRef } from 'react';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { ImageUpload } from './chat/ImageUpload';
import { QuestionSuggestions } from './chat/QuestionSuggestions';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
  responsibilityScore?: number;
  responsibilityReason?: string;
}

export const MedicalChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m here to help you analyze medical images and answer your questions. Please upload an image and ask your question.',
      timestamp: new Date(),
      responsibilityScore: 95,
      responsibilityReason: 'This greeting follows medical AI guidelines by clearly stating capabilities and limitations while maintaining a professional tone.'
    }
  ]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content,
      image: currentImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: `Based on your question about "${content}", I've analyzed the provided image. Here's my assessment: This appears to be a medical scan that requires careful examination. I recommend consulting with a qualified healthcare professional for proper diagnosis and treatment recommendations.`,
        timestamp: new Date(),
        responsibilityScore: Math.floor(Math.random() * 20) + 80,
        responsibilityReason: 'This response follows responsible AI practices by providing informative analysis while emphasizing the importance of professional medical consultation and avoiding definitive diagnoses.'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleImageUpload = (imageUrl: string) => {
    setCurrentImage(imageUrl);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-white shadow-2xl">
      <ChatHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
          
          <div className="border-t bg-gray-50/50 p-4 space-y-4">
            <ImageUpload 
              onImageUpload={handleImageUpload}
              currentImage={currentImage}
            />
            
            <QuestionSuggestions 
              onSuggestionSelect={handleSuggestionSelect}
              hasImage={!!currentImage}
            />
            
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
