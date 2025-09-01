import { http } from "./http";
import type { User } from "@/types/domain";

export interface LoginRequest { email: string; password: string }
export interface LoginResponse { user: User; token: string }
export interface RegisterRequest { name: string; email: string; password: string }
export interface RegisterResponse { user: User; token: string }

export const AuthApi = {
  login: (body: LoginRequest) => http.post<LoginResponse, LoginRequest>("/auth/login", body),
  register: (body: RegisterRequest) => http.post<RegisterResponse, RegisterRequest>("/auth/register", body),
  me: () => http.get<User>("/auth/me"),
  logout: () => http.post<void, undefined>("/auth/logout"),
};
