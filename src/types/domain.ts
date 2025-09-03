export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  role?: string | null;
}

export interface Patient {
  id: ID;
  name: string;
  age?: number | null;
  gender?: "male" | "female" | "other" | "unknown";
  dob?: string | null; // ISO date string
  height?: string | null;
  weight?: string | null;
  medicalHistory?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseRecord {
  id: ID;
  patientId: ID;
  title: string;
  description?: string | null;
  status: "open" | "closed" | "on_hold";
  createdAt?: string;
  updatedAt?: string;
}

export type Role = "user" | "admin" | "clinician";

export interface ChatSession {
  id: ID;
  patientId: ID;
  caseId: ID;
  title?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: ID;
  sessionId: ID;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  attachments?: UploadAttachment[];
  safetyScore?: number;
  safetyLevel?: string;
  safetyJustification?: string;
}

export interface UploadAttachment {
  id: ID;
  type: "image" | "pdf" | "other";
  url: string;
  name?: string;
  size?: number;
}

export interface ApiListResponse<T> {
  items: T[];
}
