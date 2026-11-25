import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SESSION_MAX_AGE_MS } from '../domain/rules/session.rules.js';

const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://rifa:rifa@localhost:5433/minha_rifa',
  migrateOnBoot: process.env.MIGRATE_ON_BOOT !== 'false',
  dataDir: path.resolve(process.env.DATA_DIR || path.join(BACKEND_ROOT, 'data')),
  frontendDir: path.resolve(process.env.FRONTEND_DIR || path.join(BACKEND_ROOT, '..', 'frontend', 'dist')),
  maxBodySize: '40mb',
  expireOrdersEveryMs: 30_000,
  sessionMaxAgeSeconds: SESSION_MAX_AGE_MS / 1000,
  purgeExpiredSessionsEveryMs: 60 * 60 * 1000,
  privateUploadsAccelPath: process.env.PRIVATE_UPLOADS_ACCEL_PATH || '',
  appUrl: (process.env.APP_URL || `http://localhost:${Number(process.env.PORT) || 3000}`).replace(/\/+$/, ''),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  oauthStateMaxAgeSeconds: 10 * 60,
  // Quantos proxies confiáveis ficam na frente da app (Traefik do Dokploy = 1). Sem isso, req.ip é o IP do proxy
  // e o limite por IP valeria para todo mundo junto. 0 = acesso direto (não confia em X-Forwarded-For).
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  // Limites por IP nas rotas públicas do comprador. Folgados porque operadora de celular (CGNAT) põe muita gente
  // no mesmo IP; servem para frear script, não pessoa clicando.
  cartActionsPerMinute: Number(process.env.CART_ACTIONS_PER_MINUTE) || 120,
  buyerSubmitsPerMinute: Number(process.env.BUYER_SUBMITS_PER_MINUTE) || 20,
};

export const googleRedirectUri = `${appConfig.appUrl}/api/auth/google/callback`;
export const secureCookies = appConfig.appUrl.startsWith('https://');

export const uploadDir = path.join(appConfig.dataDir, 'uploads');
export const publicUploadDir = path.join(uploadDir, 'public');
export const privateUploadDir = path.join(uploadDir, 'private');
