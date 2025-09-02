import { http } from "./http";
import type { ApiListResponse, CaseRecord, ID } from "@/types/domain";

function toCamelCaseRecord(c: any): CaseRecord {
  return {
    id: c.case_id ?? c.id,
    patientId: c.patient_id ?? c.patientId,
    title: c.case_name ?? c.title,
    description: c.description ?? null,
    status: (c.status as any) ?? "open",
    createdAt: c.created_at ?? c.createdAt,
    updatedAt: c.updated_at ?? c.updatedAt,
  } as CaseRecord;
}

export const CasesApi = {
  listByPatient: (patientId: ID, query?: { page?: number; pageSize?: number }) =>
    http.get<any>(`/cases`, { query: { patient_id: patientId, page: query?.page, page_size: query?.pageSize } }).then((res) => ({
      items: (res.items || res || []).map(toCamelCaseRecord),
      total: res.total,
      page: res.page,
      pageSize: res.pageSize ?? res.page_size,
    }) as ApiListResponse<CaseRecord>),
  get: (id: ID) => http.get<any>(`/cases/${id}`).then(toCamelCaseRecord),
  create: (patientId: ID, body: Partial<CaseRecord> & { caseId?: ID; tags?: string[] }) =>
    http.post<any, undefined>(`/cases`, undefined, {
      query: {
        case_id: body.caseId || body.id,
        patient_id: patientId,
        case_name: body.title,
        description: body.description,
        tags: (body as any).tags,
      },
    }).then(toCamelCaseRecord),
  update: (id: ID, body: Partial<CaseRecord> & { tags?: string[] }) =>
    http
      .put<any, undefined>(`/cases/${id}`, undefined, {
        query: {
          case_name: body.title,
          description: body.description,
          tags: (body as any).tags,
        },
      })
      .then(toCamelCaseRecord),
  remove: (id: ID) => http.delete<void>(`/cases/${id}`),
};
