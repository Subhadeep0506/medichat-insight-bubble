import React, { useState, useRef } from 'react';
import { useChatStore } from '@/store';
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

  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = chatSessions[currentChatId];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = currentSession?.messages || [];

  const ensureSession = useChatStore((s) => s.ensureSession);
  const addLocalMessage = useChatStore((s) => s.addLocalMessage);

  React.useEffect(() => {
    ensureSession(currentChatId, currentSession?.title);
  }, [currentChatId, currentSession?.title, ensureSession]);

  const mirrored = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    messages.forEach((m) => {
      if (mirrored.current.has(m.id)) return;
      mirrored.current.add(m.id);
      addLocalMessage(currentChatId, {
        id: m.id,
        sessionId: currentChatId,
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
        createdAt: m.timestamp.toISOString(),
      });
    });
  }, [messages, currentChatId, addLocalMessage]);

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
      image: currentImages.length > 0 ? currentImages[0] : undefined,
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
        content: `The provided chest X-ray image shows a significant area of increased opacity in the right lower lung field, which is a concerning finding. Here's a detailed analysis of the image:  
## **Observations**:  
### Right Lower Lung Field:
There is a prominent area of increased density in the right lower lung field, which is not consistent with normal lung tissue.  
This increased density could represent several possibilities, including:  
- Pneumonia: Consolidation from bacterial, viral, or fungal infection.  
- Atelectasis: Collapse of part of the lung due to obstruction or disease.  
- Mass or Tumor: A solid mass could also cause this appearance.  
- Hematoma or Hemorrhage: Bleeding into the lung tissue.  
- Other Pathologies: Such as lymphangitis, pulmonary embolism, or other inflammatory processes.  
### Other Lung Fields:
The left lung field appears relatively normal, with no significant opacities or consolidations.  
The lung fields above the right lower lobe do not show any obvious signs of consolidation or other abnormalities.  
- Bony Structures: The ribs, clavicles, and spine appear intact without any fractures or deformities. The diaphragm is visible and appears to be in a normal position.  
- Mediastinum: The mediastinum does not appear widened, suggesting no significant shift of the heart or great vessels.  
- Pleural Spaces: The pleural spaces appear clear, with no evidence of pleural effusion.  
## **Possible Interpretations:**  
**Pneumonia**: The most likely initial interpretation is that the increased density in the right lower lung field represents consolidation, which is a common finding in pneumonia. However, further investigation is necessary to confirm the diagnosis.  
**Other Pathologies**: Other possibilities include atelectasis, mass, or hemorrhage. These require further evaluation with additional imaging studies, such as a CT scan, and possibly a biopsy or other diagnostic tests.  
## **Recommendations:**  
**Consultation with a Radiologist:**
A radiologist should review the X-ray to provide a more detailed interpretation and assess the extent and nature of the abnormality.  
**Clinical Correlation:**
The patient's symptoms, medical history, and physical examination findings should be correlated with the X-ray results. Symptoms such as cough, fever, shortness of breath, and sputum production can help narrow down the differential diagnosis.  
**Further Imaging:**
If the radiologist suspects pneumonia, a CT scan may be ordered to better characterize the lesion and rule out other possibilities.  
If the suspicion is high for a mass or other serious pathology, a CT-guided biopsy might be considered.  
**Antibiotic Therapy:**
If the radiologist confirms pneumonia, appropriate antibiotic therapy should be initiated based on the suspected causative organism (e.g., Streptococcus pneumoniae, Haemophilus influenzae, or Mycoplasma pneumoniae).  
## **Follow-Up**:
The patient should be monitored closely, and repeat X-rays may be taken after treatment to ensure resolution of the abnormality.  
In conclusion, while the X-ray suggests a possible pneumonia in the right lower lung field, a definitive diagnosis requires a comprehensive evaluation by a medical professional. Immediate consultation with a radiologist and appropriate clinical correlation are essential steps in the management of this case.`,
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
      // setCurrentImages([]); // Clear images after response
    }, 2000);
  };

  const handleImageUpload = (imageUrls: string[]) => {
    setCurrentImages(imageUrls);
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
    setCurrentImages([]);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setCurrentImages([]);
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
          <div className="flex items-center gap-2 p-2 md:p-4 border-b">
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

              <div className="border-t bg-gray-50/50 p-2 md:p-4 space-y-2 md:space-y-4 dark:bg-slate-800/50">
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImages={currentImages}
                />

                <div className="relative">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    onTypingChange={setIsTyping}
                    onSuggestionSelect={handleSuggestionSelect}
                    hasImage={currentImages.length > 0}
                    showSuggestions={isTyping}
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
