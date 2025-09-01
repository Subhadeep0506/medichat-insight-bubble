import { http } from "./http";
import type { User } from "@/types/domain";

export interface LoginRequest { email: string; password: string }
export interface LoginResponse { access_token: string; refresh_token: string }
export interface RegisterRequest { name: string; email: string; password: string; user_id?: string; phone?: string; role?: string }
export interface RegisterResponse { user: User; token: string }

export const AuthApi = {
  login: (body: LoginRequest) => http.post<LoginResponse, undefined>("/auth/login", undefined, { query: { email: body.email, password: body.password } }),
  register: (body: RegisterRequest) =>
    http.post<RegisterResponse, undefined>("/auth/register", undefined, {
      query: {
        user_id: body.user_id,
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone,
        role: body.role,
      },
    }),
  me: () => http.get<User>("/users/me"),
  refresh: (refresh_token: string) => http.post<{ token: string }, undefined>("/auth/refresh", undefined, { query: { refresh_token } }),
  logout: () => http.post<void, undefined>("/auth/logout"),
};
