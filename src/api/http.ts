const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || "";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpClientOptions {
  baseURL?: string;
  getAuthToken?: () => string | null | undefined;
}

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
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

function buildQuery(params?: RequestOptions["query"]) {
  if (!params) return "";
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    s.append(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
}

export function createHttpClient(opts: HttpClientOptions = {}) {
  const base = (opts.baseURL ?? DEFAULT_BASE).replace(/\/$/, "");
  const getToken = opts.getAuthToken ?? (() => null);

  async function request<TResponse = any, TBody = unknown>(
    path: string,
    { method = "GET", headers, query, body }: RequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const token = getToken();
    const url = `${base}${path}${buildQuery(query)}`;
    const isJson = body !== undefined && !(body instanceof FormData);

    const res = await fetch(url, {
      method,
      headers: {
        ...(isJson ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: isJson ? JSON.stringify(body) : (body as any),
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "";
    const isJsonResp = contentType.includes("application/json");
    const data = isJsonResp ? await res.json().catch(() => ({})) : await res.text();

    if (!res.ok) {
      throw new HttpError(`Request failed: ${res.status}`, res.status, data);
    }

    return data as TResponse;
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

export const http = createHttpClient({ getAuthToken: () => (typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null) });
