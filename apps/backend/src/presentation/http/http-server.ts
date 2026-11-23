import fs from 'node:fs';
import path from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { RequestMethod } from '@nestjs/common';
import express, {
  type NextFunction, type Request, type Response,
} from 'express';
import { appConfig, publicUploadDir } from '../../config/app.config.js';
import { PRIVATE_PHOTOS_ROUTE } from './controllers/private-photos.controller.js';
import type { BodyParserError } from './interfaces/body-parser-error.interface.js';

export const API_PREFIX = 'api';
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

function configureBody(app: NestExpressApplication): void {
  app.use(express.json({ limit: appConfig.maxBodySize, type: () => true }));
  app.use((err: BodyParserError, _req: Request, res: Response, next: NextFunction) => {
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Envio grande demais. Use fotos menores.' });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Requisição inválida.' });
    return next(err);
  });
}

function configureStaticFiles(app: NestExpressApplication): void {
  const { frontendDir } = appConfig;
  const immutable = { maxAge: ONE_YEAR, immutable: true, index: false, fallthrough: false } as const;

  app.use('/uploads/public', express.static(publicUploadDir, immutable));
  app.use('/assets', express.static(path.join(frontendDir, 'assets'), immutable));
  app.use(express.static(frontendDir, { index: false, cacheControl: false, setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));

  const indexHtml = path.join(frontendDir, 'index.html');
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isPage = (req.method === 'GET' || req.method === 'HEAD')
      && !req.path.startsWith(`/${API_PREFIX}/`)
      && !path.extname(req.path);
    if (!isPage) return next();
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexHtml, (err) => err && next());
  });

  if (!fs.existsSync(indexHtml)) {
    console.warn(`Aviso: front não encontrado em ${frontendDir}. Rode "npm run build" na raiz (ou use "npm run dev").`);
  }
}

export function configureHttp(app: NestExpressApplication): void {
  app.setGlobalPrefix(API_PREFIX, { exclude: [{ path: `${PRIVATE_PHOTOS_ROUTE}/:filename`, method: RequestMethod.GET }] });
  app.disable('x-powered-by');
  app.set('etag', false);
  app.use(`/${API_PREFIX}`, (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  configureBody(app);
  configureStaticFiles(app);
}
