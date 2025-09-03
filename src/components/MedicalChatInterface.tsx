/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ChatHistorySidebar, ChatHistory } from './chat/ChatHistorySidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { ImageUpload } from './chat/ImageUpload';
import { useChatStore, useCasesStore } from '@/store';
import { CasesApi } from '@/api/cases';
import type { Patient, CaseRecord } from '@/types/domain';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
  responsibilityScore?: number;
  responsibilityReason?: string;
}

interface MedicalChatInterfaceProps {
  caseId?: string;
  onBackToCase?: () => void;
}

export const MedicalChatInterface = ({ caseId, onBackToCase }: MedicalChatInterfaceProps) => {
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sessionsByCase,
    messagesBySession,
    currentSessionId,
    setCurrentSession,
    listSessions,
    startSession,
    listMessages,
    sendMessage,
    addLocalMessage,
  } = useChatStore();
  const findPatientIdByCaseId = useCasesStore((s) => s.findPatientIdByCaseId);

  const [resolvedPatientId, setResolvedPatientId] = useState<string | undefined>(undefined);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const patientId = useMemo(() => (caseId ? findPatientIdByCaseId(caseId) || resolvedPatientId : undefined), [caseId, findPatientIdByCaseId, resolvedPatientId]);
  const sessions = useMemo(() => (caseId ? sessionsByCase[caseId] || [] : []), [sessionsByCase, caseId]);
  const uiMessages: ChatMessage[] = useMemo(() => {
    const sid = currentSessionId;
    const storeMsgs = sid ? messagesBySession[sid] || [] : [];
    return storeMsgs.map((m) => ({
      id: m.id,
      type: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
      responsibilityScore: m.role !== 'user' ? m.safetyScore : undefined,
      responsibilityReason: m.role !== 'user' ? (m.safetyJustification || (m.safetyLevel ? `Safety level: ${m.safetyLevel}` : undefined)) : undefined,
    }));
  }, [messagesBySession, currentSessionId]);

  React.useEffect(() => {
    const resolve = async () => {
      if (!caseId) return;
      const existing = findPatientIdByCaseId(caseId);
      if (existing) {
        setResolvedPatientId(existing);
      }
      try {
        const c = await CasesApi.get(caseId);
        setCaseData(c || null);
        if (c?.patientId) setResolvedPatientId(c.patientId);
      } catch (e: any) {
        toast({ title: "Failed to load patient", description: e.data.detail, variant: "destructive" })
      }
    };
    resolve();
  }, [caseId, findPatientIdByCaseId]);

  React.useEffect(() => {
    const run = async () => {
      if (!caseId || !patientId) return;
      try {
        const list = await listSessions(patientId, caseId);
        let sid = list[0]?.id;
        if (!sid) {
          const s = await startSession(patientId, caseId, `Case ${caseId}`);
          sid = s.id;
        }
        setCurrentSession(sid || null);
        if (sid) await listMessages(sid);
      } catch (e: any) {
        toast({ title: "Failed to load patient", description: e.data.detail, variant: "destructive" })
      }
    };
    run();
  }, [caseId, patientId, listSessions, startSession, listMessages, setCurrentSession]);

  React.useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      try {
        const { PatientsApi } = await import("@/api/patients");
        const p = await PatientsApi.get(patientId);
        setPatientData(p || null);
      } catch (e: any) {
        toast({ title: "Failed to load patient", description: e.data.detail, variant: "destructive" })
      }
    };
    loadPatient();
  }, [patientId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uiMessages.length]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !caseId || !patientId || !currentSessionId) return;
    const now = new Date().toISOString();
    addLocalMessage(currentSessionId, {
      id: `${currentSessionId}_${Date.now()}_local_user`,
      sessionId: currentSessionId,
      role: 'user',
      content,
      createdAt: now,
    } as any);
    setIsLoading(true);
    try {
      await sendMessage(currentSessionId, caseId, patientId, content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (imageUrls: string[]) => {
    setCurrentImages(imageUrls);
  };

  const handleNewChat = async () => {
    if (!caseId || !patientId) return;
    const s = await startSession(patientId, caseId, 'New Medical Analysis');
    setCurrentSession(s.id);
    await listMessages(s.id);
    setCurrentImages([]);
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentSession(chatId);
    if (!messagesBySession[chatId]) await listMessages(chatId);
    setCurrentImages([]);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!caseId) return;
    const del = useChatStore.getState().deleteSession;
    await del(chatId, caseId);
  };

  const chatHistories: ChatHistory[] = useMemo(() => {
    return sessions
      .slice()
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .map((s) => {
        const msgs = messagesBySession[s.id] || [];
        const last = msgs[msgs.length - 1];
        return {
          id: s.id,
          title: s.title || `Session ${s.id}`,
          lastMessage: last?.content || '',
          timestamp: last?.createdAt ? new Date(last.createdAt) : new Date(s.updatedAt || Date.now()),
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          messageCount: msgs.length,
          category: 'general',
          tags: [],
        };
      });
  }, [sessions, messagesBySession]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <ChatHistorySidebar
          chatHistories={chatHistories}
          currentChatId={currentSessionId || null}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          patient={patientData}
          caseRecord={caseData}
        />

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 md:p-4 border-b">
            <SidebarTrigger />
            <ChatHeader onBackToCase={onBackToCase} />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <ChatMessages
                messages={uiMessages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
              />

              <div className="border-t bg-gray-50/50 p-2 md:p-4 space-y-2 md:space-y-4 dark:bg-slate-800/50">
                <ImageUpload onImageUpload={handleImageUpload} currentImages={currentImages} />
                <div className="relative">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    onTypingChange={setIsTyping}
                    onSuggestionSelect={(s) => handleSendMessage(s)}
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
