import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";

const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || "";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpClientOptions {
  baseURL?: string;
  getAuthToken?: () => string | null | undefined;
}

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined> | URLSearchParams;
  body?: TBody;
}

export class HttpError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

let authTokenGetter: () => string | null | undefined = () =>
  (typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null);
export function setAccessTokenGetter(fn: () => string | null | undefined) {
  authTokenGetter = fn;
}

let refreshTokenGetter: () => string | null | undefined = () =>
  (typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null);
export function setRefreshTokenGetter(fn: () => string | null | undefined) {
  refreshTokenGetter = fn;
}

export function createHttpClient(opts: HttpClientOptions = {}) {
  const baseURL = (opts.baseURL ?? DEFAULT_BASE).replace(/\/$/, "");
  const getToken = opts.getAuthToken ?? authTokenGetter;

  let isRefreshing = false;
  let refreshPromise: Promise<boolean> | null = null;

  async function doRefresh(): Promise<boolean> {
    const refreshToken = refreshTokenGetter ? refreshTokenGetter() : (typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null);
    if (!refreshToken) return false;
    if (isRefreshing && refreshPromise) return refreshPromise;
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        // First try relogin (exchange refresh_token for new access token only)
        try {
          const rel = await axios.post(`${baseURL}/auth/relogin`, { refresh_token: refreshToken }, { headers: { "Content-Type": "application/json" }, timeout: 8000 });
          const rdata = rel?.data || {};
          const newAccessR = rdata.access_token || rdata.token || null;
          const newRefreshR = rdata.refresh_token || null;
          if (newAccessR) {
            if (typeof localStorage !== "undefined") {
              localStorage.setItem("access_token", newAccessR);
              if (newRefreshR) localStorage.setItem("refresh_token", newRefreshR);
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("auth:refreshed", { detail: { access_token: newAccessR, refresh_token: newRefreshR } }));
            }
            return true;
          }
        } catch (e) {
          // Try refresh endpoint to rotate tokens if relogin fails
          try {
            const res = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken }, { headers: { "Content-Type": "application/json" }, timeout: 8000 });
            const data = res?.data || {};
            const newAccess = data.access_token || data.token || null;
            const newRefresh = data.refresh_token || null;
            if (newAccess) {
              if (typeof localStorage !== "undefined") {
                localStorage.setItem("access_token", newAccess);
                if (newRefresh) localStorage.setItem("refresh_token", newRefresh);
              }
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth:refreshed", { detail: { access_token: newAccess, refresh_token: newRefresh } }));
              }
              return true;
            }
          } catch (e2) {
            return false;
          }
        }
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
    // Notify listeners if refresh fails
    refreshPromise!.then((ok) => {
      if (!ok && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:refresh_failed"));
      }
    }).catch(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:refresh_failed"));
      }
    });
    return refreshPromise;
  }

  async function request<TResponse = any, TBody = unknown>(
    path: string,
    { method = "GET", headers, query, body, }: RequestOptions<TBody> = {},
    attempt = 0
  ): Promise<TResponse> {
    const token = getToken();
    const headersFinal = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    // Auto JSON header for non-FormData bodies
    if (body !== undefined && !(body instanceof FormData)) {
      headersFinal["Content-Type"] = headersFinal["Content-Type"] || "application/json";
    }

    const config: AxiosRequestConfig = {
      url: `${path}`,
      baseURL,
      method: method as Method,
      headers: headersFinal,
      params: query,
      data: body,
      withCredentials: true,
    };

    // Ensure JSON bodies are stringified to avoid accidental type transmission
    if (body !== undefined && !(body instanceof FormData) && headersFinal["Content-Type"] === "application/json") {
      try {
        config.data = JSON.stringify(body);
      } catch (e) {
        config.data = body as any;
      }
    }

    // Debug: log outgoing request body for login failures
    try {
      if (typeof window !== "undefined" && path.includes("/auth/login")) {
        console.debug("[http] POST /auth/login body:", config.data);
      }
      const res = await axios.request<TResponse>(config);
      return res.data as TResponse;
    } catch (err) {
      const e = err as AxiosError;
      const status = e.response?.status ?? 0;
      const data = e.response?.data ?? e.message;

      // Try refresh once on 401 or on 403 with invalid/expired token message
      const isInvalidTokenMsg = typeof data === 'string' ? /invalid token|expired/i.test(data) : /invalid token|expired/i.test(JSON.stringify(data || {}));
      if ((status === 401 || (status === 403 && isInvalidTokenMsg)) && attempt === 0) {
        const refreshed = await doRefresh();
        if (refreshed) {
          // retry original request once
          return request<TResponse, TBody>(path, { method, headers, query, body }, attempt + 1);
        }
      }

      throw new HttpError(`Request failed: ${status}`, status, data);
    }
  }

  return {
    get: <T = any>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "GET" }),
    post: <T = any, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>(path, { ...(opts || {}), method: "POST", body }),
    put: <T = any, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>(path, { ...(opts || {}), method: "PUT", body }),
    patch: <T = any, B = unknown>(path: string, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>(path, { ...(opts || {}), method: "PATCH", body }),
    delete: <T = any>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "DELETE" }),
  };
}

export const http = createHttpClient({
  getAuthToken: () => (typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null),
});
