/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "./http";
import type { ApiListResponse, ChatMessage, ChatSession, ID } from "@/types/domain";
import { v4 as uuidv4 } from "uuid";

function toCamelSession(s: any): ChatSession {
  return {
    id: s.session_id ?? s.id,
    patientId: s.patient_id ?? s.patientId,
    caseId: s.case_id ?? s.caseId,
    title: s.title ?? null,
    createdAt: s.time_created ?? s.created_at ?? s.createdAt,
    updatedAt: s.time_updated ?? s.updated_at ?? s.updatedAt,
  } as ChatSession;
}

export const ChatApi = {
  // Backend has no sessions endpoints. Return empty; store will synthesize sessions.
  listSessions: async (_patientId: ID, _caseId: ID) => ({ items: [] } as ApiListResponse<ChatSession>),
  // Create a new session client-side
  startSession: async (patientId: ID, caseId: ID, title?: string) =>
    toCamelSession({ id: uuidv4(), patient_id: patientId, case_id: caseId, title, time_created: new Date().toISOString(), time_updated: new Date().toISOString() }),
  listMessages: async (sessionId: ID) => {
    const res = await http.get<any>(`/history/${sessionId}`);
    const conversations = res.conversations || [];
    const items: ChatMessage[] = [];
    conversations.forEach((conv: any, index: number) => {
      const content = conv.content || [];
      content.forEach((m: any, idx: number) => {
        const text = Array.isArray(m.content)
          ? (m.content.find((c: any) => c?.type === "text")?.text ?? "")
          : (m.text ?? m.content ?? "");
        items.push({
          id: `${sessionId}_${index}_${idx}`,
          sessionId,
          role: m.role === "user" ? "user" : "assistant",
          content: text,
          createdAt: new Date().toISOString(),
        });
      });
    });
    return { items } as ApiListResponse<ChatMessage>;
  },
  deleteHistory: (sessionId: ID) => http.delete<void>(`/history/${sessionId}`),
  sendMessage: async (params: { sessionId: ID; caseId: ID; patientId: ID; prompt: string; model?: string; model_provider?: string; temperature?: number; top_p?: number; max_tokens?: number; files?: File[] }) => {
    const hasFiles = params.files && params.files.length > 0;
    const body = hasFiles ? new FormData() : undefined;
    if (hasFiles && body) {
      params.files!.forEach((f) => body.append("files", f));
    }
    const res = await http.post<any, FormData | undefined>(`/chat/`, body, {
      query: {
        session_id: params.sessionId,
        case_id: params.caseId,
        patient_id: params.patientId,
        prompt: params.prompt,
        model: params.model,
        model_provider: params.model_provider,
        temperature: params.temperature,
        top_p: params.top_p,
        max_tokens: params.max_tokens,
      },
    });
    const text = res?.response ?? "";
    const msg: ChatMessage = {
      id: uuidv4(),
      sessionId: params.sessionId,
      role: "assistant",
      content: text,
      createdAt: new Date().toISOString(),
    };
    return msg;
  },
};
