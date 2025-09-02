import { http } from "./http";
import type { ApiListResponse, ID, Patient } from "@/types/domain";

function toCamelPatient(p: any): Patient {
  return {
    id: p.patient_id ?? p.id,
    name: p.name,
    age: p.age ?? null,
    gender: p.gender,
    dob: p.dob ?? p.date_of_birth ?? null,
    height: p.height ?? null,
    weight: p.weight ?? null,
    medicalHistory: p.medical_history ?? p.medicalHistory ?? null,
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.updated_at ?? p.updatedAt,
  } as Patient;
}

export const PatientsApi = {
  list: () =>
    http
      .get<any>("/patient")
      .then((res) => ({
        items: res.items || [],
      }) as ApiListResponse<Patient>),
  get: (id: ID) => http.get<any>(`/patient/${id}`).then(toCamelPatient),
  create: (body: Partial<Patient>) =>
    http
      .post<any, undefined>("/patient", undefined, {
        query: {
          patient_id: body.id,
          name: body.name,
          age: body.age,
          gender: body.gender,
          dob: body.dob,
          medical_history: body.medicalHistory,
        },
      })
      .then(toCamelPatient),
  update: (id: ID, body: Partial<Patient>) =>
    http
      .put<any, undefined>(`/patient/${id}`, undefined, {
        query: {
          name: body.name,
          age: body.age,
          gender: body.gender,
          dob: body.dob,
          medical_history: body.medicalHistory,
        },
      })
      .then(toCamelPatient),
  remove: (id: ID) => http.delete<void>(`/patient/${id}`),
};
