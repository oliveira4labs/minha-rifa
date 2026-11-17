import path from 'node:path';
import { fileURLToPath } from 'node:url';

// src/config (ou dist/config depois do build) → raiz de apps/backend
const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  /** Conexão com o Postgres (o docker-compose sobe um na porta 5433). */
  databaseUrl: process.env.DATABASE_URL || 'postgres://rifa:rifa@localhost:5433/minha_rifa',
  /** Fotos enviadas (uploads/). Em produção, aponte para um disco/volume persistente. */
  dataDir: path.resolve(process.env.DATA_DIR || path.join(BACKEND_ROOT, 'data')),
  /** Build do front (React/Vite), servido pelo próprio backend. */
  frontendDir: path.resolve(process.env.FRONTEND_DIR || path.join(BACKEND_ROOT, '..', 'frontend', 'dist')),
  /** Corpo máximo das requisições (fotos vão em base64 no JSON). */
  maxBodySize: '40mb',
  /** Intervalo da liberação automática de reservas vencidas. */
  expireOrdersEveryMs: 30_000,
  sessionMaxAgeSeconds: 60 * 60 * 24 * 30,
};

export const uploadDir = path.join(appConfig.dataDir, 'uploads');
