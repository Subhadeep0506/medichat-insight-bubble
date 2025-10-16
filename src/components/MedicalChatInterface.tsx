import React, { useMemo, useRef, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistorySidebar, ChatHistory } from "./chat/ChatHistorySidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInput } from "./chat/ChatInput";
import { ImageUpload } from "./chat/ImageUpload";
import { useChatStore, useCasesStore } from "@/store";
import { CasesApi } from "@/api/cases";
import type { Patient, CaseRecord } from "@/types/domain";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
  responsibilityScore?: number;
  responsibilityReason?: string;
  // New fields from backend
  serverMessageId?: string | null;
  feedback?: string | null;
  like?: string | null;
  stars?: number | null;
  sessionId?: string;
}

interface MedicalChatInterfaceProps {
  caseId?: string;
  onBackToCase?: () => void;
}

export const MedicalChatInterface = ({
  caseId,
  onBackToCase,
}: MedicalChatInterfaceProps) => {
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
    updateSession,
  } = useChatStore();
  const chatLoading = useChatStore((s) => s.loading);
  const findPatientIdByCaseId = useCasesStore((s) => s.findPatientIdByCaseId);

  const [resolvedPatientId, setResolvedPatientId] = useState<
    string | undefined
  >(undefined);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const patientId = useMemo(
    () =>
      caseId ? findPatientIdByCaseId(caseId) || resolvedPatientId : undefined,
    [caseId, findPatientIdByCaseId, resolvedPatientId]
  );
  const sessions = useMemo(
    () => (caseId ? sessionsByCase[caseId] || [] : []),
    [sessionsByCase, caseId]
  );
  const uiMessages: ChatMessage[] = useMemo(() => {
    const sid = currentSessionId;
    const storeMsgs = sid ? messagesBySession[sid] || [] : [];
    return storeMsgs.map((m) => ({
      id: m.id,
      type: m.role === "user" ? "user" : "assistant",
      content: m.content,
      timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
      responsibilityScore: m.role !== "user" ? m.safetyScore : undefined,
      responsibilityReason:
        m.role !== "user"
          ? m.safetyJustification ||
            (m.safetyLevel ? `Safety level: ${m.safetyLevel}` : undefined)
          : undefined,
      serverMessageId: m.serverMessageId ?? null,
      feedback: m.feedback ?? null,
      like: m.like ?? null,
      stars: m.stars ?? null,
      sessionId: m.sessionId,
    }));
  }, [messagesBySession, currentSessionId]);

  // Attempt to restore persisted chat state early from localStorage to avoid race conditions
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("chat-store");
      if (raw) {
        const parsed = JSON.parse(raw);
        const persistedState = parsed?.state || parsed;
        if (persistedState) {
          const { sessionsByCase: sBC, messagesBySession: mBS } =
            persistedState;
          const current = useChatStore.getState();
          const isEmpty =
            Object.keys(current.sessionsByCase || {}).length === 0 &&
            Object.keys(current.messagesBySession || {}).length === 0;
          if (isEmpty && (sBC || mBS)) {
            useChatStore.setState({
              sessionsByCase: sBC || {},
              messagesBySession: mBS || {},
            });
          }
        }
      }
    } catch (err) {
      // ignore
    }

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
        toast({
          title: "Failed to load patient",
          description: e.data.detail,
          // variant: "destructive",
          type: "error",
        });
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
          const s = await startSession(patientId, caseId, "Initial Session");
          sid = s.id;
        }
        setCurrentSession(sid || null);
        if (sid) await listMessages(sid);
      } catch (e: any) {
        toast({
          title: "Failed to load patient",
          description: e.data.detail,
          // variant: "destructive",
          type: "error",
        });
      }
    };
    run();
  }, [
    caseId,
    patientId,
    listSessions,
    startSession,
    listMessages,
    setCurrentSession,
  ]);

  React.useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      try {
        const { PatientsApi } = await import("@/api/patients");
        const p = await PatientsApi.get(patientId);
        setPatientData(p || null);
      } catch (e: any) {
        toast({
          title: "Failed to load patient",
          description: e.data.detail,
          // variant: "destructive",
          type: "error",
        });
      }
    };
    loadPatient();
  }, [patientId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uiMessages.length]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !caseId || !patientId || !currentSessionId) return;
    const now = new Date().toISOString();
    addLocalMessage(currentSessionId, {
      id: `${currentSessionId}_${Date.now()}_local_user`,
      sessionId: currentSessionId,
      role: "user",
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
    const s = await startSession(patientId, caseId, "New Medical Analysis");
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
      .sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
      )
      .map((s) => {
        const msgs = messagesBySession[s.id] || [];
        const last = msgs[msgs.length - 1];
        return {
          id: s.id,
          title: s.title || `Session ${s.id}`,
          lastMessage: last?.content || "",
          timestamp: last?.createdAt
            ? new Date(last.createdAt)
            : new Date(s.updatedAt || Date.now()),
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          messageCount: msgs.length,
          category: "general",
          tags: [],
        };
      });
  }, [sessions, messagesBySession]);

  const currentSessionTitle = useMemo(() => {
    if (!currentSessionId) return "New Chat";
    const s = sessions.find((ss) => ss.id === currentSessionId);
    return s?.title || "Initial Session";
  }, [currentSessionId, sessions]);

  const showPageSpinner = React.useMemo(() => {
    if (!caseId) return false;
    // if we don't yet know the patient for the case, show spinner
    if (!patientId) return true;
    // if the chat store indicates loading, show spinner
    if (chatLoading) return true;
    // if we don't have a session selected yet, show spinner
    if (!currentSessionId) return true;
    const msgs = messagesBySession[currentSessionId];
    // if we don't have messages for the current session yet, or it's explicitly undefined, show spinner
    if (!msgs) return true;
    // if messages array exists but is empty and the store is loading, show spinner
    if (Array.isArray(msgs) && msgs.length === 0 && chatLoading) return true;

    return false;
  }, [caseId, patientId, currentSessionId, messagesBySession, chatLoading]);

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Root padded so children can have a floating/margin look while staying within viewport height */}
      <div className="flex h-screen w-full bg-background relative p-2 box-border">
        {/* Sidebar wrapper: make sidebar full height inside the padded root so it appears floating */}
        <div className="h-full rounded-lg shadow-lg overflow-hidden">
          <ChatHistorySidebar
            chatHistories={chatHistories}
            currentChatId={currentSessionId || null}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            isLoadingSessions={chatLoading}
            onEditChat={async (chatId: string, title: string) => {
              if (!caseId) return;
              try {
                await updateSession(chatId, caseId, title);
              } catch (e: any) {
                toast({
                  title: "Failed to update session",
                  description: e.data?.detail ?? String(e),
                  // variant: "destructive",
                  type: "error",
                });
              }
            }}
            onBackToCase={onBackToCase}
            patient={patientData}
            caseRecord={caseData}
          />
        </div>

        {/* Chat wrapper: full height so it floats inside the padded root and matches sidebar height */}
        <div className="h-full flex-1 border rounded-lg shadow-lg overflow-hidden">
          <div className="flex-1 flex flex-col relative min-h-0 h-full box-border">
            <div className="flex items-center gap-2 md:p-1 rounded-t-l shadow-md backdrop-blur-lg">
              <SidebarTrigger className="ml-2" />
              <ChatHeader title={currentSessionTitle} />
            </div>

            {/*<div className="flex-1 flex overflow-hidden"> */}
            <div className="flex-1 min-h-0 flex overflow-hidden h-full">
              {/*<div className="flex-1 flex flex-col"> */}
              <div className="flex-1 min-h-0 flex flex-col h-full">
                <ChatMessages
                  messages={uiMessages}
                  isLoading={isLoading}
                  messagesEndRef={messagesEndRef}
                />

                {/* Floating ChatInput is rendered inside the chat column so it overlays messages */}
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
            {showPageSpinner && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />{" "}
                Loading conversations. Please wait...
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
