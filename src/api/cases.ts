import { http } from "./http";
import type { ApiListResponse, CaseRecord, ID } from "@/types/domain";
import { v4 as uuidv4 } from "uuid";

function toCamelCaseRecord(c: any): CaseRecord {
  if (!c) return c as CaseRecord;
  return {
    id: c.case_id ?? c.id,
    patientId: c.patient_id ?? c.patientId,
    title: c.case_name ?? c.title,
    description: c.description ?? null,
    status: (c.status as any) ?? "open",
    createdAt: c.time_created ?? c.created_at ?? c.createdAt,
    updatedAt: c.time_updated ?? c.updated_at ?? c.updatedAt,
    tags: c.tags ?? c.tag_list ?? [],
    priority: c.priority ?? undefined,
  } as CaseRecord;
}

export const CasesApi = {
  listByPatient: (patientId: ID) =>
    http.get<any>(`/cases`).then((res) => {
      const items = (res.cases || []).map(toCamelCaseRecord).filter((c) => c.patientId === patientId);
      return { items } as ApiListResponse<CaseRecord>;
    }),
  get: (id: ID) => http.get<any>(`/cases/${id}`).then((res) => toCamelCaseRecord(res.case)),
  create: (patientId: ID, body: Partial<CaseRecord> & { caseId?: ID; tags?: string[] }) =>
    http
      .post<any, undefined>(`/cases`, undefined, {
        query: (() => {
          const params = new URLSearchParams();
          params.set("case_id", String(body.caseId || body.id || uuidv4()));
          params.set("patient_id", String(patientId));
          if (body.title) params.set("case_name", String(body.title));
          if (body.description != null) params.set("description", String(body.description ?? ""));
          const tags = (body as any).tags as string[] | undefined;
          if (Array.isArray(tags)) tags.forEach((t) => params.append("tags", t));
          if ((body as any).priority) params.set("priority", String((body as any).priority));
          return params;
        })(),
      })
      .then((res) => toCamelCaseRecord(res.case)),
  update: (id: ID, body: Partial<CaseRecord> & { tags?: string[] }) =>
    http
      .put<any, undefined>(`/cases/${id}`, undefined, {
        query: (() => {
          const params = new URLSearchParams();
          if (body.title) params.set("case_name", String(body.title));
          if (body.description != null) params.set("description", String(body.description ?? ""));
          const tags = (body as any).tags as string[] | undefined;
          if (tags) tags.forEach((t) => params.append("tags", t));
          if ((body as any).priority) params.set("priority", String((body as any).priority));
          return params;
        })(),
      })
      .then((res) => toCamelCaseRecord(res.case)),
  remove: (id: ID) => http.delete<void>(`/cases/${id}`),
};
