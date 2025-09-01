import { http } from "./http";
import type { ApiListResponse, ID, Patient } from "@/types/domain";

export const PatientsApi = {
  list: (_query?: { page?: number; pageSize?: number; search?: string }) =>
    http.get<ApiListResponse<Patient>>("/patient"),
  get: (id: ID) => http.get<Patient>(`/patient/${id}`),
  create: (body: Partial<Patient>) =>
    http.post<Patient, undefined>("/patient", undefined, {
      query: {
        patient_id: body.id,
        name: body.name,
        age: body.age,
        gender: body.gender,
        dob: body.dob,
        medical_history: body.medicalHistory,
      },
    }),
  update: (id: ID, body: Partial<Patient>) =>
    http.put<Patient, undefined>(`/patient/${id}`, undefined, {
      query: {
        name: body.name,
        age: body.age,
        gender: body.gender,
        dob: body.dob,
        medical_history: body.medicalHistory,
      },
    }),
  remove: (id: ID) => http.delete<void>(`/patient/${id}`),
};
