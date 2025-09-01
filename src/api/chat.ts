import { http } from "./http";
import type { ApiListResponse, ChatMessage, ChatSession, ID, UploadAttachment } from "@/types/domain";

export const ChatApi = {
  listSessions: (patientId: ID, caseId: ID) =>
    http.get<ApiListResponse<ChatSession>>(`/patients/${patientId}/cases/${caseId}/sessions`),
  startSession: (patientId: ID, caseId: ID, title?: string) =>
    http.post<ChatSession, { title?: string }>(`/patients/${patientId}/cases/${caseId}/sessions`, { title }),
  listMessages: (sessionId: ID) => http.get<ApiListResponse<ChatMessage>>(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (
    sessionId: ID,
    body: { content: string; attachments?: UploadAttachment[] }
  ) => http.post<ChatMessage, { content: string; attachments?: UploadAttachment[] }>(`/chat/sessions/${sessionId}/messages`, body),
};
