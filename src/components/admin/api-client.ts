"use client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export class AdminApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AdminApiError";
    this.statusCode = statusCode;
  }
}

/** Cliente da API v1 para o painel (cookies de sessão inclusos). */
export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<ApiEnvelope<T>> {
  const { json, ...rest } = init ?? {};
  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    credentials: "same-origin",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !envelope.success) {
    // Sessão expirada: volta para o login.
    if (response.status === 401 && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
    throw new AdminApiError(envelope.error ?? envelope.message, response.status);
  }
  return envelope;
}
