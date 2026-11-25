export interface RateLimitRule {
  /** Rotas com o mesmo bucket dividem o mesmo contador por IP. */
  bucket: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitWindow {
  count: number;
  resetAt: number;
}
