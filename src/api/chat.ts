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
  listSessions: async (_patientId: ID, caseId: ID) => {
    // Backend expects a session_id query param (option A): /history?session_id=<sessionId>
    // We treat the caseId param from callers as the session identifier to query.
    const res = await http.get<any>(`/history`, {
      query: {
        session_id: caseId,
      },
    });
    const raw = Array.isArray(res)
      ? res
      : (res.sessions || res.items || res.history || []);
    const items: ChatSession[] = (raw as any[]).map(toCamelSession).filter((s) => !!s);
    items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return { items } as ApiListResponse<ChatSession>;
  },
  // Create a new session client-side (server will accept session_id on first message)
  startSession: async (patientId: ID, caseId: ID, title?: string) =>
    toCamelSession({ id: uuidv4(), patient_id: patientId, case_id: caseId, title, time_created: new Date().toISOString(), time_updated: new Date().toISOString() }),
  listMessages: async (sessionId: ID) => {
    // Fetch messages for a session using query param: /history?session_id=<sessionId>
    const res = await http.get<any>(`/history`, { query: { session_id: sessionId } });

    const items: ChatMessage[] = [];

    // Case 1: response contains conversations (each with content array)
    const conversations = res.conversations || res.conversation || [];
    if (Array.isArray(conversations) && conversations.length > 0) {
      conversations.forEach((conv: any, convIdx: number) => {
        const content = conv.content || [];
        const safety = conv.safety || null;
        content.forEach((m: any, idx: number) => {
          const text = Array.isArray(m.content)
            ? (m.content.find((c: any) => c?.type === "text")?.text ?? "")
            : (m.text ?? m.content ?? "");
          const isAssistant = m.role !== "user";
          const createdAt = m.time || m.created_at || m.timestamp || m.time_created || conv.time || res.time || new Date().toISOString();
          items.push({
            id: `${sessionId}_${convIdx}_${idx}`,
            sessionId,
            role: isAssistant ? "assistant" : "user",
            content: text,
            createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString(),
            ...(isAssistant && safety
              ? {
                safetyScore: typeof safety.score === "number" ? safety.score : undefined,
                safetyLevel: typeof safety.safety_level === "string" ? safety.safety_level : undefined,
                safetyJustification: typeof safety.justification === "string" ? safety.justification : undefined,
              }
              : {}),
          });
        });
      });
    }

    // Case 2: response contains flat messages array
    const flat = res.messages || res.items || res.history || [];
    if (Array.isArray(flat) && flat.length > 0) {
      flat.forEach((m: any, idx: number) => {
        const text = m.text ?? m.content ?? (Array.isArray(m.content) ? (m.content.find((c: any) => c?.type === "text")?.text ?? "") : "");
        const isAssistant = (m.role || m.sender || '').toLowerCase() !== 'user';
        const createdAt = m.time || m.created_at || m.timestamp || m.time_created || new Date().toISOString();
        items.push({
          id: `${sessionId}_flat_${idx}`,
          sessionId,
          role: isAssistant ? 'assistant' : 'user',
          content: text,
          createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString(),
          ...(isAssistant && m.safety ? {
            safetyScore: typeof m.safety.score === 'number' ? m.safety.score : undefined,
            safetyLevel: typeof m.safety.safety_level === 'string' ? m.safety.safety_level : undefined,
            safetyJustification: typeof m.safety.justification === 'string' ? m.safety.justification : undefined,
          } : {}),
        });
      });
    }

    // Normalize createdAt and sort messages chronologically
    items.forEach((it) => {
      if (!it.createdAt) it.createdAt = new Date().toISOString();
    });
    items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    return { items } as ApiListResponse<ChatMessage>;
  },
  deleteHistory: (sessionId: ID) => http.delete<void>(`/history`, { query: { session_id: sessionId } }),
  sendMessage: async (params: { sessionId: ID; caseId: ID; patientId: ID; prompt: string; model?: string; model_provider?: string; temperature?: number; top_p?: number; max_tokens?: number; debug?: boolean; files?: File[] }) => {
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
        debug: params.debug,
      },
    });
    const text = res?.response ?? "";
    const safety = res?.safety_score || null;
    const msg: ChatMessage = {
      id: uuidv4(),
      sessionId: params.sessionId,
      role: "assistant",
      content: text,
      createdAt: new Date().toISOString(),
      ...(safety
        ? {
          safetyScore: typeof safety.score === "number" ? safety.score : undefined,
          safetyLevel: typeof safety.safety_level === "string" ? safety.safety_level : undefined,
          safetyJustification: typeof safety.justification === "string" ? safety.justification : undefined,
        }
        : {}),
    };
    return msg;
  },
};
