import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { USE_CASES } from './application/index.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { AuthController } from './presentation/http/controllers/auth.controller.js';
import { OrdersController } from './presentation/http/controllers/orders.controller.js';
import { PrivatePhotosController } from './presentation/http/controllers/private-photos.controller.js';
import { RemoteConfigController } from './presentation/http/controllers/remote-config.controller.js';
import { PublicRaffleController } from './presentation/http/controllers/public-raffle.controller.js';
import { RafflesController } from './presentation/http/controllers/raffles.controller.js';
import { ApiExceptionFilter } from './presentation/http/filters/api-exception.filter.js';
import { AuthGuard } from './presentation/http/guards/auth.guard.js';
import { RateLimitGuard } from './presentation/http/guards/rate-limit.guard.js';
import { ExpireOrdersInterceptor } from './presentation/http/interceptors/expire-orders.interceptor.js';
import { dtoValidationPipe } from './presentation/http/pipes/dto-validation.pipe.js';
import { ExpireOrdersJob } from './presentation/jobs/expire-orders.job.js';
import { PurgeExpiredSessionsJob } from './presentation/jobs/purge-expired-sessions.job.js';

@Module({
  imports: [InfrastructureModule],
  controllers: [AuthController, RafflesController, OrdersController, PublicRaffleController, PrivatePhotosController, RemoteConfigController],
  providers: [
    ...USE_CASES,
    AuthGuard,
    RateLimitGuard,
    ExpireOrdersJob,
    PurgeExpiredSessionsJob,
    { provide: APP_PIPE, useValue: dtoValidationPipe },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ExpireOrdersInterceptor },
  ],
})
export class AppModule {}
