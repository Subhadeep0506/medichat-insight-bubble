
import { http } from "./http";
import type { ApiListResponse, ID, Patient } from "@/types/domain";
import { v4 as uuidv4 } from "uuid";

function toCamelPatient(p: any): Patient {
  if (!p) return p as Patient;
  return {
    id: p.patient_id ?? p.id,
    name: p.name,
    age: p.age ?? null,
    gender: p.gender,
    dob: p.dob ?? p.date_of_birth ?? null,
    height: p.height ?? null,
    weight: p.weight ?? null,
    medicalHistory: p.medical_history ?? p.medicalHistory ?? null,
    createdAt: p.time_created ?? p.created_at ?? p.createdAt,
    updatedAt: p.time_updated ?? p.updated_at ?? p.updatedAt,
  } as Patient;
}

export const PatientsApi = {
  list: () =>
    http.get<any>("/patient").then((res) => ({
      items: (res.patients || []).map(toCamelPatient),
    }) as ApiListResponse<Patient>),
  get: (id: ID) => http.get<any>(`/patient/${id}`).then((res) => toCamelPatient(res.patient)),
  create: (body: Partial<Patient>) =>
    http
      .post<any, undefined>("/patient", undefined, {
        query: {
          patient_id: body.id || uuidv4(),
          name: body.name,
          age: body.age,
          gender: body.gender,
          dob: body.dob,
          medical_history: body.medicalHistory,
        },
      })
      .then((res) => toCamelPatient(res.patient)),
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
      .then((res) => toCamelPatient(res.patient)),
  remove: (id: ID) => http.delete<void>(`/patient/${id}`),
};
