import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/domain";
import { AuthApi } from "@/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      setToken: (token) => {
        if (token) localStorage.setItem("auth_token", token);
        else localStorage.removeItem("auth_token");
        set({ token });
      },
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { user, token } = await AuthApi.login({ email, password });
          get().setToken(token);
          set({ user });
        } catch (e: any) {
          set({ error: e?.data?.message || e?.message || "Login failed" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { user, token } = await AuthApi.register({ name, email, password });
          get().setToken(token);
          set({ user });
        } catch (e: any) {
          set({ error: e?.data?.message || e?.message || "Registration failed" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
      fetchMe: async () => {
        set({ loading: true, error: null });
        try {
          const me = await AuthApi.me();
          set({ user: me });
        } catch (e: any) {
          // silently ignore if not logged in
        } finally {
          set({ loading: false });
        }
      },
      logout: async () => {
        try {
          await AuthApi.logout();
        } catch (_) {}
        get().setToken(null);
        set({ user: null });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
