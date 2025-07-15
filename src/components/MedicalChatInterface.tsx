
import React, { useState, useRef } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ChatHistorySidebar, ChatHistory } from './chat/ChatHistorySidebar';
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

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MedicalChatInterface = () => {
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>({
    default: {
      id: 'default',
      title: 'Medical Image Analysis',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: 'Hello! I\'m here to help you analyze medical images and answer your questions. Please upload an image and ask your question.',
          timestamp: new Date(),
          responsibilityScore: 95,
          responsibilityReason: 'This greeting follows medical AI guidelines by clearly stating capabilities and limitations while maintaining a professional tone.'
        }
      ]
    }
  });
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = chatSessions[currentChatId];
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 4);
    return words.length > 0 ? words.join(' ') + '...' : 'New Chat';
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content,
      image: currentImage || undefined,
      timestamp: new Date()
    };

    // Update current session with new message
    setChatSessions(prev => {
      const updatedSession = {
        ...prev[currentChatId],
        messages: [...prev[currentChatId].messages, userMessage],
        updatedAt: new Date(),
        // Update title if this is the first user message
        title: prev[currentChatId].messages.length === 1 ? generateChatTitle(content) : prev[currentChatId].title
      };

      return {
        ...prev,
        [currentChatId]: updatedSession
      };
    });

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

      setChatSessions(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: [...prev[currentChatId].messages, assistantMessage],
          updatedAt: new Date()
        }
      }));

      setIsLoading(false);
    }, 2000);
  };

  const handleImageUpload = (imageUrl: string) => {
    setCurrentImage(imageUrl);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newSession: ChatSession = {
      id: newChatId,
      title: 'New Medical Analysis',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: newChatId + '_welcome',
          type: 'assistant',
          content: 'Hello! I\'m here to help you analyze medical images and answer your questions. Please upload an image and ask your question.',
          timestamp: new Date(),
          responsibilityScore: 95,
          responsibilityReason: 'This greeting follows medical AI guidelines by clearly stating capabilities and limitations while maintaining a professional tone.'
        }
      ]
    };

    setChatSessions(prev => ({
      ...prev,
      [newChatId]: newSession
    }));
    
    setCurrentChatId(newChatId);
    setCurrentImage(null);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setCurrentImage(null);
  };

  const handleDeleteChat = (chatId: string) => {
    if (Object.keys(chatSessions).length === 1) return; // Don't delete the last chat

    setChatSessions(prev => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });

    if (currentChatId === chatId) {
      const remainingChats = Object.keys(chatSessions).filter(id => id !== chatId);
      setCurrentChatId(remainingChats[0]);
    }
  };

  const chatHistories: ChatHistory[] = Object.values(chatSessions)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(session => ({
      id: session.id,
      title: session.title,
      lastMessage: session.messages[session.messages.length - 1]?.content || '',
      timestamp: session.updatedAt,
      messageCount: session.messages.length
    }));

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <ChatHistorySidebar
          chatHistories={chatHistories}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-4 border-b">
            <SidebarTrigger />
            <ChatHeader />
          </div>
          
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
      </div>
    </SidebarProvider>
  );
};
