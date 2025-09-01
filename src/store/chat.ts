import { create } from "zustand";
import type { ID, ChatSession, ChatMessage, UploadAttachment } from "@/types/domain";
import { ChatApi } from "@/api/chat";

interface ChatState {
  sessionsByCase: Record<ID, ChatSession[]>;
  messagesBySession: Record<ID, ChatMessage[]>;
  currentSessionId: ID | null;
  loading: boolean;
  error: string | null;
  setCurrentSession: (sessionId: ID | null) => void;
  listSessions: (patientId: ID, caseId: ID) => Promise<ChatSession[]>;
  startSession: (patientId: ID, caseId: ID, title?: string) => Promise<ChatSession>;
  listMessages: (sessionId: ID) => Promise<ChatMessage[]>;
  sendMessage: (sessionId: ID, content: string, attachments?: UploadAttachment[]) => Promise<ChatMessage>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionsByCase: {},
  messagesBySession: {},
  currentSessionId: null,
  loading: false,
  error: null,
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  listSessions: async (patientId, caseId) => {
    set({ loading: true, error: null });
    try {
      const res = await ChatApi.listSessions(patientId, caseId);
      set((s) => ({ sessionsByCase: { ...s.sessionsByCase, [caseId]: res.items } }));
      return res.items;
    } catch (e: any) {
      set({ error: e?.data?.message || e?.message || "Failed to load sessions" });
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
      set({ error: e?.data?.message || e?.message || "Failed to load messages" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  sendMessage: async (sessionId, content, attachments) => {
    const msg = await ChatApi.sendMessage(sessionId, { content, attachments });
    set((s) => ({ messagesBySession: { ...s.messagesBySession, [sessionId]: [ ...(s.messagesBySession[sessionId] || []), msg ] } }));
    return msg;
  },
}));
