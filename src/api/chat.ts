import { http } from "./http";
import type { ApiListResponse, ChatMessage, ChatSession, ID, UploadAttachment } from "@/types/domain";

export const ChatApi = {
  listSessions: (_patientId: ID, _caseId: ID) =>
    http.get<ApiListResponse<ChatSession>>(`/sessions`),
  startSession: (_patientId: ID, _caseId: ID, _title?: string) =>
    http.post<ChatSession, { title?: string }>(`/sessions`),
  listMessages: (sessionId: ID) => http.get<ApiListResponse<ChatMessage>>(`/history/${sessionId}`),
  deleteHistory: (sessionId: ID) => http.delete<void>(`/history/${sessionId}`),
  sendMessage: (
    params: {
      sessionId: ID;
      caseId: ID;
      patientId: ID;
      prompt: string;
      model?: string;
      model_provider?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
    }
  ) =>
    http.post<ChatMessage, undefined>(`/chat/`, undefined, {
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
    }),
};
