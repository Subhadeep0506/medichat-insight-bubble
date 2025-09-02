import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/domain";
import { AuthApi } from "@/api/auth";
import { setAuthTokenGetter } from "@/api/http";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string>;
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
        if (token) localStorage.setItem("access_token", token);
        else localStorage.removeItem("access_token");
        set({ token });
        setAuthTokenGetter(() => get().token || (typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null));
      },
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { access_token, refresh_token } = await AuthApi.login({ email, password });
          if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
          get().setToken(access_token);
          try {
            const me = await AuthApi.me();
            set({ user: me });
          } catch (_) {}
        } catch (e: any) {
          const msg = `${e?.status ? e.status + " " : ""}${e?.data?.message || e?.message || "Login failed"}`;
          set({ error: msg });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { message } = await AuthApi.register({ name, email, password });
          return message;
        } catch (e: any) {
          const msg = `${e?.status ? e.status + " " : ""}${e?.data?.message || e?.message || "Registration failed"}`;
          set({ error: msg });
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
        localStorage.removeItem("refresh_token");
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
