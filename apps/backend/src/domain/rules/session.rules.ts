const DAY_MS = 24 * 60 * 60 * 1000;

/** Sessão sem uso por esse tempo expira e a pessoa precisa entrar de novo. */
export const SESSION_IDLE_MS = 30 * DAY_MS;

/** Cada uso renova a sessão, mas grava no banco no máximo uma vez nesse intervalo. */
export const SESSION_TOUCH_EVERY_MS = 60 * 60 * 1000;

export const sessionIdleCutoff = (now: number): number => now - SESSION_IDLE_MS;
export const sessionTouchCutoff = (now: number): number => now - SESSION_TOUCH_EVERY_MS;
