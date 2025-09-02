import { http } from "./http";
import type { ApiListResponse, ChatMessage, ChatSession, ID } from "@/types/domain";

function toCamelSession(s: any): ChatSession {
  return {
    id: s.session_id ?? s.id,
    patientId: s.patient_id ?? s.patientId,
    caseId: s.case_id ?? s.caseId,
    title: s.title ?? null,
    createdAt: s.created_at ?? s.createdAt,
    updatedAt: s.updated_at ?? s.updatedAt,
  } as ChatSession;
}

function toCamelMessage(m: any): ChatMessage {
  return {
    id: m.message_id ?? m.id,
    sessionId: m.session_id ?? m.sessionId,
    role: m.role,
    content: m.content ?? m.message,
    createdAt: m.created_at ?? m.createdAt,
    attachments: m.attachments,
  } as ChatMessage;
}

export const ChatApi = {
  listSessions: (patientId: ID, caseId: ID) =>
    http
      .get<any>(`/sessions`, { query: { patient_id: patientId, case_id: caseId } })
      .then((res) => ({
        items: (res.items || res || []).map(toCamelSession),
        total: res.total,
        page: res.page,
        pageSize: res.pageSize ?? res.page_size,
      }) as ApiListResponse<ChatSession>),
  startSession: (patientId: ID, caseId: ID, title?: string) =>
    http
      .post<any, undefined>(`/sessions`, undefined, { query: { patient_id: patientId, case_id: caseId, title } })
      .then(toCamelSession),
  listMessages: (sessionId: ID) =>
    http.get<any>(`/history/${sessionId}`).then((res) => ({
      items: (res.items || res || []).map(toCamelMessage),
      total: res.total,
      page: res.page,
      pageSize: res.pageSize ?? res.page_size,
    }) as ApiListResponse<ChatMessage>),
  deleteHistory: (sessionId: ID) => http.delete<void>(`/history/${sessionId}`),
  sendMessage: (params: { sessionId: ID; caseId: ID; patientId: ID; prompt: string; model?: string; model_provider?: string; temperature?: number; top_p?: number; max_tokens?: number }) =>
    http
      .post<any, undefined>(`/chat/`, undefined, {
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
      })
      .then(toCamelMessage),
};
