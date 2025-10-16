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
  setToken: (access_token: string | null | undefined, refresh_token?: string | null | undefined) => void;
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
        const currentState = get();
        const normalizedAccess = access_token ?? null;
        const normalizedRefresh = refresh_token === undefined ? currentState.refresh_token : (refresh_token ?? null);

        if (typeof localStorage !== "undefined") {
          if (normalizedAccess) localStorage.setItem("access_token", normalizedAccess);
          else localStorage.removeItem("access_token");

          if (normalizedRefresh) localStorage.setItem("refresh_token", normalizedRefresh);
          else localStorage.removeItem("refresh_token");
        }

        set({ access_token: normalizedAccess, refresh_token: normalizedRefresh });
        setAccessTokenGetter(() => get().access_token || (typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null));
        setRefreshTokenGetter(() => get().refresh_token || (typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null));
      },
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // Coerce and validate inputs to avoid sending non-string types
          const emailStr = typeof email === 'string' ? email : String(email || '');
          const passwordStr = typeof password === 'string' ? password : String(password || '');
          if (!emailStr || !passwordStr) throw new Error('Invalid credentials');
          const { access_token, refresh_token } = await AuthApi.login({ email: emailStr, password: passwordStr });
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
            const msg = e.data.detail;
            set({ error: msg });
            throw e;
          }
        } catch (e: any) {
          console.log(e.data)
          const msg = e.data.detail;
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
          const msg = e.data.detail
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
          const msg = e.data.detail;
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
      partialize: (state) => ({
        access_token: state.access_token ?? null,
        refresh_token: state.refresh_token ?? null,
        user: state.user ?? null,
      }),
      version: 1,
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState;
        if (!version || version < 1) {
          return {
            access_token: persistedState.access_token ?? persistedState.token ?? null,
            refresh_token: persistedState.refresh_token ?? null,
            user: persistedState.user ?? null,
          };
        }
        return {
          access_token: persistedState.access_token ?? null,
          refresh_token: persistedState.refresh_token ?? null,
          user: persistedState.user ?? null,
        };
      },
    }
  )
);

// Listen for token refresh events emitted by the HTTP client and update the auth store
if (typeof window !== "undefined") {
  window.addEventListener("auth:refreshed", (ev: any) => {
    try {
      const detail = ev?.detail || {};
      const access = detail?.access_token || null;
      const refresh = detail?.refresh_token || null;
      if (access) {
        const fallbackRefresh =
          refresh ??
          useAuthStore.getState().refresh_token ??
          (typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null);
        useAuthStore.getState().setToken(access, fallbackRefresh ?? undefined);
      }
    } catch (e) {
      // ignore
    }
  });

  // On refresh failure, clear auth and user state to force re-login
  window.addEventListener("auth:refresh_failed", () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      useAuthStore.getState().setToken(null, null);
      useAuthStore.getState().setUser(null as any);
    } catch (e) {
      // ignore
    }
  });
}
