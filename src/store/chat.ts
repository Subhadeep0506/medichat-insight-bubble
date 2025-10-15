import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ID, ChatSession, ChatMessage, UploadAttachment } from "@/types/domain";
import { ChatApi } from "@/api/chat";

interface ChatState {
  sessionsByCase: Record<ID, ChatSession[]>;
  messagesBySession: Record<ID, ChatMessage[]>;
  currentSessionId: ID | null;
  loading: boolean;
  error: string | null;
  setCurrentSession: (sessionId: ID | null) => void;
  ensureSession: (sessionId: ID, title?: string) => void;
  addLocalMessage: (sessionId: ID, msg: ChatMessage) => void;
  listSessions: (patientId: ID, caseId: ID) => Promise<ChatSession[]>;
  startSession: (patientId: ID, caseId: ID, title?: string) => Promise<ChatSession>;
  listMessages: (sessionId: ID) => Promise<ChatMessage[]>;
  deleteSession: (sessionId: ID, caseId: ID) => Promise<void>;
  sendMessage: (sessionId: ID, caseId: ID, patientId: ID, content: string, attachments?: UploadAttachment[]) => Promise<ChatMessage>;
  updateSession: (sessionId: ID, caseId: ID, title: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessionsByCase: {},
      messagesBySession: {},
      currentSessionId: null,
      loading: false,
      error: null,
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
      ensureSession: (sessionId, title) =>
        set((s) => {
          if (s.messagesBySession[sessionId]) return s;
          const welcome: ChatMessage = {
            id: `${sessionId}_welcome`,
            sessionId,
            role: "assistant",
            content:
              "Hello! I'm here to help you analyze medical images and answer your questions. Please upload an image and ask your question.",
            createdAt: new Date().toISOString(),
          };
          return { messagesBySession: { ...s.messagesBySession, [sessionId]: [welcome] } };
        }),
      addLocalMessage: (sessionId, msg) =>
        set((s) => ({ messagesBySession: { ...s.messagesBySession, [sessionId]: [...(s.messagesBySession[sessionId] || []), msg] } })),
      listSessions: async (patientId, caseId) => {
        set({ loading: true, error: null });
        try {
          const res = await ChatApi.listSessions(patientId, caseId);
          const items = res.items || [];
          set((s) => ({
            sessionsByCase: { ...s.sessionsByCase, [caseId]: items },
          }));
          return items;
        } catch (e: any) {
          const msg = e.data?.detail ?? String(e);
          set({ error: msg });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
      startSession: async (patientId, caseId, title) => {
        const session = await ChatApi.startSession(patientId, caseId, title);
        set((s) => ({ sessionsByCase: { ...s.sessionsByCase, [caseId]: [session, ...(s.sessionsByCase[caseId] || [])] }, currentSessionId: session.id }));
        return session;
      },
      listMessages: async (sessionId) => {
        set({ loading: true, error: null });
        try {
          const res = await ChatApi.listMessages(sessionId);
          set((s) => ({ messagesBySession: { ...s.messagesBySession, [sessionId]: res.items } }));
          return res.items;
        } catch (e: any) {
          const msg = e.data.detail
          set({ error: msg });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
      deleteSession: async (sessionId, caseId) => {
        await ChatApi.deleteHistory(sessionId);
        set((s) => {
          const { [sessionId]: _removed, ...restMsgs } = s.messagesBySession;
          const sessions = (s.sessionsByCase[caseId] || []).filter((x) => x.id !== sessionId);
          const next = { ...s.sessionsByCase, [caseId]: sessions };
          const nextCurrent = s.currentSessionId === sessionId ? (sessions[0]?.id || null) : s.currentSessionId;
          return { messagesBySession: restMsgs, sessionsByCase: next, currentSessionId: nextCurrent };
        });
      },
      sendMessage: async (sessionId, caseId, patientId, content, attachments) => {
        const { settings } = (await import("./settings")).useChatSettingsStore.getState();
        const msg = await ChatApi.sendMessage({
          sessionId,
          caseId,
          patientId,
          prompt: content,
          model: settings.model,
          model_provider: settings.modelProvider,
          temperature: settings.temperature,
          top_p: settings.top_p,
          max_tokens: settings.max_tokens,
        });
        set((s) => {
          const msgs = [...(s.messagesBySession[sessionId] || []), msg];
          const sessions = (s.sessionsByCase[caseId] || []).map((ses) =>
            ses.id === sessionId ? { ...ses, updatedAt: new Date().toISOString() } : ses
          );
          return {
            messagesBySession: { ...s.messagesBySession, [sessionId]: msgs },
            sessionsByCase: { ...s.sessionsByCase, [caseId]: sessions },
          };
        });
        return msg;
      },
      updateSession: async (sessionId, caseId, title) => {
        // Call backend to update title
        await ChatApi.updateSession(sessionId, title);
        // Update local store
        set((s) => {
          const sessions = (s.sessionsByCase[caseId] || []).map((ses) =>
            ses.id === sessionId ? { ...ses, title, updatedAt: new Date().toISOString() } : ses
          );
          return { sessionsByCase: { ...s.sessionsByCase, [caseId]: sessions } };
        });
      },
    }),
    {
      name: "chat-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sessionsByCase: s.sessionsByCase, messagesBySession: s.messagesBySession }),
    }
  )
);
