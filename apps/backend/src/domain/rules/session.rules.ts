const DAY_MS = 24 * 60 * 60 * 1000;

export const SESSION_MAX_AGE_MS = DAY_MS;

export const sessionCutoff = (now: number): number => now - SESSION_MAX_AGE_MS;
