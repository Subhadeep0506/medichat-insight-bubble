
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
  category: 'radiology' | 'cardiology' | 'neurology' | 'orthopedics' | 'general' | 'pathology';
  tags: string[];
}

interface MedicalChatInterfaceProps {
  caseId?: string;
  onBackToCase?: () => void;
}

export const MedicalChatInterface = ({ caseId, onBackToCase }: MedicalChatInterfaceProps) => {
  const [currentChatId, setCurrentChatId] = useState<string>(() => caseId || 'default');
  const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>(() => {
    const defaultSession = {
      id: 'default',
      title: 'Medical Image Analysis',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: 'general' as const,
      tags: ['initial', 'consultation'],
      messages: [
        {
          id: '1',
          type: 'assistant' as const,
          content: 'Hello! I\'m here to help you analyze medical images and answer your questions. Please upload an image and ask your question.',
          timestamp: new Date(),
          responsibilityScore: 95,
          responsibilityReason: 'This greeting follows medical AI guidelines by clearly stating capabilities and limitations while maintaining a professional tone.'
        }
      ]
    };

    // If a caseId is provided, create a session for it
    if (caseId && caseId !== 'default') {
      const caseSession = {
        ...defaultSession,
        id: caseId,
        title: `Case ${caseId}`,
        tags: ['case', 'consultation']
      };
      return {
        default: defaultSession,
        [caseId]: caseSession
      };
    }

    return { default: defaultSession };
  });
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = chatSessions[currentChatId];
  const messages = currentSession?.messages || [];

  // Safety check - if currentSession doesn't exist, create it
  React.useEffect(() => {
    if (!currentSession && currentChatId) {
      const newSession: ChatSession = {
        id: currentChatId,
        title: `Case ${currentChatId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: 'general',
        tags: ['case', 'consultation'],
        messages: [
          {
            id: currentChatId + '_welcome',
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
        [currentChatId]: newSession
      }));
    }
  }, [currentChatId, currentSession]);

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

  const categorizeChat = (message: string): 'radiology' | 'cardiology' | 'neurology' | 'orthopedics' | 'general' | 'pathology' => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('x-ray') || lowerMessage.includes('mri') || lowerMessage.includes('ct') || lowerMessage.includes('scan')) {
      return 'radiology';
    } else if (lowerMessage.includes('heart') || lowerMessage.includes('cardiac') || lowerMessage.includes('ecg')) {
      return 'cardiology';
    } else if (lowerMessage.includes('brain') || lowerMessage.includes('neuro') || lowerMessage.includes('spine')) {
      return 'neurology';
    } else if (lowerMessage.includes('bone') || lowerMessage.includes('joint') || lowerMessage.includes('fracture')) {
      return 'orthopedics';
    } else if (lowerMessage.includes('tissue') || lowerMessage.includes('biopsy') || lowerMessage.includes('cell')) {
      return 'pathology';
    }
    
    return 'general';
  };

  const generateTags = (message: string, category: string): string[] => {
    const tags: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Add category-specific tags
    tags.push(category);
    
    // Add common medical terms as tags
    const medicalTerms = ['diagnosis', 'analysis', 'scan', 'image', 'symptom', 'treatment', 'urgent', 'follow-up'];
    medicalTerms.forEach(term => {
      if (lowerMessage.includes(term)) {
        tags.push(term);
      }
    });
    
    // Add some sample tags for demo
    if (lowerMessage.includes('pain')) tags.push('pain assessment');
    if (lowerMessage.includes('urgent')) tags.push('urgent');
    if (lowerMessage.includes('follow')) tags.push('follow-up');
    
    return tags.slice(0, 4); // Limit to 4 tags
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
      const currentSession = prev[currentChatId];
      if (!currentSession) return prev; // Safety check
      
      const isFirstUserMessage = currentSession.messages.length === 1;
      const category = isFirstUserMessage ? categorizeChat(content) : currentSession.category;
      const newTags = isFirstUserMessage ? generateTags(content, category) : currentSession.tags;

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
        updatedAt: new Date(),
        category,
        tags: newTags,
        title: isFirstUserMessage ? generateChatTitle(content) : currentSession.title
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
        content: `The image you provided appears to be a chest X-ray. Here are some observations that can help in assessing whether there might be any abnormalities:

**Lung Fields:** The lung fields show increased opacities, which could indicate consolidation, pleural effusion, or other pathologies such as pneumonia, pulmonary edema, or fibrosis.

**Heart Size and Shape:** The heart size and shape appear within normal limits. However, the heart borders should always be carefully evaluated separately for any signs of enlargement or distortion.

**Bony Structures:** The bony structures (ribs, clavicles, scapulae) appear intact without any obvious fractures or deformities.

**Diaphragm:** The diaphragm appears to be intact with no signs of elevation or flattening, which could suggest a condition like atelectasis or pleural effusion.

**Mediastinum:** The mediastinum appears to be within normal limits, with no widening or shift of the trachea.

**Pleural Spaces:** There do not appear to be any significant pleural effusions based on this image.

**Recommendations:**
- **Consultation with a Radiologist:** A professional radiologist is best equipped to interpret chest X-rays accurately.
- **Clinical Context:** The interpretation of an X-ray should always be done in conjunction with the patient's clinical history, symptoms, and physical examination findings.

If you have concerns about the image, it would be advisable to consult with a healthcare provider who can provide a more detailed analysis and appropriate medical advice.`,
        timestamp: new Date(),
        responsibilityScore: 92,
        responsibilityReason: 'This response provides detailed medical analysis while emphasizing the importance of professional medical consultation and avoiding definitive diagnoses.'
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
      setCurrentImage(null); // Clear image after response
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
      category: 'general',
      tags: ['new consultation'],
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
      createdAt: session.createdAt,
      messageCount: session.messages.length,
      category: session.category,
      tags: session.tags
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
            <ChatHeader onBackToCase={onBackToCase} />
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
              />
              
              {/* Image Preview */}
              {currentImage && (
                <div className="p-4 border-t border-border bg-muted/30">
                  <div className="max-w-xs">
                    <img 
                      src={currentImage} 
                      alt="Uploaded medical image" 
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}

              <div className="border-t bg-gray-50/50 p-4 space-y-4 dark:bg-slate-800/50">
                {!isLoading && messages.length <= 1 && (
                  <ImageUpload 
                    onImageUpload={handleImageUpload}
                    currentImage={currentImage}
                  />
                )}
                
                <div className="relative">
                  <ChatInput 
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    onTypingChange={setIsTyping}
                    onSuggestionSelect={handleSuggestionSelect}
                    hasImage={!!currentImage}
                    showSuggestions={isTyping && messages.length <= 1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
