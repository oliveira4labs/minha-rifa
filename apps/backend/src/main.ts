import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { appConfig } from './config/app.config.js';
import { configureHttp } from './presentation/http/http-server.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: ['error', 'warn'],
  });
  configureHttp(app);
  app.enableShutdownHooks();
  await app.listen(appConfig.port);
  console.log(`Sistema de rifas rodando em http://localhost:${appConfig.port}`);
}

void bootstrap();
