import { http } from "./http";
import type { ApiListResponse, ID, Patient } from "@/types/domain";

export const PatientsApi = {
  list: (query?: { page?: number; pageSize?: number; search?: string }) =>
    http.get<ApiListResponse<Patient>>("/patients", { query }),
  get: (id: ID) => http.get<Patient>(`/patients/${id}`),
  create: (body: Partial<Patient>) => http.post<Patient, Partial<Patient>>("/patients", body),
  update: (id: ID, body: Partial<Patient>) => http.put<Patient, Partial<Patient>>(`/patients/${id}`, body),
  remove: (id: ID) => http.delete<void>(`/patients/${id}`),
};
