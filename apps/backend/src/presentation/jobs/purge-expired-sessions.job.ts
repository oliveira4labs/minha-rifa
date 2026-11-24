import {
  Injectable, Logger, type OnApplicationBootstrap, type OnApplicationShutdown,
} from '@nestjs/common';
import { PurgeExpiredSessionsUseCase } from '../../application/auth/use-cases/purge-expired-sessions.use-case.js';
import { appConfig } from '../../config/app.config.js';

@Injectable()
export class PurgeExpiredSessionsJob implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(PurgeExpiredSessionsJob.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly purgeExpiredSessions: PurgeExpiredSessionsUseCase) {}

  onApplicationBootstrap(): void {
    const run = () => this.purgeExpiredSessions.execute(Date.now()).catch((err) => this.logger.error(err));
    void run();
    this.timer = setInterval(run, appConfig.purgeExpiredSessionsEveryMs);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }
}
