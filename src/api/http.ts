import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";

const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

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

  async function request<TResponse = any, TBody = unknown>(
    path: string,
    { method = "GET", headers, query, body }: RequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const token = getToken();
    const config: AxiosRequestConfig = {
      url: `${path}`,
      baseURL,
      method: method as Method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      params: query,
      data: body,
      withCredentials: true,
    };

    // Auto JSON header for non-FormData bodies
    if (body !== undefined && !(body instanceof FormData)) {
      config.headers = { "Content-Type": "application/json", ...(config.headers || {}) } as any;
    }

    try {
      const res = await axios.request<TResponse>(config);
      return res.data as TResponse;
    } catch (err) {
      const e = err as AxiosError;
      const status = e.response?.status ?? 0;
      const data = e.response?.data ?? e.message;
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
