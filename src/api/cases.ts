import { http } from "./http";
import type { ApiListResponse, CaseRecord, ID } from "@/types/domain";

export const CasesApi = {
  listByPatient: (patientId: ID, query?: { page?: number; pageSize?: number }) =>
    http.get<ApiListResponse<CaseRecord>>(`/patients/${patientId}/cases`, { query }),
  get: (id: ID) => http.get<CaseRecord>(`/cases/${id}`),
  create: (patientId: ID, body: Partial<CaseRecord>) =>
    http.post<CaseRecord, Partial<CaseRecord>>(`/patients/${patientId}/cases`, body),
  update: (id: ID, body: Partial<CaseRecord>) => http.put<CaseRecord, Partial<CaseRecord>>(`/cases/${id}`, body),
  remove: (id: ID) => http.delete<void>(`/cases/${id}`),
};
