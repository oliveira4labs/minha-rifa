import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://rifa:rifa@localhost:5433/minha_rifa',
  migrateOnBoot: process.env.MIGRATE_ON_BOOT !== 'false',
  dataDir: path.resolve(process.env.DATA_DIR || path.join(BACKEND_ROOT, 'data')),
  frontendDir: path.resolve(process.env.FRONTEND_DIR || path.join(BACKEND_ROOT, '..', 'frontend', 'dist')),
  maxBodySize: '40mb',
  expireOrdersEveryMs: 30_000,
  sessionMaxAgeSeconds: 60 * 60 * 24 * 30,
  privateUploadsAccelPath: process.env.PRIVATE_UPLOADS_ACCEL_PATH || '',
  appUrl: (process.env.APP_URL || `http://localhost:${Number(process.env.PORT) || 3000}`).replace(/\/+$/, ''),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  oauthStateMaxAgeSeconds: 10 * 60,
};

export const googleRedirectUri = `${appConfig.appUrl}/api/auth/google/callback`;
export const secureCookies = appConfig.appUrl.startsWith('https://');

export const uploadDir = path.join(appConfig.dataDir, 'uploads');
export const publicUploadDir = path.join(uploadDir, 'public');
export const privateUploadDir = path.join(uploadDir, 'private');
