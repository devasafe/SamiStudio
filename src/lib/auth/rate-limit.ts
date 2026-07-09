import { ApiError } from "@/lib/api/errors";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Rate limit simples em memória (Docs/01 — segurança).
 * Suficiente para a instância única atual; trocar por solução
 * distribuída se o deploy escalar horizontalmente.
 */
export function assertRateLimit(key: string, maxAttempts: number, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > maxAttempts) {
    throw new ApiError(429, "Muitas tentativas. Tente novamente em instantes.");
  }
}
