export interface RateLimitRule {
  bucket: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitWindow {
  count: number;
  resetAt: number;
}
