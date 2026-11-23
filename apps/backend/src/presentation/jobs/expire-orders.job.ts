import {
  Injectable, Logger, type OnApplicationBootstrap, type OnApplicationShutdown,
} from '@nestjs/common';
import { ExpireOrdersUseCase } from '../../application/orders/use-cases/expire-orders.use-case.js';
import { appConfig } from '../../config/app.config.js';

@Injectable()
export class ExpireOrdersJob implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(ExpireOrdersJob.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly expireOrders: ExpireOrdersUseCase) {}

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => {
      this.expireOrders.execute(Date.now()).catch((err) => this.logger.error(err));
    }, appConfig.expireOrdersEveryMs);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }
}
