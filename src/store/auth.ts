
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/domain";
import { AuthApi } from "@/api/auth";
import { setAccessTokenGetter, setRefreshTokenGetter } from "@/api/http";

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<string>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  setToken: (access_token: string | null, refresh_token: string | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      loading: false,
      error: null,
      setToken: (access_token, refresh_token) => {
        if (access_token && refresh_token) { localStorage.setItem("access_token", access_token); localStorage.setItem("refresh_token", refresh_token); }
        else { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); }
        set({ access_token, refresh_token });
        setAccessTokenGetter(() => get().access_token || (typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null));
        setRefreshTokenGetter(() => get().refresh_token || (typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null));
      },
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { access_token, refresh_token } = await AuthApi.login({ email, password });
          if (access_token) localStorage.setItem("access_token", access_token);
          if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
          get().setToken(access_token, refresh_token);
          try {
            const me = await AuthApi.me();
            set({
              user: {
                id: (me as any)?.user?.user_id || (me as any)?.id || "",
                name: (me as any)?.user?.name || (me as any)?.name || "",
                email: (me as any)?.user?.email || (me as any)?.email || "",
                phone: (me as any)?.user?.phone || (me as any)?.phone || null,
                role: (me as any)?.user?.role || (me as any)?.role || null,
                avatarUrl: (me as any)?.user?.avatarUrl || (me as any)?.avatarUrl || null,
              }
            });
          } catch (e: any) {
            const msg = `${e?.status ? e.status + " " : ""}${e?.data?.detail || e?.message || "Login failed"}`;
            set({ error: msg });
            throw e;
          }
        } catch (e: any) {
          console.log(e.data)
          const msg = `${e?.status ? e.status + " " : ""}${e?.data?.detail || e?.message || "Login failed"}`;
          set({ error: msg });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
      register: async (name, email, password, phone) => {
        set({ loading: true, error: null });
        try {
          const { message } = await AuthApi.register({ name, email, password, phone });
          return message;
        } catch (e: any) {
          const msg = `${e?.status ? e.status + " " : ""}${e?.data?.detail || e?.message || "Registration failed"}`;
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
          set({
            user: {
              id: (me as any)?.user?.user_id || (me as any)?.id || "",
              name: (me as any)?.user?.name || (me as any)?.name || "",
              email: (me as any)?.user?.email || (me as any)?.email || "",
              phone: (me as any)?.user?.phone || (me as any)?.phone || null,
              role: (me as any)?.user?.role || (me as any)?.role || null,
              avatarUrl: (me as any)?.user?.avatarUrl || (me as any)?.avatarUrl || null,
            }
          });
        } catch (e: any) {
          // silently ignore if not logged in
        } finally {
          set({ loading: false });
        }
      },
      logout: async () => {
        try {
          await AuthApi.logout();
        } catch (e: any) {
          const msg = `${e?.status ? e.status + " " : ""}${e?.data?.detail || e?.message || "Login failed"}`;
          set({ error: msg });
          throw e;
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        get().setToken(null, null);
        set({ user: null });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.access_token, user: s.user }),
    }
  )
);
