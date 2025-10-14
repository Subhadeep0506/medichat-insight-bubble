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
  listSessions: async (patientId: ID, caseId: ID) => {
    const res = await http.get<any>(`/history/sessions`, {
      query: {
        case_id: caseId,
        patient_id: patientId,
      },
    });
    const raw = Array.isArray(res)
      ? res
      : (res.sessions || res.items || res.data || []);
    const items: ChatSession[] = (raw as any[]).map(toCamelSession).filter((s) => !!s);
    items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return { items } as ApiListResponse<ChatSession>;
  },
  startSession: async (patientId: ID, caseId: ID, title?: string) => {
    const newId = uuidv4();
    await http.post(`/history/sessions`, undefined, {
      query: {
        session_id: newId,
        case_id: caseId,
        patient_id: patientId,
        title: title || "New Session",
      },
    });
    return toCamelSession({ id: newId, patient_id: patientId, case_id: caseId, title: title || "New Session", time_created: new Date().toISOString(), time_updated: new Date().toISOString() });
  },
  /**
   * Update session title
   * Calls backend PUT /sessions/{session_id}?title=...
   */
  updateSession: async (sessionId: ID, title: string) => {
    // backend expects title as query param
    return await http.put(`/history/sessions/${sessionId}`, undefined, { query: { title } });
  },
  listMessages: async (sessionId: ID) => {
    const res = await http.get<any>(`/history/messages/${sessionId}`);

    const items: ChatMessage[] = [];

    const conversations = res.conversations || res.conversation || [];
    if (Array.isArray(conversations) && conversations.length > 0) {
      conversations.forEach((conv: any, convIdx: number) => {
        // conv may be a DB SessionMessages object with message_id, content (array), like, feedback, stars
        const serverMessageId = conv.message_id ?? conv.messageId ?? conv.id ?? null;
        const safety = conv.safety || null;
        const likeVal = conv.like ?? null;
        const feedbackVal = conv.feedback ?? null;
        const starsVal = typeof conv.stars === 'number' ? conv.stars : (conv.stars ? Number(conv.stars) : null);

        const content = conv.content || [];
        content.forEach((m: any, idx: number) => {
          const text = Array.isArray(m.content)
            ? (m.content.find((c: any) => c?.type === "text")?.text ?? "")
            : (m.text ?? m.content ?? "");
          const isAssistant = m.role !== "user";
          const createdAt = m.time || m.created_at || m.timestamp || m.time_created || conv.timestamp || conv.time || res.time || new Date().toISOString();
          items.push({
            id: `${sessionId}_${convIdx}_${idx}`,
            sessionId: sessionId,
            role: isAssistant ? "assistant" : "user",
            content: text,
            createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString(),
            serverMessageId: serverMessageId,
            like: likeVal,
            feedback: feedbackVal,
            stars: starsVal,
            ...(isAssistant && safety
              ? {
                safetyScore: typeof safety.score === "number" ? safety.score : undefined,
                safetyLevel: typeof safety.safety_level === "string" ? safety.safety_level : undefined,
                safetyJustification: typeof safety.justification === "string" ? safety.justification : undefined,
              }
              : {}),
          } as ChatMessage);
        });
      });
    }

    const flat = res.messages || res.items || res.history || [];
    if (Array.isArray(flat) && flat.length > 0) {
      flat.forEach((m: any, idx: number) => {
        const text = m.text ?? m.content ?? (Array.isArray(m.content) ? (m.content.find((c: any) => c?.type === "text")?.text ?? "") : "");
        const isAssistant = (m.role || m.sender || '').toLowerCase() !== 'user';
        const createdAt = m.time || m.created_at || m.timestamp || m.time_created || new Date().toISOString();
        const serverMessageId = m.message_id ?? m.messageId ?? m.id ?? null;
        const likeVal = m.like ?? null;
        const feedbackVal = m.feedback ?? null;
        const starsVal = typeof m.stars === 'number' ? m.stars : (m.stars ? Number(m.stars) : null);
        items.push({
          id: `${sessionId}_flat_${idx}`,
          sessionId,
          role: isAssistant ? 'assistant' : 'user',
          content: text,
          createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString(),
          serverMessageId,
          like: likeVal,
          feedback: feedbackVal,
          stars: starsVal,
          ...(isAssistant && m.safety ? {
            safetyScore: typeof m.safety.score === 'number' ? m.safety.score : undefined,
            safetyLevel: typeof m.safety.safety_level === 'string' ? m.safety.safety_level : undefined,
            safetyJustification: typeof m.safety.justification === 'string' ? m.safety.justification : undefined,
          } : {}),
        } as ChatMessage);
      });
    }

    items.forEach((it) => {
      if (!it.createdAt) it.createdAt = new Date().toISOString();
    });
    items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    return { items } as ApiListResponse<ChatMessage>;
  },
  deleteHistory: (sessionId: ID) => http.delete<void>(`/history/session/${sessionId}`),
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

  // Like or dislike a message. action can be 'like' | 'dislike' | null to clear
  likeMessage: async (serverMessageId: string | null | undefined, action: string | null) => {
    if (!serverMessageId) throw new Error('Message id missing');
    // backend expects a query param named `like` - pass the action string or null
    const queryVal = action === null ? null : action;
    return await http.post(`/chat/like-message/${encodeURIComponent(String(serverMessageId))}`, undefined, { query: { like: queryVal } });
  },

  // Edit feedback for a message (uses PUT /chat/edit-feedback/{message_id})
  editFeedback: async (serverMessageId: string | null | undefined, feedback?: string | null, stars?: number | null) => {
    if (!serverMessageId) throw new Error('Message id missing');
    return await http.put(`/chat/edit-feedback/${encodeURIComponent(String(serverMessageId))}`, undefined, { query: { feedback: feedback ?? null, stars: stars ?? null } });
  },
};
