/**
 * Tiny, typed HTTP client for the Fitness Tracker API.
 *
 * All requests go through the same helper so we have one place to:
 *   - attach the JWT to the Authorization header,
 *   - parse the backend's structured error envelope,
 *   - serialize JSON bodies.
 *
 * Keeping the client dependency-free makes it easy to swap for
 * react-query/SWR later without rewriting individual callers.
 */

const STORAGE_KEY = "fitness-tracker.jwt";

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },
  set(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  // Endpoints that are intentionally unauthenticated (register, login) bypass
  // token injection.
  auth?: boolean;
}

export const request = async <T>(path: string, opts: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const err = (payload?.error ?? {}) as ApiErrorPayload;
    throw new ApiError(
      err.message ?? `Request failed with status ${response.status}`,
      response.status,
      err.code ?? "UNKNOWN",
      err.details
    );
  }

  return payload as T;
};
