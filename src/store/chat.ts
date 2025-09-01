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
  ensureSession: (sessionId: ID, title?: string) => void;
  addLocalMessage: (sessionId: ID, msg: ChatMessage) => void;
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
    set((s) => ({ messagesBySession: { ...s.messagesBySession, [sessionId]: [ ...(s.messagesBySession[sessionId] || []), msg ] } })),
  listSessions: async (patientId, caseId) => {
    set({ loading: true, error: null });
    try {
      const res = await ChatApi.listSessions(patientId, caseId);
      set((s) => ({ sessionsByCase: { ...s.sessionsByCase, [caseId]: res.items } }));
      return res.items;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } catch (e) {
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
