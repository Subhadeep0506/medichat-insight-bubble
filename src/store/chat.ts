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
  deleteSession: (sessionId: ID, caseId: ID) => Promise<void>;
  sendMessage: (sessionId: ID, caseId: ID, patientId: ID, content: string, attachments?: UploadAttachment[]) => Promise<ChatMessage>;
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
    set((s) => ({ messagesBySession: { ...s.messagesBySession, [sessionId]: [...(s.messagesBySession[sessionId] || []), msg] } })),
  listSessions: async (patientId, caseId) => {
    set({ loading: true, error: null });
    try {
      const res = await ChatApi.listSessions(patientId, caseId);
      set((s) => ({ sessionsByCase: { ...s.sessionsByCase, [caseId]: res.items } }));
      return res.items;
    } catch (e: any) {
      const msg = `${e?.status ? e.status + " " : ""}${e?.data?.detail || e?.message || "Failed to load sessions"}`;
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
      const msg = `${e?.status ? e.status + " " : ""}${e?.data?.detail || e?.message || "Failed to load messages"}`;
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
    const msg = await ChatApi.sendMessage({
      sessionId,
      caseId,
      patientId,
      prompt: content,
    });
    set((s) => ({ messagesBySession: { ...s.messagesBySession, [sessionId]: [...(s.messagesBySession[sessionId] || []), msg] } }));
    return msg;
  },
}));
