import { http } from "./http";
import type { User } from "@/types/domain";
import { v4 as uuidv4 } from 'uuid';
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { access_token: string; refresh_token?: string }
export interface RegisterRequest { name: string; email: string; password: string; user_id?: string; phone?: string; role?: string }
export interface RegisterResponse { message: string }

export const AuthApi = {
  login: (body: LoginRequest) =>
    http.post<LoginResponse, LoginRequest>("/auth/login", { email: String(body.email), password: String(body.password) }),
  register: (body: RegisterRequest) =>
    http.post<RegisterResponse, RegisterRequest>("/auth/register", {
      user_id: uuidv4(),
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone,
      role: body.role,
    }),
  me: () => http.get<any>("/users/me"),
  relogin: (refresh_token: string) => http.post<LoginResponse, { refresh_token: string }>("/auth/relogin", { refresh_token }),
  refresh: (refresh_token: string) => http.post<LoginResponse, { refresh_token: string }>("/auth/refresh", { refresh_token }),
  logout: () => http.post<void, undefined>("/auth/logout"),
};
