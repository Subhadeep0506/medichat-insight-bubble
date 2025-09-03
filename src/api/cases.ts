
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
        query: {
          case_id: body.caseId || body.id || uuidv4(),
          patient_id: patientId,
          case_name: body.title,
          description: body.description,
          tags: (body as any).tags || [],
        },
      })
      .then((res) => toCamelCaseRecord(res.case)),
  update: (id: ID, body: Partial<CaseRecord> & { tags?: string[] }) =>
    http
      .put<any, undefined>(`/cases/${id}`, undefined, {
        query: {
          case_name: body.title,
          description: body.description,
          tags: (body as any).tags,
        },
      })
      .then((res) => toCamelCaseRecord(res.case)),
  remove: (id: ID) => http.delete<void>(`/cases/${id}`),
};
