const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const recognitionLimits = new Map<string, RateLimitEntry>();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

/** In-memory per-user recognition rate limit (single-instance safe). */
export function checkRecognitionRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const entry = recognitionLimits.get(userId);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    recognitionLimits.set(userId, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - entry.windowStart),
    };
  }

  entry.count += 1;
  return { allowed: true };
}

export function getRecognitionRateLimitConfig() {
  return {
    windowMs: WINDOW_MS,
    maxRequestsPerWindow: MAX_REQUESTS_PER_WINDOW,
  };
}
