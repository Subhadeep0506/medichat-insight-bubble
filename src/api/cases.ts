import { http } from "./http";
import type { ApiListResponse, CaseRecord, ID } from "@/types/domain";

export const CasesApi = {
  listByPatient: (_patientId: ID, _query?: { page?: number; pageSize?: number }) =>
    http.get<ApiListResponse<CaseRecord>>(`/cases`),
  get: (id: ID) => http.get<CaseRecord>(`/cases/${id}`),
  create: (patientId: ID, body: Partial<CaseRecord> & { caseId?: ID; tags?: string[] }) =>
    http.post<CaseRecord, undefined>(`/cases`, undefined, {
      query: {
        case_id: body.caseId || body.id,
        patient_id: patientId,
        case_name: body.title,
        description: body.description,
        tags: (body as any).tags,
      },
    }),
  update: (id: ID, body: Partial<CaseRecord> & { tags?: string[] }) =>
    http.put<CaseRecord, undefined>(`/cases/${id}`, undefined, {
      query: {
        case_name: body.title,
        description: body.description,
        tags: (body as any).tags,
      },
    }),
  remove: (id: ID) => http.delete<void>(`/cases/${id}`),
};
