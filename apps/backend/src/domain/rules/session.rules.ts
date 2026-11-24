const DAY_MS = 24 * 60 * 60 * 1000;

/** Sessão vale 24h a partir do login, sem renovação: depois disso, entra com o Google de novo. */
export const SESSION_MAX_AGE_MS = DAY_MS;

export const sessionCutoff = (now: number): number => now - SESSION_MAX_AGE_MS;
