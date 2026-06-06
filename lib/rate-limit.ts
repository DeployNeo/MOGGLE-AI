export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function checkLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit: max, remaining: max - 1, reset: now + windowMs };
  }

  if (bucket.count >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    success: true,
    limit: max,
    remaining: max - bucket.count,
    reset: bucket.resetAt,
  };
}

export async function rateLimitAnalyze(identifier: string): Promise<RateLimitResult> {
  return checkLimit(`analyze:${identifier}`, 10, 60_000);
}

export async function rateLimitApi(identifier: string): Promise<RateLimitResult> {
  return checkLimit(`api:${identifier}`, 60, 60_000);
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  if (result.limit === 0) return {};
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}
